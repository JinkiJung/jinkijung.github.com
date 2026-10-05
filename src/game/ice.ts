export type IceRegion = { x: number; y: number; w: number; h: number };
export type Motion = { vx: number; vy: number };

export function onIce(x: number, y: number, regions: IceRegion[]) {
  return regions.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

const oilDrifts = new WeakMap<Motion,{x:number;y:number;speed:number;time:number;phase:number;frequency:number;swaySign:number}>();
export function resetOilMotion(motion:Motion) { oilDrifts.delete(motion); }
function oilMotion(motion:Motion,desiredX:number,desiredY:number,dt:number,minimumSpeed=90) {
  let drift=oilDrifts.get(motion);
  if(!drift){
    const vx=motion.vx || motion.vy ? motion.vx : desiredX,vy=motion.vx || motion.vy ? motion.vy : desiredY;
    const speed=Math.hypot(vx,vy);
    if(!speed)return {x:0,y:0};
    drift={x:vx/speed,y:vy/speed,speed:Math.max(minimumSpeed,speed),time:0,swaySign:1,phase:Math.random()*Math.PI*2,frequency:8+Math.random()*4};
    oilDrifts.set(motion,drift);
  }
  const a=drift.time,b=a+dt,f=drift.frequency,p=drift.phase;
  const wave=(t:number)=>drift.swaySign*(Math.sin(t*f+p)*.25+Math.sin(t*f*1.73+p*2)*.1);
  const lateral=drift.swaySign*drift.speed*((Math.cos(a*f+p)-Math.cos(b*f+p))*.25/f+(Math.cos(a*f*1.73+p*2)-Math.cos(b*f*1.73+p*2))*.1/(f*1.73));
  drift.time=b;
  motion.vx=drift.speed*(drift.x-drift.y*wave(b));motion.vy=drift.speed*(drift.y+drift.x*wave(b));
  return {x:drift.x*drift.speed*dt-drift.y*lateral,y:drift.y*drift.speed*dt+drift.x*lateral};
}

// Exact exponential integration makes the glide independent of display FPS.
export function surfaceMotion(motion: Motion, desiredX: number, desiredY: number, icy: boolean, dt: number, oily = false) {
  if(oily)return oilMotion(motion,desiredX,desiredY,dt);
  resetOilMotion(motion);
  if (!icy) { motion.vx = desiredX; motion.vy = desiredY; return { x: desiredX * dt, y: desiredY * dt }; }
  const steering = desiredX !== 0 || desiredY !== 0;
  const rate = steering ? 1.8 : .55, decay = Math.exp(-rate * dt);
  const x = desiredX * dt + (motion.vx - desiredX) * (1 - decay) / rate;
  const y = desiredY * dt + (motion.vy - desiredY) * (1 - decay) / rate;
  motion.vx = desiredX + (motion.vx - desiredX) * decay;
  motion.vy = desiredY + (motion.vy - desiredY) * decay;
  if (!steering && Math.hypot(motion.vx, motion.vy) < 2) { motion.vx = 0; motion.vy = 0; }
  return { x, y };
}

export function visibleIceRect(r: IceRegion, cameraY: number, width: number, height: number): IceRegion | null {
  const x = Math.max(0, r.x), y = Math.max(0, r.y - cameraY);
  const right = Math.min(width, r.x + r.w), bottom = Math.min(height, r.y + r.h - cameraY);
  return right > x && bottom > y ? { x, y, w: right - x, h: bottom - y } : null;
}

// Idle shooters can have zero entry velocity; use their facing direction in that case.
// Once moving, the shared drift ignores subsequent AI steering until leaving oil.
export function enemySurfaceMotion(motion:Motion, desiredX:number, desiredY:number, facing:number, icy:boolean, dt:number, oily:boolean) {
  if(!oily)return surfaceMotion(motion,desiredX,desiredY,icy,dt);
  if(!desiredX && !desiredY){desiredX=Math.cos(facing)*140;desiredY=Math.sin(facing)*140;}
  return oilMotion(motion,desiredX,desiredY,dt,140);
}

// Reflect the stored drift too: zeroing velocity alone leaves oil pushing into a wall.
export function resolveSurfaceCollision(motion:Motion, requested:{x:number;y:number}, actual:{x:number;y:number}, oily:boolean) {
  const hitX=Math.abs(actual.x-requested.x)>.01;
  const hitY=Math.abs(actual.y-requested.y)>.01;
  const drift=oily ? oilDrifts.get(motion) : undefined;
  if(drift){
    if(hitX){drift.x=-drift.x;motion.vx=-motion.vx;}
    if(hitY){drift.y=-drift.y;motion.vy=-motion.vy;}
    // A reflection flips the perpendicular wobble's handedness, preserving its phase.
    if(hitX!==hitY)drift.swaySign*=-1;
  }else{
    if(hitX)motion.vx=0;
    if(hitY)motion.vy=0;
  }
}
