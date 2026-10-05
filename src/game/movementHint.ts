export function drawCombatHint(ctx:CanvasRenderingContext2D,x:number,y:number,time:number,width:number,key:'Z'|'X'){
  const cx=Math.max(82,Math.min(width-82,x)),cy=Math.max(110,y-84);
  ctx.save();ctx.translate(cx,cy+Math.sin(time*3)*2);
  ctx.fillStyle='#effff5';ctx.strokeStyle='#285341';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-76,-31,152,62,14);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-7,31);ctx.lineTo(0,41);ctx.lineTo(8,31);ctx.fill();ctx.stroke();
  ctx.fillStyle='#2d8562';ctx.beginPath();ctx.roundRect(-61,-18,36,36,7);ctx.fill();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.font='bold 22px monospace';ctx.fillText(key,-43,1);
  ctx.fillStyle='#285341';ctx.font='bold 13px sans-serif';ctx.fillText(key==='Z'?'Melee':'Fire',24,-7);
  ctx.font='11px sans-serif';ctx.fillText('Press to try',24,12);ctx.restore();
}

// Pictograms only: a speech bubble with four pressing arrow keys.
export function drawMovementHint(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, width: number) {
  const cx = Math.max(58, Math.min(width - 58, x));
  const cy = Math.max(100, y - 84);
  ctx.save();
  ctx.translate(cx, cy + Math.sin(time * 3) * 2);
  ctx.fillStyle = '#effff5'; ctx.strokeStyle = '#285341'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-51, -38, 102, 76, 16); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-7, 37); ctx.lineTo(0, 47); ctx.lineTo(8, 37); ctx.fill(); ctx.stroke();
  const keys = [{x:0,y:-17,angle:0},{x:-28,y:13,angle:-Math.PI/2},{x:0,y:13,angle:Math.PI},{x:28,y:13,angle:Math.PI/2}];
  keys.forEach((key, i) => {
    const active = Math.floor(time * 2.5) % 4 === i;
    ctx.save(); ctx.translate(key.x, key.y + (active ? 2 : 0));
    ctx.fillStyle = active ? '#2d8562' : '#dae9de';
    ctx.strokeStyle = '#65947b'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(-12, -12, 24, 24, 5); ctx.fill(); ctx.stroke();
    ctx.rotate(key.angle); ctx.strokeStyle = active ? '#fff' : '#285341'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0,6); ctx.lineTo(0,-6); ctx.moveTo(-5,-1); ctx.lineTo(0,-6); ctx.lineTo(5,-1); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}
