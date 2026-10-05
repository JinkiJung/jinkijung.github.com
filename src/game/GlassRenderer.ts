import type { SnapshotTile } from './snapshotTiles';
import type { GlassOwner } from '../leaderboard/evidence';
import { PENALTY_COLORS, type PenaltyRegion } from './penalties';
import { createCareerUnlocks } from './careerUnlocks';
import { MELEE_RADIUS, type MeleeRay } from './melee';
import { visibleIceRect, type IceRegion } from './ice';
import { reflectTriangle, rectTouchesTriangle, circleTouchesTriangle, partition, segmentRect, segmentTriangle, inImpactRadius, type Rect } from './geometry';

type Shard = { tile: number; points: number[]; cx: number; cy: number; x: number; y: number; vx: number; vy: number; angle: number; spin: number; life: number; id: number; bounds: Rect; area: number };
const VERTEX = `attribute vec2 a_position; attribute vec2 a_uv; attribute float a_alpha;
uniform vec2 u_size; uniform float u_camera; varying vec2 v_uv; varying float v_alpha;
void main(){gl_Position=vec4((a_position-vec2(0.,u_camera))/u_size*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);v_uv=a_uv;v_alpha=a_alpha;}`;
const FRAGMENT = `precision mediump float; uniform sampler2D u_texture; uniform float u_hazard; uniform vec2 u_world; varying vec2 v_uv; varying float v_alpha;
void main(){if(u_hazard>0.5){float stripe=step(0.5,fract((v_uv.x*u_world.x+v_uv.y*u_world.y*0.65)/48.));gl_FragColor=vec4(mix(vec3(0.095),vec3(1.,0.74,0.),stripe),1.);return;}vec4 c=texture2D(u_texture,v_uv);gl_FragColor=vec4(c.rgb,c.a*v_alpha);}`;

export class GlassRenderer {
  brokenArea = 0;
  brokenCount = 0;
  readonly totalArea: number;
  onDestroy?: (id: number, area: number, owner: GlassOwner) => void;
  private owner: GlassOwner = 'npc';

  attributed(owner: GlassOwner, destroy: () => void) {
    const previous = this.owner;
    this.owner = owner;
    try { destroy(); } finally { this.owner = previous; }
  }
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private textures = new Map<number, WebGLTexture>();
  private fallbackTexture: WebGLTexture;
  private shards: Shard[] = [];
  private data: Float32Array;
  private live = 0;
  private shardBuckets = new Map<string, Shard[]>();
  private shardReach = 0;
  private careerUnlocks: ReturnType<typeof createCareerUnlocks>;
  private hazardLocation: WebGLUniformLocation | null;
  private hazardVertices = new Float32Array(30);
  private cameraLocation: WebGLUniformLocation | null;

