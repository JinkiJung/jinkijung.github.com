import { drawOilArt, preloadOilArt } from './oilArt.ts';
import { drawShuriken } from './spikes.ts';
import { segmentRect } from './geometry.ts';
import { segmentCircle } from './textCollision.ts';
import type { IceRegion } from './ice';
export const OIL_SIZE = 144;
export const WEAPONS = ['uzi', 'shotgun', 'triple', 'firegun', 'spike', 'mine', 'oil'] as const;
export type Weapon = typeof WEAPONS[number] | 'pistol';
export const LABELS: Record<Weapon, string> = { pistol: 'PISTOL', uzi: 'UZI', shotgun: 'SHOTGUN', triple: 'TRIPLE', firegun: 'FIREGUN', spike: 'SPIKE GUN', mine: 'MINE', oil: 'OIL' };
export const SPECS: Record<Weapon, { delay: number; damage: number; speed: number; life: number; angles: number[] }> = {
  pistol: { delay: 105, damage: 1, speed: 1250, life: 1.6, angles: [0] },
  uzi: { delay: 65, damage: .55, speed: 1300, life: .9, angles: [0] },
  shotgun: { delay: 780, damage: 1.7, speed: 1500, life: .171, angles: [-.18,-.09,0,.09,.18] },
  triple: { delay: 260, damage: .9, speed: 1050, life: 1.1, angles: [-.25,0,.25] },
  firegun: { delay: 80, damage: .3, speed: 0, life: 0, angles: [] },
  spike: { delay: 520, damage: 1, speed: 680, life: 6, angles: [0] },
  mine: { delay: 900, damage: 4, speed: 0, life: 0, angles: [] },
  oil: { delay: 1100, damage: 0, speed: 0, life: 0, angles: [] },
};
export function spikeMotion(vx: number, vy: number, dt: number) {
  const decay = Math.exp(-1.8 * dt);
  const stopped = Math.hypot(vx * decay, vy * decay) < 18;
  return { x: vx * (1 - decay) / 1.8, y: vy * (1 - decay) / 1.8, vx: stopped ? 0 : vx * decay, vy: stopped ? 0 : vy * decay };
}

