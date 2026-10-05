import { segmentCircle } from './textCollision.ts';
export const SPIKE_RADIUS = 8;
type Spike = {x:number;y:number;vx:number;vy:number;trailX:number;trailY:number};

export function collideSpikes(a:Spike,b:Spike,swept=true) {
  const diameter=SPIKE_RADIUS*2;
  if(swept){
    const ax=a.x-a.trailX,ay=a.y-a.trailY,bx=b.x-b.trailX,by=b.y-b.trailY;
    const t=segmentCircle(a.trailX-b.trailX,a.trailY-b.trailY,ax-bx,ay-by,0,0,diameter);
    if(t<=1 && t>0){a.x=a.trailX+ax*t;a.y=a.trailY+ay*t;b.x=b.trailX+bx*t;b.y=b.trailY+by*t;}
  }
  const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);
  if(distance>diameter+1e-7)return false;
  const nx=distance>1e-8?dx/distance:1,ny=distance>1e-8?dy/distance:0;
  const overlap=Math.max(0,diameter-distance)+.001;
  a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;
  const approaching=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
  if(approaching>0){a.vx-=approaching*nx;a.vy-=approaching*ny;b.vx+=approaching*nx;b.vy+=approaching*ny;}
  return true;
}

export function drawShuriken(ctx:CanvasRenderingContext2D,radius=SPIKE_RADIUS) {
  ctx.beginPath();
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4,r=i%2?radius*.32:radius;
    const x=Math.cos(angle)*r,y=Math.sin(angle)*r;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();ctx.fillStyle='#ddecf6';ctx.strokeStyle='#567481';ctx.lineWidth=1;ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,radius*.16,0,Math.PI*2);ctx.fillStyle='#263b43';ctx.fill();
}
