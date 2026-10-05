export type PenaltyKind = 'ice' | 'one-way' | 'no-fire';
export type PenaltyRegion = {x:number;y:number;w:number;h:number;kind:PenaltyKind;direction:number};
export function penaltyAt(x:number,y:number,regions:PenaltyRegion[],exposed:(x:number,y:number)=>boolean) {
  const region=regions.find(r=>x>=r.x && x<r.x+r.w && y>=r.y && y<r.y+r.h);
  return region && exposed(x,y)?region:null;
}
export function penaltyInput(x:number,y:number,region:PenaltyRegion|null) {
  if(region?.kind==='one-way')return {x:0,y:region.direction<0?Math.min(0,y):Math.max(0,y)};
  return {x,y};
}
export const PENALTY_LABELS={ice:'❄ ICE', 'one-way':'↕ ONE WAY', 'no-fire':'⊘ NO FIRE'};
export const PENALTY_COLORS={ice:[.08,.37,.59], 'one-way':[.13,.4,.36], 'no-fire':[.5,.2,.18]};
