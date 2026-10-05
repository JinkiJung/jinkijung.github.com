type DeathSprite = 'skull' | 'bones';
const sprites:HTMLCanvasElement[]=[];
let loading:Promise<void>|undefined;
export function loadDeathSprites():Promise<void> {
  return loading ??= (async()=>{
    const image=new Image();image.src=`${import.meta.env.BASE_URL}images/game/death-sheet.png`;
    await image.decode();
    for(let i=0;i<2;i++){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
      const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
      ctx.drawImage(image,i*image.width/2,0,image.width/2,image.height,0,0,32,32);
      sprites.push(canvas);
    }
  })();
}
function drawSprite(ctx:CanvasRenderingContext2D,kind:DeathSprite) {
  const sprite=sprites[kind==='skull'?0:1];if(!sprite)return;
  ctx.imageSmoothingEnabled=false;
  const size=kind==='skull'?40:48;
  ctx.drawImage(sprite,-size/2,-size/2,size,size);
}
export function createDeathMarks(draw=drawSprite) {
  const marks: { x: number; y: number; age: number; player: boolean }[] = [];
  return {
    add(x: number, y: number, player = false) {
      if (marks.length === 64) marks.shift();
      marks.push({ x, y, age: 0, player });
    },
    update(dt: number) { for (const mark of marks) mark.age = Math.min(2, mark.age + dt); },
    draw(ctx: CanvasRenderingContext2D, cameraY: number, viewHeight: number) {
      for (const mark of marks) {
        if (mark.y < cameraY - 70 || mark.y > cameraY + viewHeight + 50) continue;
        ctx.save();ctx.translate(Math.round(mark.x),Math.round(mark.y));
        draw(ctx,'bones');ctx.restore();
        if (mark.player && mark.age < 1.1) {
          ctx.save();ctx.globalAlpha=Math.min(1,(1.1-mark.age)*3);
          ctx.translate(Math.round(mark.x),Math.round(mark.y-24-mark.age*20));
          draw(ctx,'skull');ctx.restore();
        }
      }
    },
  };
}
