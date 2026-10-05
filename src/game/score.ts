import { BONUS_POINTS, type BonusKind } from './bonus.ts';
import type { createEvidence } from '../leaderboard/evidence.ts';
export const GLASS_POINTS = 10;
export const KILL_POINTS = 500;
export const JUGGERNAUT_POINTS = 750;

export function createScore(evidence?: ReturnType<typeof createEvidence>) {
  let points = 0;
  return {
    get points() { return points; },
    glass(before: number, after: number, playerOwned = true) {
      if (playerOwned) points += Math.max(0, after - before) * GLASS_POINTS;
    },
    bonus(kind:BonusKind) { evidence?.bonus(kind); points+=BONUS_POINTS[kind]; },
    kill(juggernaut = false) { evidence?.kill(juggernaut); points += juggernaut ? JUGGERNAUT_POINTS : KILL_POINTS; },
    topple() { evidence?.topple(); points += GLASS_POINTS; },
  };
}
