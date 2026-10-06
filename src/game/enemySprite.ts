import { loadImage } from './loadImage.ts';
export const ENEMY_SKINS=['loop','angle','star'] as const;
export const JUGGERNAUT_SKIN=ENEMY_SKINS.length;
export function randomEnemySkin(random=Math.random){return Math.min(2,Math.floor(random()*3));}
const sprites:HTMLCanvasElement[]=[],flashes:HTMLCanvasElement[]=[];
let loading:Promise<void>|undefined;
export function loadEnemySprites(){
 return loading ??= Promise.all([...ENEMY_SKINS,'juggernaut'].map(async(name,index)=>{
  const image=await loadImage(`${import.meta.env.BASE_URL}images/game/enemy-${name}.png`);
  const source=document.createElement('canvas');source.width=image.width;source.height=image.height;
  const context=source.getContext('2d')!;context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,image.width,image.height).data;
  let l=image.width,t=image.height,r=0,b=0;
  for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>128){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
  const side=Math.max(r-l+1,b-t+1)*(index===JUGGERNAUT_SKIN?1.08:1.15),cx=(l+r)/2,cy=(t+b)/2;
  const resolution=index===JUGGERNAUT_SKIN?32:16;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=resolution;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,cx-side/2,cy-side/2,side,side,0,0,resolution,resolution);sprites[index]=canvas;
  const flash=document.createElement('canvas');flash.width=flash.height=resolution;
  const tint=flash.getContext('2d')!;tint.drawImage(canvas,0,0);tint.globalCompositeOperation='source-atop';tint.fillStyle='#ffe4c6b0';tint.fillRect(0,0,resolution,resolution);flashes[index]=flash;
  source.width=source.height=1;
 })).then(()=>{}).catch(error=>{loading=undefined;throw error;});
}
export function drawEnemySprite(ctx:CanvasRenderingContext2D,skin:number,hit=false){
 const sprite=(hit?flashes:sprites)[skin];if(!sprite)return;
 // Normal bots face up in the artwork; the locomotive faces down.
 const size=skin===JUGGERNAUT_SKIN?56:32;
 ctx.save();ctx.rotate(skin===JUGGERNAUT_SKIN?-Math.PI/2:Math.PI/2);ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,-size/2,-size/2,size,size);ctx.restore();
}
