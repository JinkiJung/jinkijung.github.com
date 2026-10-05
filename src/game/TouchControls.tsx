import { joystickPose } from './joystick';
import { updateTouchInput } from './touchInput';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

export default function TouchControls({onInput}:{onInput:(code:string,down:boolean)=>void}) {
  const pointers=useRef(new Map<number,string>());
  const input=useRef(onInput); input.current=onInput;
  const stickPointer=useRef<number|null>(null),stickKeys=useRef<string[]>([]);
  const [stick,setStick]=useState({x:0,y:0});
  const stopStick=()=>{for(const code of stickKeys.current)input.current(code,false);stickKeys.current=[];stickPointer.current=null;setStick({x:0,y:0});};
  const moveStick=(e:PointerEvent<HTMLDivElement>)=>{
    if(stickPointer.current!==e.pointerId)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const pose=joystickPose(e.clientX-rect.left-rect.width/2,e.clientY-rect.top-rect.height/2);
    setStick({x:pose.x,y:pose.y});
    if(pose.keys.join()!==stickKeys.current.join()){
      for(const code of stickKeys.current)input.current(code,false);
      for(const code of pose.keys)input.current(code,true);
      stickKeys.current=pose.keys;
    }
  };
  const [pressed,setPressed]=useState<string[]>([]);
  const change=(id:number,code?:string)=>{
    updateTouchInput(pointers.current,id,code,input.current);
    setPressed([...pointers.current.values()]);
  };
  useEffect(()=>{
    const clear=()=>{
      stopStick();
      for(const code of new Set(pointers.current.values()))input.current(code,false);
      pointers.current.clear();setPressed([]);
    };
    window.addEventListener('blur',clear);
    document.addEventListener('visibilitychange',clear);
    return ()=>{clear();window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};
  },[]);
  const release=(e:PointerEvent<HTMLButtonElement>)=>change(e.pointerId);
  const button=(code:string,label:string,icon:string)=><button
    key={code} type="button" className={`glass-touch-key key-${code}`} data-game-key={code}
    aria-label={label} aria-pressed={pressed.includes(code)}
    onContextMenu={e=>e.preventDefault()}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);change(e.pointerId,code);}}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onKeyDown={e=>{if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();input.current(code,true);}}}
    onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();input.current(code,false);}}}
    onBlur={()=>input.current(code,false)}
  ><span aria-hidden="true">{icon}</span><small>{label}</small></button>;
  return <div className="glass-touch-controls" aria-label="Touch game controls">
    <div className="glass-touch-stick" role="group" aria-label="Movement joystick. Drag to move."
      onContextMenu={e=>e.preventDefault()}
      onPointerDown={e=>{e.preventDefault();if(stickPointer.current!==null)return;stickPointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}}
      onPointerMove={moveStick}
      onPointerUp={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
      onPointerCancel={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
      onLostPointerCapture={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
    ><span className="glass-stick-ring" aria-hidden="true"/><span className="glass-stick-knob" aria-hidden="true" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}/></div>
    <div className="glass-touch-actions" role="group" aria-label="Attack">
      {button('KeyZ','Melee','Z')}{button('KeyX','Fire','X')}
    </div>
  </div>;
}
