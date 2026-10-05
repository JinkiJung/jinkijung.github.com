import { LeaderboardApi } from './client.ts';
import type { Boards } from './protocol.ts';

export type BoardState = { status: 'idle' | 'loading' | 'ready' | 'error'; data?: Boards; error?: unknown };
export function createBoardStore(api: Pick<LeaderboardApi, 'leaderboards'>) {
  let state: BoardState = { status: 'idle' };
  let pending: Promise<Boards> | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: BoardState) => { state = next; listeners.forEach(listener => listener()); };
  const load = (refresh = false): Promise<Boards> => {
    if (pending) return pending;
    if (!refresh && state.data) return Promise.resolve(state.data);
    publish({ ...state, status: 'loading', error: undefined });
    pending = api.leaderboards().then(data => { publish({ status: 'ready', data }); return data; }, error => {
      publish({ ...state, status: 'error', error }); throw error;
    }).finally(() => { pending = undefined; });
    return pending;
  };
  return { getSnapshot: () => state, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, load };
}
