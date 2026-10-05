import { useState } from 'react';
import { boardStore, useLeaderboards } from '../leaderboard/service';
import { formatKST, type BoardKind } from '../leaderboard/protocol';

type FooterKind = 'weekly' | 'monthly' | 'completion';
const TITLES: Record<FooterKind, string> = { weekly: 'WEEKLY BEST', monthly: 'MONTHLY BEST', completion: 'ALL CLEAR BEST' };
const EMPTY_MESSAGES = [
  'Click SMASH. This page had it coming.',
  'See that SMASH button? It is not a decoration.',
  'Click SMASH. Leave a score, not a comment.',
  'Go on, click SMASH. The glass is on us.',
  'Your name could be here. Start with SMASH.',
] as const;
export default function LeaderboardFooter({ kind }: { kind: FooterKind }) {
  const [emptyMessage] = useState(() => EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]);
  const state = useLeaderboards();
  const key: BoardKind = kind === 'completion' ? 'glass' : kind;
  const entries = state.data?.[key].entries ?? [];
  return (
    <section className="wf-footer leaderboard-footer" aria-label={`${TITLES[kind]} — Leaderboard`} data-breakable>
      <div className="leaderboard-label"><strong>{TITLES[kind]}</strong></div>
      {state.status === 'loading' || state.status === 'idle' ? <span className="leaderboard-state" role="status">Loading scores…</span>
        : state.status === 'error' ? <span className="leaderboard-state" role="status">Unable to load scores. <button onClick={() => void boardStore.load(true).catch(() => {})}>Try again</button></span>
        : !entries.length ? <span className="leaderboard-state" lang="en">{emptyMessage}</span>
        : <div className="leaderboard-window" tabIndex={0} aria-label="Leaderboard · times in KST · scroll horizontally for more scores">
          <div className="wf-ticker-track leaderboard-track">
            <ol className="leaderboard-group">
              {entries.map((entry, index) => <li className="wf-ticker-item leaderboard-entry" key={`${index}-${entry.completedAt}`}>
                <span className={`leaderboard-rank${index === 0 ? ' is-first' : ''}`}>#{String(index + 1).padStart(2, '0')}</span>
                <span className="wf-ticker-name">{entry.nickname}</span>
                <span className="leaderboard-score">{entry.score.toLocaleString('en-US')} <small>PTS</small></span>
                <time dateTime={entry.completedAt}>{formatKST(entry.completedAt)} KST</time>
                <span className="wf-ticker-sep" aria-hidden="true">◆</span>
              </li>)}
            </ol>
          </div>
        </div>}
    </section>
  );
}
