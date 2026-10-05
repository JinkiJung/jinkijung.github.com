import { useState } from 'react';
import { boardStore, useLeaderboards } from './service';
import { formatKST, type BoardKind } from './protocol';

const titles = { weekly: 'WEEKLY BEST', monthly: 'MONTHLY BEST', glass: 'ALL CLEAR BEST' };
export default function LeaderboardPanel() {
  const [kind, setKind] = useState<BoardKind>('weekly');
  const state = useLeaderboards();
  const period = state.data?.[kind];
  return <section className="result-embedded-leaderboard" aria-label="Leaderboard" aria-busy={state.status === 'loading'}>
    <div className="result-tabs">{(Object.keys(titles) as BoardKind[]).map(key => <button key={key} type="button" aria-pressed={key === kind} onClick={() => setKind(key)}>{titles[key]}</button>)}</div>
    <button type="button" disabled={state.status === 'loading'} onClick={() => void boardStore.load(true).catch(() => {})}>{state.status === 'error' ? 'Try again' : 'Refresh'}</button>
    {(state.status === 'idle' || state.status === 'loading') && <p role="status">Loading scores…</p>}
    {state.status === 'error' && <p role="alert">Unable to load the leaderboard. Please try again.</p>}
    {period && <>
      {period.entries.length === 0 ? <p>No scores yet. Hit SMASH and claim your spot.</p> : <table>
        <thead><tr><th>Rank</th><th>Nickname</th><th>Score</th><th>Finished (KST)</th></tr></thead>
        <tbody>{period.entries.map((entry, index) => <tr key={`${index}-${entry.completedAt}`}>
          <td>{index + 1}</td><td>{entry.nickname}</td><td>{entry.score.toLocaleString()}<small>{entry.playDurationSeconds.toFixed(1)}s</small></td><td><time dateTime={entry.completedAt}>{formatKST(entry.completedAt)}</time></td>
        </tr>)}</tbody>
      </table>}
    </>}
  </section>;
}
