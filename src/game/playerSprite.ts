import { loadImage } from './loadImage.ts';
const frames: HTMLCanvasElement[] = [], hurtFrames: HTMLCanvasElement[] = [];
let displaySize=48;
let loading:Promise<void>|undefined;
export function playerFrame(moving:boolean,seconds:number) {
  return moving ? 1+Math.floor(seconds/.12)%4 : 0;
}
export function loadPlayerSprite():Promise<void> {
  return loading ??= (async()=>{
    const [image,layout]=await Promise.all([loadImage(`${import.meta.env.BASE_URL}images/game/player-sheet.png`),fetch(`${import.meta.env.BASE_URL}images/game/player-frames.json`, { signal: AbortSignal.timeout(15000) }).then(r=>{if(!r.ok)throw new Error('SPRITE_LOAD_FAILED');return r.json();})]);
    // Crown highlight anchors are measured per frame; preview uses this same layout.
    const {centers,cropSize,width,height,rasterSize}=layout as {centers:number[][];cropSize:number;width:number;height:number;rasterSize:number;displaySize:number};
    displaySize=layout.displaySize;
    for(const [x,y] of centers){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=rasterSize;
      const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
      ctx.drawImage(image,(x-cropSize/2)*image.width/width,(y-cropSize/2)*image.height/height,cropSize*image.width/width,cropSize*image.height/height,0,0,rasterSize,rasterSize);
      frames.push(canvas);
      const hurt=document.createElement('canvas');hurt.width=hurt.height=rasterSize;
      const tint=hurt.getContext('2d')!;tint.drawImage(canvas,0,0);
      tint.globalCompositeOperation='source-atop';tint.fillStyle='#ef5959aa';tint.fillRect(0,0,rasterSize,rasterSize);hurtFrames.push(hurt);
    }
  })().catch(error=>{loading=undefined;throw error;});
}
// Caller uses the game's right-facing local axis; the artwork faces up.
export function drawPlayerSprite(ctx:CanvasRenderingContext2D,frame=0,hurt=false) {
  const image=(hurt?hurtFrames:frames)[frame];if(!image)return;
  ctx.save();ctx.rotate(Math.PI/2);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,-displaySize/2,-displaySize/2,displaySize,displaySize);ctx.restore();
}
