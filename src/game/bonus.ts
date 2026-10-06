import { loadImage } from './loadImage.ts';
export type BonusKind='collision'|'oilPit';
export const BONUS_POINTS={collision:750,oilPit:2000} as const;
let sprite:HTMLCanvasElement;
let loading:Promise<void>|undefined;
export function loadBonusSprite(){
 return loading ??= (async()=>{
  const image=await loadImage(`${import.meta.env.BASE_URL}images/game/bonus.png`);
  sprite=document.createElement('canvas');sprite.width=96;sprite.height=32;
  const ctx=sprite.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,96,32);
 })().catch(error=>{loading=undefined;throw error;});
}
export function createBonuses(){
 const effects:{x:number;y:number;kind:BonusKind;age:number}[]=[];
 return {
  add(x:number,y:number,kind:BonusKind){if(effects.length>=12)effects.shift();effects.push({x,y,kind,age:0});},
  update(dt:number){for(let i=effects.length-1;i>=0;i--){effects[i].age+=dt;if(effects[i].age>=1.2)effects.splice(i,1);}},
  draw(ctx:CanvasRenderingContext2D,cameraY:number,height:number,width:number){
   for(const e of effects){if(e.y<cameraY-60 || e.y>cameraY+height+60)continue;
    ctx.save();ctx.translate(Math.max(52,Math.min(width-52,e.x)),Math.max(cameraY+90,e.y-32-e.age*24));
    ctx.globalAlpha=Math.min(1,(1.2-e.age)*3);ctx.imageSmoothingEnabled=false;
    if(sprite)ctx.drawImage(sprite,-48,-24);
    ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#302009';ctx.fillStyle='#ffe9a1';
    const text=`+${BONUS_POINTS[e.kind].toLocaleString()}`;ctx.strokeText(text,0,15);ctx.fillText(text,0,15);ctx.restore();
   }
  }
 };
}
