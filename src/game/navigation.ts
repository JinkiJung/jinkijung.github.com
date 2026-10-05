import { hitTextMask, segmentCircle } from './textCollision.ts';

export type Point = { x: number; y: number };
const CELL = 8;
const RADIUS = 18;

// Static, inflated text occupancy is built once. Searches run on a small grid,
// never on the full-resolution glyph mask or every animation frame.
export class TextNavigation {
  readonly cellSize = CELL;
  readonly cols: number;
  readonly rows: number;
  readonly blocked: Uint8Array;
  private seen: Int32Array;
  private parent: Int32Array;
  private queue: Int32Array;
  private generation = 0;
  private visibility: Uint8Array;
  private target = { x: -1000, y: -1000 };

  readonly width: number;
  readonly height: number;
  private mask: Uint8ClampedArray;
  private mw: number;
  private mh: number;
  private inkSums: Uint32Array;

  constructor(width: number, height: number, mask: Uint8ClampedArray, mw: number, mh: number) {
    this.width = width; this.height = height; this.mask = mask; this.mw = mw; this.mh = mh;
    const stride=mw+1;
    this.inkSums=new Uint32Array(stride*(mh+1));
    for(let y=0;y<mh;y++){
      let row=0;
      for(let x=0;x<mw;x++){row+=Number(mask[(y*mw+x)*4+3]>=48);this.inkSums[(y+1)*stride+x+1]=this.inkSums[y*stride+x+1]+row;}
    }
    this.cols = Math.ceil(width / CELL); this.rows = Math.ceil(height / CELL);
    const count = this.cols * this.rows, ink = new Uint8Array(count);
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      if (mask[(y * mw + x) * 4 + 3] >= 48) ink[Math.floor(y * height / mh / CELL) * this.cols + Math.floor(x * width / mw / CELL)] = 1;
    }
    this.blocked = new Uint8Array(count);
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
      const px = (x + .5) * CELL, py = (y + .5) * CELL;
      let blocked = px < 24 || px > width - 24 || py < 90 || py > height - 30;
      for (let oy = -3; !blocked && oy <= 3; oy++) for (let ox = -3; !blocked && ox <= 3; ox++) {
        const nx = x + ox, ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows || !ink[ny * this.cols + nx]) continue;
        const dx = Math.max(0, Math.abs(ox) * CELL - CELL / 2), dy = Math.max(0, Math.abs(oy) * CELL - CELL / 2);
        if (dx * dx + dy * dy <= RADIUS * RADIUS) blocked = true;
      }
      this.blocked[y * this.cols + x] = Number(blocked);
    }
    this.seen = new Int32Array(count); this.parent = new Int32Array(count);
    this.queue = new Int32Array(count); this.visibility = new Uint8Array(count);
  }

  clearShot(from: Point, target: Point) {
    return hitTextMask(this.mask, this.mw, this.mh, this.mw / this.width, this.mh / this.height, from.x, from.y, target.x - from.x, target.y - from.y) === Infinity;
  }

  // Visibility alone is insufficient now that NPC bullets travel on four axes.
  firingLane(from: Point, target: Point) {
    const dx = target.x - from.x, dy = target.y - from.y;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const length = Math.max(Math.abs(dx), Math.abs(dy)) + 16;
    const vx = horizontal ? Math.sign(dx) * length : 0;
    const vy = horizontal ? 0 : Math.sign(dy) * length;
    const contact = segmentCircle(from.x, from.y, vx, vy, target.x, target.y, 16);
    return contact !== Infinity && hitTextMask(this.mask, this.mw, this.mh, this.mw / this.width, this.mh / this.height, from.x, from.y, vx, vy) > contact;
  }

  private index(p: Point) { return Math.floor(p.y / CELL) * this.cols + Math.floor(p.x / CELL); }
  private point(index: number): Point { return { x: (index % this.cols + .5) * CELL, y: (Math.floor(index / this.cols) + .5) * CELL }; }
  free(p: Point, radius = RADIUS) {
    if (p.x < 24 || p.x > this.width - 24 || p.y < 90 || p.y > this.height - 30) return false;
    const sx = this.mw / this.width, sy = this.mh / this.height;
    const left = Math.max(0, Math.floor((p.x - radius) * sx)), right = Math.min(this.mw - 1, Math.floor((p.x + radius) * sx));
    const top = Math.max(0, Math.floor((p.y - radius) * sy)), bottom = Math.min(this.mh - 1, Math.floor((p.y + radius) * sy));
    const stride=this.mw+1;
    if(this.inkSums[(bottom+1)*stride+right+1]-this.inkSums[top*stride+right+1]-this.inkSums[(bottom+1)*stride+left]+this.inkSums[top*stride+left]===0)return true;
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
      if (this.mask[(y * this.mw + x) * 4 + 3] < 48) continue;
      const dx = Math.max(x / sx - p.x, 0, p.x - (x + 1) / sx);
      const dy = Math.max(y / sy - p.y, 0, p.y - (y + 1) / sy);
      if (dx * dx + dy * dy <= radius * radius) return false;
    }
    return true;
  }
  canMove(from: Point, to: Point) {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (CELL / 2)));
    for (let i = 0; i <= steps; i++) if (!this.free({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps })) return false;
    return true;
  }
  nearestFree(p: Point) {
    if (this.free(p)) return { x: p.x, y: p.y };
    let best = Infinity, result = { x: p.x, y: p.y };
    for (let i = 0; i < this.blocked.length; i++) if (!this.blocked[i]) {
      const q = this.point(i), d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < best) { best = d; result = q; }
    }
    return result;
  }

  // Find the nearest reachable firing position, not the player's occupied cell.
  // Four-way edges prevent cutting corners through letters.
  findRoute(from: Point, target: Point): Point[] {
    if (!this.free(from)) return [];
    if (target.x !== this.target.x || target.y !== this.target.y) {
      this.target = { ...target }; this.visibility.fill(0);
    }
    const start = this.index(from), stamp = ++this.generation;
    let head = 0, tail = 1, goal = -1;
    this.queue[0] = start; this.seen[start] = stamp; this.parent[start] = -1;
    while (head < tail) {
      const current = this.queue[head++], p = this.point(current);
      const distance = Math.hypot(p.x - target.x, p.y - target.y);
      if (distance >= 48 && distance <= 180) {
        if (!this.visibility[current]) this.visibility[current] = this.firingLane(p, target) ? 1 : 2;
        if (this.visibility[current] === 1) { goal = current; break; }
      }
      const x = current % this.cols, y = Math.floor(current / this.cols);
      for (const next of [x > 0 ? current - 1 : -1, x + 1 < this.cols ? current + 1 : -1, y > 0 ? current - this.cols : -1, y + 1 < this.rows ? current + this.cols : -1]) {
        if (next < 0 || this.blocked[next] || this.seen[next] === stamp) continue;
        this.seen[next] = stamp; this.parent[next] = current; this.queue[tail++] = next;
      }
    }
    if (goal < 0) return [];
    const path: Point[] = [];
    for (let i = goal; i !== -1; i = this.parent[i]) path.push(this.point(i));
    return path.reverse();
  }
}

// Both player and NPC movement use the same solid text grid. Substeps prevent
// tunneling and axis separation lets a body slide along a wall when blocked.
export function moveBody(navigation: Pick<TextNavigation, 'canMove'>, body: Point, dx: number, dy: number, prepareStep: (from: Point, to: Point) => boolean = () => true) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4));
  for (let i = 0; i < steps; i++) {
    const x = { x: body.x + dx / steps, y: body.y };
    if (dx !== 0 && navigation.canMove(body, x) && prepareStep(body, x)) body.x = x.x;
    const y = { x: body.x, y: body.y + dy / steps };
    if (dy !== 0 && navigation.canMove(body, y) && prepareStep(body, y)) body.y = y.y;
  }
}

// Skip nearby grid centers on a straight, collision-free stretch. This prevents
// ice momentum and periodic replanning from pulling an NPC back to its cell center.
export function routeWaypoint(navigation: Pick<TextNavigation, 'canMove'>, from: Point, path: Point[]) {
  while (path.length > 1 && Math.hypot(path[1].x - from.x, path[1].y - from.y) <= 96 && navigation.canMove(from, path[1])) path.shift();
  while (path.length && Math.hypot(path[0].x - from.x, path[0].y - from.y) < 8) path.shift();
  return path[0];
}
