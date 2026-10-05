import { useEffect, useSyncExternalStore } from 'react';
import { LeaderboardApi } from './client';
import { createBoardStore } from './store';

export const leaderboardApi = new LeaderboardApi(import.meta.env.VITE_LEADERBOARD_API_URL || 'https://jinki-game-leaderboard.jinki-game-leaderboard.workers.dev');
export const boardStore = createBoardStore(leaderboardApi);
export function useLeaderboards() {
  const state = useSyncExternalStore(boardStore.subscribe, boardStore.getSnapshot);
  useEffect(() => { if (boardStore.getSnapshot().status === 'idle') void boardStore.load().catch(() => {}); }, []);
  return state;
}