  constructor(canvas: HTMLCanvasElement, private tiles: SnapshotTile[], readonly width: number, readonly height: number, targets: Rect[], private viewportHeight = height, private iceRegions: IceRegion[] = [], stageFloors: Rect[] = [], private careerRegions: IceRegion[] = [], private penaltyRegions: PenaltyRegion[] = []) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WEBGL_UNAVAILABLE');
    this.gl = gl;
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); throw new Error('SHADER_FAILED'); }
      return s;
    };
    const vs = shader(gl.VERTEX_SHADER, VERTEX), fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs); gl.attachShader(this.program, fs); gl.linkProgram(this.program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) { gl.deleteProgram(this.program); throw new Error('GRAPHICS_FAILED'); }
    gl.useProgram(this.program);
    this.buffer = gl.createBuffer()!;
    this.fallbackTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.fallbackTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
    gl.uniform2f(gl.getUniformLocation(this.program, 'u_size'), width, viewportHeight);
    this.hazardLocation = gl.getUniformLocation(this.program, 'u_hazard');
    gl.uniform2f(gl.getUniformLocation(this.program, 'u_world'), width, height);
    this.cameraLocation = gl.getUniformLocation(this.program, 'u_camera');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    for (const [name, count, offset] of [['a_position', 2, 0], ['a_uv', 2, 8], ['a_alpha', 1, 16]] as const) {
      const loc = gl.getAttribLocation(this.program, name);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, count, gl.FLOAT, false, 20, offset);
    }
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.055, 0.078, 0.09, 1);
    const ratio = Math.min(devicePixelRatio, 1.5, 2048 / Math.max(width, viewportHeight));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(viewportHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const cells = partition(width, height, [...targets, ...tiles.map((t,id)=>({x:0,y:t.y,w:width,h:t.height,id:-3000000-id})), ...careerRegions.map((r,id)=>({...r,id:-100000-id}))]);
    for (const r of cells) {
      const mx = r.x + r.w * (.25 + Math.random() * .5), my = r.y + r.h * (.25 + Math.random() * .5);
      const corners = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
      for (let i = 0; i < 4; i++) {
        const points = [...corners[i], ...corners[(i + 1) % 4], mx, my];
        const cx = (points[0] + points[2] + mx) / 3, cy = (points[1] + points[3] + my) / 3;
        this.shards.push({ tile: tiles.findIndex(t => cy >= t.y && cy < t.y+t.height), points, cx, cy, x: 0, y: 0, vx: 0, vy: 0, angle: 0, spin: 0, life: stageFloors.some(f => cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h) ? -2 : -1, id: this.shards.length, bounds: r, area: Math.abs((points[2] - points[0]) * (my - points[1]) - (points[3] - points[1]) * (mx - points[0])) / 2 });
      }
    }
    this.totalArea = this.shards.reduce((sum, shard) => sum + (shard.life === -1 ? shard.area : 0), 0);
    for(const shard of this.shards){
      const key=`${Math.floor(shard.cx/128)},${Math.floor(shard.cy/128)}`;
      const bucket=this.shardBuckets.get(key)??[];bucket.push(shard);this.shardBuckets.set(key,bucket);
      for(let i=0;i<6;i+=2)this.shardReach=Math.max(this.shardReach,Math.hypot(shard.points[i]-shard.cx,shard.points[i+1]-shard.cy));
    }
    this.careerUnlocks = createCareerUnlocks(careerRegions.map(r => this.shards.filter(s =>
      s.life === -1 && s.cx >= r.x && s.cx < r.x+r.w && s.cy >= r.y && s.cy < r.y+r.h
    ).map(s => ({id:s.id,area:s.area}))));
    this.data = new Float32Array(this.shards.length * 15);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
  }

  hitTest(x: number, y: number, dx: number, dy: number) {
    let t = Infinity, id = -1;
    for (const s of this.shards) {
      if (s.life !== -1 || segmentRect(x, y, dx, dy, s.bounds) > t) continue;
      const hit = segmentTriangle(x, y, dx, dy, s.points);
      if (hit < t) { t = hit; id = s.id; }
    }
    return { t, id };
  }

  reflectShard(id: number, x: number, y: number, vx: number, vy: number) {
    return reflectTriangle(this.shards[id].points, x, y, vx, vy);
  }

  shatter(id: number, x: number, y: number) {
    // Damage stays local to the impact. A later bullet travels through the hole
    // and chips away at the next intact triangle, even in the same component.
    for (const s of this.shards) if (s.life === -1 && (s.id === id || inImpactRadius(s.cx, s.cy, x, y))) {
      this.detach(s, x, y);
    }
  }

  shatterFan(x: number, y: number, rays: MeleeRay[], radius = MELEE_RADIUS) {
    for (const s of this.shards) {
      const r = s.bounds;
      if (s.life !== -1 || x + radius < r.x || x - radius > r.x + r.w || y + radius < r.y || y - radius > r.y + r.h) continue;
      if (rays.some(ray => segmentTriangle(x, y, ray.dx, ray.dy, s.points) <= 1)) this.detach(s, x, y);
    }
  }

  crushStrip(rect: Rect) {
    // Clear body-radius margins too, so feet do not catch glass at slab edges.
    const area = { x: rect.x - 20, y: rect.y - 20, w: rect.w + 40, h: rect.h + 40 };
    for (const s of this.shards) {
      if (s.life !== -1 || s.bounds.x > area.x + area.w || s.bounds.x + s.bounds.w < area.x || s.bounds.y > area.y + area.h || s.bounds.y + s.bounds.h < area.y) continue;
      if (rectTouchesTriangle(area, s.points)) this.detach(s, rect.x + rect.w / 2, rect.y + rect.h);
    }
  }

  private touches(s: Shard, x: number, y: number, radius: number) {
    const r = s.bounds;
    return s.life === -1 && x + radius >= r.x && x - radius <= r.x + r.w && y + radius >= r.y && y - radius <= r.y + r.h && circleTouchesTriangle(x, y, radius, s.points);
  }

  private *nearbyShards(x:number,y:number,radius:number) {
    const reach=radius+this.shardReach;
    for(let row=Math.floor((y-reach)/128);row<=Math.floor((y+reach)/128);row++)
      for(let col=Math.floor((x-reach)/128);col<=Math.floor((x+reach)/128);col++){
        const bucket=this.shardBuckets.get(`${col},${row}`);
        if(bucket)yield* bucket;
      }
  }

  canStand(x: number, y: number, radius = 20) {
    for(const s of this.nearbyShards(x,y,radius))if(this.touches(s,x,y,radius))return false;
    return true;
  }

  // Open the supporting floor before moving into it. Text is a separate solid
  // layer and is checked by the caller before any excavation is permitted.
  openFootprint(x: number, y: number, radius = 20) {
    for (const s of this.nearbyShards(x,y,radius)) if (this.touches(s, x, y, radius)) this.detach(s, x, y);
  }

  careerUnlocked(index: number) { return this.careerUnlocks.unlocked(index); }

  private detach(s: Shard, x: number, y: number) {
    if (s.life !== -1) return;
    this.brokenCount++;
    this.brokenArea += s.area;
    this.onDestroy?.(s.id, s.area, this.owner);
    if (this.live >= 650) s.life = 0;
    else {
    const angle = Math.atan2(s.cy - y, s.cx - x);
    const speed = 90 + Math.random() * 230;
    s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed - 120;
    s.spin = (Math.random() - .5) * 7; s.life = .7 + Math.random() * .6; this.live++;
    }
    for (const id of this.careerUnlocks.detach(s.id)) this.detach(this.shards[id], x, y);
  }

  render(dt: number, cameraY = 0) {
    let offset = 0;
    const batches = new Map<number, {start:number; end:number}>();
    for (const s of this.shards) {
      if (s.life === 0) continue;
      let alpha = 1;
      if (s.life > 0) {
        s.life = Math.max(0, s.life - dt);
        if (!s.life) { this.live--; continue; }
        s.vy += 580 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.angle += s.spin * dt;
        alpha = Math.min(1, s.life * 2.8);
      }
      // Update debris everywhere, but only upload triangles near the viewport.
      if (s.cy + s.y < cameraY - 120 || s.cy + s.y > cameraY + this.viewportHeight + 120) continue;
      const tile = this.tiles[s.tile];
      let batch = batches.get(s.tile);
      if (!batch) { batch = { start: offset, end: offset }; batches.set(s.tile, batch); }
      const cos = Math.cos(s.angle), sin = Math.sin(s.angle);
      const scale = s.life < 0 ? 1 : .975;
      for (let i = 0; i < 6; i += 2) {
        const px = (s.points[i] - s.cx) * scale, py = (s.points[i + 1] - s.cy) * scale;
        this.data[offset++] = s.cx + s.x + px * cos - py * sin;
        this.data[offset++] = s.cy + s.y + px * sin + py * cos;
        this.data[offset++] = s.points[i] / this.width;
        this.data[offset++] = (s.points[i + 1] - tile.y) / tile.height;
        this.data[offset++] = alpha;
      }
      batch.end = offset;
    }
    const gl = this.gl;
    gl.uniform1f(this.cameraLocation, cameraY);
    gl.clearColor(0.055, 0.078, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Colored floor is behind intact page triangles and shares world coordinates.
    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(20 / 255, 95 / 255, 150 / 255, 1);
    const sx = gl.drawingBufferWidth / this.width, sy = gl.drawingBufferHeight / this.viewportHeight;
    for (const region of this.iceRegions) {
      const rect = visibleIceRect(region, cameraY, this.width, this.viewportHeight);
      if (!rect) continue;
      const left = Math.floor(rect.x * sx), right = Math.ceil((rect.x + rect.w) * sx);
      const bottom = Math.floor((this.viewportHeight - rect.y - rect.h) * sy), top = Math.ceil((this.viewportHeight - rect.y) * sy);
      gl.scissor(left, bottom, right - left, top - bottom); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    for(const region of this.penaltyRegions){
      const rect=visibleIceRect(region,cameraY,this.width,this.viewportHeight);if(!rect)continue;
      const c=PENALTY_COLORS[region.kind];gl.clearColor(c[0],c[1],c[2],1);
      const left=Math.floor(rect.x*sx),right=Math.ceil((rect.x+rect.w)*sx);
      const bottom=Math.floor((this.viewportHeight-rect.y-rect.h)*sy),top=Math.ceil((this.viewportHeight-rect.y)*sy);
      gl.scissor(left,bottom,right-left,top-bottom);gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.disable(gl.SCISSOR_TEST);
    gl.bindTexture(gl.TEXTURE_2D, this.fallbackTexture);
    gl.uniform1f(this.hazardLocation, 1);
    for (const r of this.careerRegions) {
      if (r.y + r.h < cameraY || r.y > cameraY + this.viewportHeight) continue;
      const corners = [[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x,r.y+r.h],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h]];
      let at = 0;
      for (const [x,y] of corners) {
        this.hazardVertices[at++] = x; this.hazardVertices[at++] = y;
        this.hazardVertices[at++] = x / this.width; this.hazardVertices[at++] = y / this.height; this.hazardVertices[at++] = 1;
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.hazardVertices); gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.uniform1f(this.hazardLocation, 0);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data.subarray(0, offset));
    for (const [index, batch] of batches) {
      let texture = this.textures.get(index);
      if (!texture) {
        texture = gl.createTexture()!; this.textures.set(index, texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.tiles[index].canvas);
      } else gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.drawArrays(gl.TRIANGLES, batch.start / 5, (batch.end - batch.start) / 5);
    }
    // Retain a nearby margin to avoid repeated uploads at tile boundaries.
    for (const [index, texture] of this.textures) {
      const tile = this.tiles[index];
      if (!batches.has(index) && (tile.y + tile.height < cameraY - 1024 || tile.y > cameraY + this.viewportHeight + 1024)) {
        gl.deleteTexture(texture); this.textures.delete(index);
      }
    }
  }

  dispose() {
    for (const texture of this.textures.values()) this.gl.deleteTexture(texture);
    this.textures.clear(); this.gl.deleteTexture(this.fallbackTexture); this.gl.deleteBuffer(this.buffer); this.gl.deleteProgram(this.program);
    // Keep the canvas context reusable during hot reload; all owned GPU resources are deleted above.
    this.shards.length = 0; this.shardBuckets.clear();
  }
}
