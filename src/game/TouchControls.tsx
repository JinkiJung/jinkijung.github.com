import { clampControl, controlSize, defaultLayout, parseLayout, LAYOUT_KEY, type ControlId } from './controlLayout';
import { joystickPose } from './joystick';
import { updateTouchInput } from './touchInput';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

export default function TouchControls({onInput,editing=false,onDone}:{onInput:(code:string,down:boolean)=>void;editing?:boolean;onDone?:()=>void}) {
  const [viewport,setViewport]=useState({width:innerWidth,height:innerHeight});
  const [layout,setLayout]=useState(()=>{try{return parseLayout(localStorage.getItem(LAYOUT_KEY));}catch{return null;}});
  const [storageError,setStorageError]=useState(false);
  const drag=useRef<{id:ControlId;pointer:number;dx:number;dy:number}|null>(null);
  useEffect(()=>{const resize=()=>setViewport({width:innerWidth,height:innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  const position=(id:ControlId)=>{
    const point=(layout ?? defaultLayout(viewport.width,viewport.height))[id];
    return clampControl(point.x*viewport.width,point.y*viewport.height,controlSize(id,viewport.width),viewport.width,viewport.height);
  };
  const slot=(id:ControlId)=>{
    const p=position(id);
    return {style:{left:`${p.x*100}%`,top:`${p.y*100}%`,'--control-size':`${controlSize(id,viewport.width)}px`} as CSSProperties,
      onPointerDownCapture:(e:PointerEvent<HTMLDivElement>)=>{
        if(!editing)return;e.preventDefault();e.stopPropagation();if(drag.current)return;
        drag.current={id,pointer:e.pointerId,dx:e.clientX-p.x*viewport.width,dy:e.clientY-p.y*viewport.height};e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove:(e:PointerEvent<HTMLDivElement>)=>{
        const d=drag.current;if(!editing || !d || d.pointer!==e.pointerId)return;e.preventDefault();
        const next=clampControl(e.clientX-d.dx,e.clientY-d.dy,controlSize(id,viewport.width),viewport.width,viewport.height);
        setLayout(old=>({...old ?? defaultLayout(viewport.width,viewport.height),[id]:next}));
      },
      onPointerUp:()=>{drag.current=null;},onPointerCancel:()=>{drag.current=null;},onLostPointerCapture:()=>{drag.current=null;},
    };
  };
  const save=()=>{try{if(layout)localStorage.setItem(LAYOUT_KEY,JSON.stringify(layout));else localStorage.removeItem(LAYOUT_KEY);onDone?.();}catch{setStorageError(true);}};
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
  return <div className={`glass-touch-controls${editing?' is-editing':''}`} aria-label="Touch game controls">
    {editing && <section className="glass-control-editor" aria-label="Edit control layout"><strong>Control layout</strong><p>Drag the joystick and buttons to move them.</p><div><button type="button" onClick={()=>{setLayout(null);setStorageError(false);}}>Reset</button><button type="button" onClick={onDone}>Cancel</button><button type="button" onClick={save}>Save</button></div>{storageError && <small>Unable to save on this browser. Enable site storage and try again.</small>}</section>}
    <div className="glass-control-slot" data-control="stick" {...slot('stick')}>
    <div className="glass-touch-stick" role="group" aria-label="Movement joystick. Drag to move."
      onContextMenu={e=>e.preventDefault()}
      onPointerDown={e=>{e.preventDefault();if(stickPointer.current!==null)return;stickPointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}}
      onPointerMove={moveStick}
      onPointerUp={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
      onPointerCancel={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
      onLostPointerCapture={e=>{if(stickPointer.current===e.pointerId)stopStick();}}
    ><span className="glass-stick-ring" aria-hidden="true"/><span className="glass-stick-knob" aria-hidden="true" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}/></div>
    </div>
    <div className="glass-control-slot glass-touch-actions" data-control="KeyZ" {...slot('KeyZ')}>{button('KeyZ','Melee','Z')}</div>
    <div className="glass-control-slot glass-touch-actions" data-control="KeyX" {...slot('KeyX')}>{button('KeyX','Fire','X')}</div>
  </div>;
}
