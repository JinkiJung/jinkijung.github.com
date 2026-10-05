// Area accounting is updated only when glass breaks, never by scanning each frame.
export function createCareerUnlocks(groups: { id:number; area:number }[][]) {
  const states = groups.map(shards => ({ shards, total:shards.reduce((sum,s)=>sum+s.area,0), broken:0, unlocked:false }));
  const membership = new Map<number, { index:number; area:number }>();
  groups.forEach((shards,index)=>shards.forEach(s=>membership.set(s.id,{index,area:s.area})));
  const detached = new Set<number>();
  return {
    unlocked(index:number) { return states[index]?.unlocked ?? false; },
    detach(id:number) {
      const member=membership.get(id);
      if(!member || detached.has(id))return [];
      detached.add(id);
      const state=states[member.index];state.broken+=member.area;
      if(state.unlocked || state.total<=0 || state.broken+1e-8<state.total*.5)return [];
      state.unlocked=true;
      return state.shards.map(s=>s.id);
    },
  };
}
