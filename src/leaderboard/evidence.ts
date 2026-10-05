import type { Evidence } from './protocol.ts';
export type GlassOwner = 'player' | 'slab' | 'npc';

// Fed by the renderer's one-time detach boundary, never inferred from score or %.
export function createEvidence(totalGlassArea: number) {
  const seen = new Set<number>();
  const value: Evidence = { playerGlassShards: 0, slabGlassShards: 0, npcGlassShards: 0, totalDestroyedGlassShards: 0, enemyKills: 0, concreteTopples: 0, totalGlassArea, destroyedGlassArea: 0, juggernautKills: 0, juggernautCollisionKills: 0, oilPitJuggernautKills: 0 };
  return {
    destroy(id: number, area: number, owner: GlassOwner) {
      if (seen.has(id)) return;
      seen.add(id);
      value.totalDestroyedGlassShards++;
      value.destroyedGlassArea += area;
      if (owner === 'npc') value.npcGlassShards++;
      else { value.playerGlassShards++; if (owner === 'slab') value.slabGlassShards++; }
    },
    kill(juggernaut = false) { value.enemyKills++; if (juggernaut) value.juggernautKills++; },
    bonus(kind: 'collision' | 'oilPit') { if (kind === 'collision') value.juggernautCollisionKills++; else value.oilPitJuggernautKills++; },
    topple() { value.concreteTopples++; },
    snapshot(): Readonly<Evidence> { return Object.freeze({ ...value }); },
  };
}
