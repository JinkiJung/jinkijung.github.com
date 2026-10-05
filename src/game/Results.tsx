import { useEffect, useRef, useState } from 'react';
import LeaderboardPanel from '../leaderboard/LeaderboardPanel';
import { boardStore, useLeaderboards } from '../leaderboard/service';
import { errorMessage, normalizeNickname, shouldSubmit, type Accepted } from '../leaderboard/protocol';
import type { RankedRun } from '../leaderboard/client';
import type { Stats } from './engine';

export default function Results({ stats, preview, run, onClose, onResume, onRetry }: { stats: Stats; preview: boolean; run: RankedRun | null; onClose: () => void; onResume: () => void; onRetry: () => void }) {
  const [mobile, setMobile] = useState(() => matchMedia('(any-pointer: coarse), (max-width: 650px)').matches);
  useEffect(() => { const query = matchMedia('(any-pointer: coarse), (max-width: 650px)'); const update = () => setMobile(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nickname, setNickname] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState<Accepted | null>(null);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const boards = useLeaderboards();
  const completion = preview ? undefined : stats.completion;
  const qualifies = !!completion && !!boards.data && shouldSubmit(completion, boards.data);
  let validName = false;
  try { normalizeNickname(nickname); validName = true; } catch { /* Validation hint is shown below. */ }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current || accepted || failed || !qualifies || !run || !validName) return;
    busy.current = true; setPending(true); setMessage('Submitting your score…');
    try {
      const result = await run.submit(nickname, seconds => { if (mounted.current) setMessage(`Connection interrupted. Retrying the same submission in ${seconds}s…`); });
      if (mounted.current) { setAccepted(result); setMessage(''); }
      // One shared refresh after acceptance, including accepted/outside-top-ten.
      void boardStore.load(true).catch(() => {});
    } catch (error) {
      if (mounted.current) { setFailed(run.nicknameLocked); setMessage(errorMessage(error)); }
    } finally { busy.current = false; if (mounted.current) setPending(false); }
  };
  const registration = <div className="result-registration">
    {preview ? <p>Developer preview · scores are not submitted.</p>
      : completion?.ineligible ? (completion.ineligible === 'SCORE_MISMATCH' ? null : <p role="status">{errorMessage(new Error(completion.ineligible))}</p>)
      : !boards.data ? <p>Checking leaderboard eligibility once scores load.</p>
      : !qualifies && !accepted && !pending && !failed ? <p>Your score is below the current weekly and monthly cutoffs, so it will not be submitted. Refresh the leaderboard if a new period has started.</p> : null}
    {qualifies && !accepted && !failed && <form onSubmit={submit}>
      <label htmlFor="score-nickname">Submit score · nickname</label>
      <div className="result-name"><input id="score-nickname" value={nickname} onChange={e => setNickname(e.target.value)} disabled={pending || run?.nicknameLocked} required placeholder="1–20 characters" aria-describedby="nickname-hint" autoComplete="nickname" /><button disabled={pending || !validName}>Submit score</button></div>
      <small id="nickname-hint">Letters, numbers, spaces, underscores, and hyphens only. No emoji.</small>
    </form>}
    {message && message !== errorMessage(new Error('SCORE_MISMATCH')) && <p role={failed ? 'alert' : 'status'}>{message}</p>}
    {accepted && <p role="status">{Object.values(accepted.qualified).some(Boolean) ? 'Score submitted. You made the leaderboard!' : 'Score accepted, but it did not make the top 10.'}</p>}
  </div>;
  return <div className="glass-results-backdrop"><section className={`glass-results glass-game-over-window${mobile ? ' glass-results-mobile' : ''}${showLeaderboard ? ' has-leaderboard' : ''}`} aria-label="Game results">
    <h2 className="result-game-over">GAME OVER <strong>{stats.score.toLocaleString()}</strong></h2>
    {registration}
    <div className="result-actions result-game-over-actions">
      {preview && <button className="result-resume" onClick={onResume}>Back to game</button>}
      <button autoFocus type="button" aria-label="Exit" title="Exit" onClick={onClose}>{mobile ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" /></svg> : 'Exit'}</button>
      <button type="button" aria-label="Retry" title="Retry" onClick={onRetry}>{mobile ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></svg> : 'Retry'}</button>
    </div>
    {mobile && <button className="result-show-leaderboard" type="button" aria-expanded={showLeaderboard} aria-controls="result-leaderboard" onClick={() => setShowLeaderboard(value => !value)}>{showLeaderboard ? 'Hide leaderboard' : 'View leaderboard'}</button>}
    {(!mobile || showLeaderboard) && <div id="result-leaderboard"><LeaderboardPanel /></div>}
  </section></div>;
}
