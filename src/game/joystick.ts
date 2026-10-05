export function joystickPose(dx:number,dy:number){
  const distance=Math.hypot(dx,dy),scale=distance>44?44/distance:1;
  const keys:string[]=[];
  if(distance>10){
    const x=Math.abs(dx),y=Math.abs(dy);
    const horizontal=dx<0?'ArrowLeft':'ArrowRight',vertical=dy<0?'ArrowUp':'ArrowDown';
    // Eight-way travel; put the dominant axis last to preserve cardinal aiming.
    if(x>=y){if(y>x*.45)keys.push(vertical);keys.push(horizontal);}
    else {if(x>y*.45)keys.push(horizontal);keys.push(vertical);}
  }
  return {x:dx*scale,y:dy*scale,keys};
}
