import test from 'node:test';
import assert from 'node:assert/strict';
import { TextNavigation, moveBody } from '../src/game/navigation.ts';

function scene(rects) {
  const w = 420, h = 420, mask = new Uint8ClampedArray(w * h * 4);
  for (const [x0,y0,x1,y1] of rects) for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) mask[(y*w+x)*4+3]=255;
  return new TextNavigation(w,h,mask,w,h);
}

test('NPC already within attack distance flanks a text wall to obtain a clear shot', () => {
  const nav=scene([[40,200,290,215]]), start={x:200,y:150}, player={x:200,y:300};
  assert.equal(nav.clearShot(start,player),false);
  const path=nav.findRoute(start,player);
  assert.ok(path.length>0);
  assert.ok(path.some(p=>p.x>310));
  let previous=start;
  for(const p of path) { assert.ok(nav.canMove(previous,p)); previous=p; }
  assert.ok(nav.clearShot(path.at(-1),player));
  assert.equal(nav.canMove(start,player),false);
});

test('moving player causes a new firing position to be found', () => {
  const nav=scene([[40,200,290,215]]), start={x:200,y:150};
  const before=nav.findRoute(start,{x:200,y:300});
  const after=nav.findRoute(start,{x:360,y:150});
  assert.ok(after.length<before.length);
  assert.ok(nav.clearShot(after.at(-1),{x:360,y:150}));
});

test('sealed cover produces no route and blocked spawns move to free space', () => {
  const nav=scene([[140,230,260,350]]), start={x:200,y:150};
  assert.deepEqual(nav.findRoute(start,{x:200,y:290}),[]);
  const spawn=nav.nearestFree({x:200,y:290});
  assert.ok(nav.free(spawn));
});


test('player cannot tunnel through a text wall and can slide along its edge', () => {
  const nav=scene([[40,200,290,215]]), player={x:200,y:150};
  moveBody(nav, player, 0, 160);
  assert.ok(player.y<200-18);
  const before={...player};
  moveBody(nav, player, 40, 40);
  assert.ok(player.x>before.x);
  assert.ok(player.y>=before.y && player.y<200-18);
  assert.ok(nav.free(player));
});

test('movement requires opened ground before every step, including NPC-sized steps', () => {
  const nav=scene([]), body={x:100,y:150};
  moveBody(nav,body,40,0,()=>false);
  assert.equal(body.x,100);
  let digs=0;
  moveBody(nav,body,40,12,(from,to)=>{
    assert.equal(body.x,from.x);
    assert.equal(body.y,from.y);
    assert.ok(Math.hypot(to.x-from.x,to.y-from.y)<=4);
    digs++; return true;
  });
  assert.ok(digs>0);
  assert.ok(Math.abs(body.x-140)<1e-6);
  assert.ok(Math.abs(body.y-162)<1e-6);
});

test('idle input never digs and blocked text never invokes excavation', () => {
  const nav=scene([[40,200,290,215]]), body={x:200,y:150};
  let digs=0;
  moveBody(nav,body,0,0,()=>{digs++;return true;});
  assert.equal(digs,0);
  moveBody(nav,body,0,100,()=>{digs++;return true;});
  const before=digs;
  moveBody(nav,body,0,100,()=>{digs++;return true;});
  assert.equal(digs,before);
  assert.ok(body.y<182);
});

test('diagonal visibility is not a cardinal firing lane',()=>{
  const nav=scene([]),target={x:150,y:330};
  assert.ok(nav.clearShot({x:350,y:150},target));
  assert.equal(nav.firingLane({x:350,y:150},target),false);
  const path=nav.findRoute({x:350,y:150},target);
  assert.ok(path.length>1 && nav.firingLane(path.at(-1),target));
});

test('NPC on ice rounds a paragraph edge and enters the player corner despite replanning',async()=>{
  const {surfaceMotion}=await import('../src/game/ice.ts');
  const {routeWaypoint}=await import('../src/game/navigation.ts');
  const nav=scene([[0,200,310,220]]), target={x:150,y:342};
  for(const fps of [30,120]) {
    const body={x:378,y:126,vx:0,vy:0}; let path=[],plan=0,reached=false;
    for(let i=0;i<fps*20;i++) {
      const dt=1/fps; plan-=dt;
      if(plan<=0){path=nav.findRoute(body,target);plan=.75;}
      if(nav.firingLane(body,target) && Math.hypot(body.x-target.x,body.y-target.y)<=180){reached=true;break;}
      const p=routeWaypoint(nav,body,path);let vx=0,vy=0;
      if(p){const d=Math.hypot(p.x-body.x,p.y-body.y),speed=Math.min(100,d*3);vx=(p.x-body.x)/d*speed;vy=(p.y-body.y)/d*speed;}
      const step=surfaceMotion(body,vx,vy,true,dt),before={...body};
      moveBody(nav,body,step.x,step.y);
      if(Math.abs(body.x-before.x-step.x)>.01)body.vx=0;
      if(Math.abs(body.y-before.y-step.y)>.01)body.vy=0;
      assert.ok(nav.free(body));
    }
    assert.ok(reached,`NPC must enter the lower region at ${fps} FPS`);
    assert.ok(body.y>240);
  }
});

test('fast empty-region queries retain exact circle checks for larger bodies',()=>{
 const w=200,h=300,mask=new Uint8ClampedArray(w*h*4);
 mask[(150*w+100)*4+3]=255;
 const nav=new TextNavigation(w,h,mask,w,h);
 assert.equal(nav.free({x:125,y:150},18),true);
 assert.equal(nav.free({x:125,y:150},26),false);
 assert.equal(nav.free({x:126,y:176},26),true);
 assert.equal(nav.free({x:50,y:220},26),true);
});
