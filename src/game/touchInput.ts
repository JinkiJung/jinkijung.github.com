/** Several fingers may hold the same control; only the last release lifts it. */
export function updateTouchInput(pointers:Map<number,string>,id:number,code:string|undefined,emit:(code:string,down:boolean)=>void){
  const old=pointers.get(id);
  if(old===code)return;
  pointers.delete(id);
  if(old && ![...pointers.values()].includes(old))emit(old,false);
  if(code){
    const held=[...pointers.values()].includes(code);
    pointers.set(id,code);
    if(!held)emit(code,true);
  }
}
