export const CHARGER_HP = 4.5;
export const CHARGER_RADIUS = 26;
export function chargeTravel(x:number,y:number,angle:number,distance:number,free:(x:number,y:number)=>boolean) {
  const steps=Math.max(1,Math.ceil(distance/3)),dx=Math.cos(angle)*distance/steps,dy=Math.sin(angle)*distance/steps;
  for(let i=0;i<steps;i++){
    if(!free(x+dx,y+dy))return {x,y,hit:true};
    x+=dx;y+=dy;
  }
  return {x,y,hit:false};
}
export function chargerMilestones(kills:number) { return Math.floor(kills/4); }

type Point = {x:number;y:number};
// Shared lazy occupancy cache; route searches run only on periodic replanning.
export function createChargePlanner(width:number,top:number,bottom:number,free:(x:number,y:number)=>boolean) {
  const cell=16,cols=Math.ceil(width/cell),rows=Math.ceil((bottom-top)/cell);
  const occupancy=new Map<number,boolean>();
  const point=(i:number)=>({x:(i%cols+.5)*cell,y:top+(Math.floor(i/cols)+.5)*cell});
  const clear=(a:Point,b:Point)=>!chargeTravel(a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x),Math.hypot(b.x-a.x,b.y-a.y),free).hit;
  const lane=(a:Point,b:Point)=>{
    const distance=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);
    return !chargeTravel(a.x,a.y,angle,Math.max(0,distance-40),free).hit;
  };
  function* search(from:Point,target:Point): Generator<null,Point[]> {
      const start=Math.floor((from.y-top)/cell)*cols+Math.floor(from.x/cell);
      const queue=[start],parent=new Map<number,number>([[start,-1]]);
      let goal=-1,best=start,bestDistance=Math.hypot(from.x-target.x,from.y-target.y);
      for(let head=0;head<queue.length && head<1800;head++){
        if(head>0 && head%24===0)yield null;
        const current=queue[head],p=current===start?from:point(current);
        const distance=Math.hypot(p.x-target.x,p.y-target.y);
        if(distance<bestDistance){bestDistance=distance;best=current;}
        if(distance>=48 && distance<=700 && lane(p,target)){goal=current;break;}
        const x=current%cols,y=Math.floor(current/cols);
        for(const next of [x>0?current-1:-1,x+1<cols?current+1:-1,y>0?current-cols:-1,y+1<rows?current+cols:-1]){
          if(next<0 || parent.has(next))continue;
          const q=point(next);
          if(!occupancy.has(next))occupancy.set(next,free(q.x,q.y));
          if(!occupancy.get(next) || !clear(p,q))continue;
          parent.set(next,current);queue.push(next);
        }
      }
      if(goal<0)goal=best;
      const path:Point[]=[];
      for(let i=goal;i!==start && i!==-1;i=parent.get(i)??-1)path.push(point(i));
      return path.reverse();
  }
  return {
    clear: lane,
    beginRoute: search,
    route(from:Point,target:Point) {
      const task=search(from,target);
      let result=task.next();while(!result.done)result=task.next();return result.value;
    },
  };
}

export function chargeKnockback(angle:number,source:Point,target:Point) {
  const dx=Math.cos(angle),dy=Math.sin(angle);
  const lateral=Math.max(-1,Math.min(1,((target.x-source.x)*-dy+(target.y-source.y)*dx)/42));
  const x=dx-dy*lateral*.75,y=dy+dx*lateral*.75,length=Math.hypot(x,y);
  return {vx:x/length*520,vy:y/length*520};
}

export type OilCharge = {chargeAngle:number;chargeOily:boolean;chargeOilDeflected?:boolean};
// Bend once per oil entry rather than taking a random walk every frame.
export function oilChargeTravel(state:OilCharge,x:number,y:number,distance:number,free:(x:number,y:number)=>boolean,oily:(x:number,y:number)=>boolean,random= Math.random) {
  const steps=Math.max(1,Math.ceil(distance/3)),step=distance/steps;
  for(let i=0;i<steps;i++){
    const inOil=oily(x,y);
    if(inOil && !state.chargeOily){
      state.chargeOilDeflected=true;
      const roll=random(),sign=roll<.5?-1:1;
      const degrees=10+(roll<.5?roll*2:(roll-.5)*2)*10;
      state.chargeAngle+=sign*degrees*Math.PI/180;
    }
    state.chargeOily=inOil;
    const next=chargeTravel(x,y,state.chargeAngle,step,free);
    x=next.x;y=next.y;
    if(next.hit)return {x,y,hit:true};
  }
  return {x,y,hit:false};
}