export function drawWeapon(ctx: CanvasRenderingContext2D, weapon: Weapon) {
  ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = '#17292d'; ctx.fillStyle = '#aac1c6';
  if (weapon === 'mine') {
    ctx.fillStyle = '#6f8066'; ctx.beginPath(); ctx.ellipse(0, 2, 12, 7, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff8866'; ctx.fillRect(-3,-3,6,4);
    for(let i=-1;i<=1;i++)ctx.fillRect(i*8-1,6,2,3);
  } else if (weapon === 'oil') {
    ctx.fillStyle = '#41494a'; ctx.beginPath(); ctx.roundRect(-9,-9,17,20,3);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#bfda83';ctx.strokeRect(-4,-5,7,10);ctx.fillStyle='#c5d0bd';ctx.fillRect(2,-13,7,5);
    ctx.fillStyle='#080e11';ctx.beginPath();ctx.ellipse(14,9,4,5,0,0,Math.PI*2);ctx.fill();
  } else {
    ctx.fillStyle = weapon==='shotgun'?'#a47850':weapon==='firegun'?'#bd7547':'#81989c';
    ctx.fillRect(-13,-5,21,10);ctx.strokeRect(-13,-5,21,10);
    ctx.fillStyle='#26383e';ctx.fillRect(-5,5,6,9);ctx.fillRect(6,-3,16,5);
    if(weapon==='uzi'){ctx.fillRect(-1,-10,4,5);ctx.fillStyle='#d6e3d7';ctx.fillRect(0,8,4,9);}
    if(weapon==='shotgun'){ctx.fillStyle='#deb681';ctx.fillRect(5,2,11,4);ctx.fillRect(-19,-4,7,8);}
    if(weapon==='triple'){ctx.fillRect(6,-8,17,4);ctx.fillRect(6,5,17,4);}
    if(weapon==='firegun'){ctx.fillStyle='#eaac55';ctx.beginPath();ctx.roundRect(-17,-9,9,17,3);ctx.fill();ctx.fillStyle='#ffb94e';ctx.beginPath();ctx.moveTo(22,-5);ctx.lineTo(32,0);ctx.lineTo(22,5);ctx.fill();}
    if(weapon==='spike'){ctx.save();ctx.translate(23,0);drawShuriken(ctx,10);ctx.restore();}
  }
  ctx.restore();
}

export function mineFuse(life: number) {
  return { warning: life <= 1 + 1e-9, expired: life <= 1e-9 };
}

export function triggersMine(mine: { x:number; y:number; arm:number }, actor: { x:number; y:number }, alive:boolean, clear:(from:{x:number;y:number},to:{x:number;y:number})=>boolean, radius=40) {
  return alive && mine.arm <= 0 && Math.hypot(actor.x-mine.x,actor.y-mine.y) < radius && clear(mine,actor);
}

export function createWeapons(regions: (IceRegion & {group?:string})[], random = Math.random) {
  preloadOilArt();
  const pools = new Map<string, (typeof WEAPONS[number])[]>();
  const pickups = regions.map((r, index) => {
    const group = r.group ?? `legacy-${Math.floor(index/4)}`;
    let remaining = pools.get(group);
    if(!remaining?.length){remaining=[...WEAPONS];pools.set(group,remaining);}
    return ({ index, x:r.x+r.w/2, y:r.y+r.h/2, weapon: remaining.splice(Math.min(remaining.length-1,Math.floor(random()*remaining.length)),1)[0], cooldown:0, visible:false });});
  const oils: (IceRegion & { life:number; burning:boolean; variant:number })[] = [];
  const mines: {x:number;y:number;life:number;arm:number}[] = [];
  const blasts: {x:number;y:number;life:number}[] = [];
  let equipped: Weapon = 'pistol';
  return {
    get equipped() { return equipped; }, pickups, oils, mines, blasts,
    reset() { equipped = 'pistol'; },
    equip(weapon:Weapon) { equipped=weapon; },
    update(dt:number, player:{x:number;y:number}, alive:boolean, unlocked:(index:number)=>boolean, reachable:(x:number,y:number)=>boolean) {
      for(const p of pickups) {
        p.cooldown=Math.max(0,p.cooldown-dt);
        p.visible=unlocked(p.index);
        if(alive && !p.cooldown && p.visible && Math.hypot(player.x-p.x,player.y-p.y)<42 && reachable(p.x,p.y)) {equipped=p.weapon;p.cooldown=18;}
      }
      for(const list of [oils,blasts])for(let i=list.length-1;i>=0;i--){list[i].life-=dt;if(list[i].life<=1e-9)list.splice(i,1);}
      for(const m of mines){m.arm=Math.max(0,m.arm-dt);m.life=Math.max(0,m.life-dt);}
    },
    oily(x:number,y:number) {return oils.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);},
    burning(x:number,y:number) {return oils.some(r=>r.burning && x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);},
    ignite(x:number,y:number,rays:ReadonlyArray<{dx:number;dy:number}>,blocked:(dx:number,dy:number)=>number) {
      for(const r of oils)if(!r.burning && rays.some(ray=>{
        const t=segmentRect(x,y,ray.dx,ray.dy,{...r,id:0});
        return t<=1 && t<blocked(ray.dx,ray.dy);
      }))r.burning=true;
    },
    placeOil(x:number,y:number) {if(oils.length>=8)oils.shift();oils.push({x:x-OIL_SIZE/2,y:y-OIL_SIZE/2,w:OIL_SIZE,h:OIL_SIZE,life:10,burning:false,variant:Math.min(2,Math.floor(random()*3))});},
    placeMine(x:number,y:number) {if(mines.length>=3)return false;mines.push({x,y,life:10,arm:.5});return true;},
    explode(x:number,y:number){if(blasts.length>=8)blasts.shift();blasts.push({x,y,life:.3});},
    draw(ctx:CanvasRenderingContext2D,time:number,cameraY:number,height:number) {
      ctx.save();
      for(const r of oils){
        if(r.y+r.h<cameraY||r.y>cameraY+height)continue;
        drawOilArt(ctx,r.variant,r.x,r.y,r.w,r.burning);
        if(r.burning){
          for(let i=0;i<9;i++){
            const x=r.x+24+(i%3)*48,y=r.y+30+Math.floor(i/3)*44;
            const flicker=Math.sin(time*14+i*2.4),tip=12+flicker*4;
            ctx.fillStyle=i%2?'#ffad46cc':'#ff652bdd';
            ctx.beginPath();ctx.moveTo(x-7,y+6);ctx.quadraticCurveTo(x-10,y-3,x+flicker*3,y-tip);
            ctx.quadraticCurveTo(x+11,y+1,x+6,y+6);ctx.closePath();ctx.fill();
          }
        }

      }
      for(const m of mines){
        const warning=mineFuse(m.life).warning, phase=(10-m.life)*90;
        const shake=warning ? 1.2+(1-m.life)*1.3 : 0;
        ctx.save();ctx.translate(m.x+Math.sin(phase)*shake,m.y+Math.cos(phase*1.3)*shake*.5);
        if(warning)ctx.rotate(Math.sin(phase*.8)*.09);
        drawWeapon(ctx,'mine');ctx.restore();
      }
      for(const b of blasts){ctx.globalAlpha=b.life/.3;ctx.strokeStyle='#ffd58a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,12+(1-b.life/.3)*84,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
      for(const p of pickups){
        if(!p.visible||p.cooldown||p.y<cameraY-40||p.y>cameraY+height+40)continue;
        ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(p.x,p.y+12,21,7,0,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.translate(p.x,p.y-12+Math.sin(time*2.5+p.x)*4);
        ctx.strokeStyle='#ffdb6599';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.stroke();
        drawWeapon(ctx,p.weapon);ctx.font='9px monospace';ctx.textAlign='center';ctx.fillStyle='#ffe99e';ctx.fillText(LABELS[p.weapon],0,39);ctx.restore();
      }
      ctx.restore();
    },
  };
}

// Return newly hit enemy slots along this frame's sweep, stopping at scenery.
export function piercedEnemies(x:number,y:number,dx:number,dy:number,barrier:number,hitMask:Set<number>,enemies:ReadonlyArray<{x:number;y:number;hp:number;charger?:boolean}>) {
  const hits:number[]=[];
  enemies.forEach((enemy,i)=>{
    if(enemy.hp<=0 || hitMask.has(i))return;
    const t=segmentCircle(x,y,dx,dy,enemy.x,enemy.y,enemy.charger?26:17);
    if(t<barrier)hits.push(i);
  });
  return hits;
}

export function burnTick(elapsed:number,dt:number,burning:boolean) {
  if(!burning)return {elapsed:0,damage:0};
  const total=elapsed+dt,damage=Math.floor((total+1e-9)/.25);
  return {elapsed:Math.max(0,total-damage*.25),damage};
}
