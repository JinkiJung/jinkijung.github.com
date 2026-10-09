export type ControlId = 'stick' | 'KeyZ' | 'KeyX';
export type ControlLayout = Record<ControlId, {x:number;y:number}>;
export const LAYOUT_KEY = 'smash-control-layout-v1';
export function controlSize(id:ControlId,width:number){return id==='stick'?(width<=360?132:144):(width<=360?64:74);}
export function defaultLayout(width:number,height:number):ControlLayout {
  const stick=controlSize('stick',width),button=controlSize('KeyX',width);
  return {stick:{x:(16+stick/2)/width,y:1-(24+stick/2)/height},KeyZ:{x:1-(28+button*1.5)/width,y:1-(30+button/2)/height},KeyX:{x:1-(16+button/2)/width,y:1-(30+button/2)/height}};
}
export function clampControl(x:number,y:number,size:number,width:number,height:number) {
  const margin=size/2+10;
  return {x:Math.max(margin,Math.min(width-margin,x))/width,y:Math.max(155+size/2,Math.min(height-margin,y))/height};
}
export function parseLayout(value:string|null):ControlLayout|null {
  try {
    const data=JSON.parse(value || 'null');
    if(!data || !['stick','KeyZ','KeyX'].every(id=>['x','y'].every(axis=>typeof data[id]?.[axis]==='number' && Number.isFinite(data[id][axis]) && data[id][axis]>=0 && data[id][axis]<=1)))return null;
    return data;
  }catch{return null;}
}
