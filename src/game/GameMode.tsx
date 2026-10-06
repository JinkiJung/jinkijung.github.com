import TouchControls from './TouchControls';
import { createDeveloperCode } from './developerCode';
import { loadEnemySprites } from './enemySprite';
import { loadBonusSprite } from './bonus';
import { loadDeathSprites } from './death';
import { loadPlayerSprite } from './playerSprite';
import Results from './Results';
import { RankedRun } from '../leaderboard/client';
import { boardStore, leaderboardApi } from '../leaderboard/service';
import { errorMessage, glassComplete } from '../leaderboard/protocol';
import { LABELS, WEAPONS, type Weapon } from './weapons';
import { useEffect, useRef, useState } from 'react';
import { captureGameWorld } from './stages';
import { startGame, type Stats, type GameControls } from './engine';
import './game.css';

export default function GameMode({ onClose, onRetry }: { onClose: () => void; onRetry:()=>void }) {
  const surface = useRef<HTMLCanvasElement>(null), actors = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLDivElement>(null), close = useRef<HTMLButtonElement>(null);
  const controls=useRef<GameControls>({developer:false,weapon:'pistol',preview:false});
  const ranked = useRef<RankedRun | null>(null);
  const [paused,setPaused]=useState(false);
  const resume=()=>{controls.current.paused=false;setPaused(false);dialog.current?.focus({preventScroll:true});};
  const pause=()=>{controls.current.paused=true;setPaused(true);};
  const [failed, setFailed] = useState(false);
  const [developer,setDeveloper]=useState(false);
  const [developerUnlocked,setDeveloperUnlocked]=useState(false);
  const [weapon,setWeapon]=useState<Weapon>('pistol');
  const [preview,setPreview]=useState<Stats|null>(null);
  const [status, setStatus] = useState('Getting ready to smash the homepage…');
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<Stats>({ lives:2,ended:false,seconds:0,completedAt:"", fps: 0, broken: 0, total: 0, hp: 5, penalty: '', weapon: 'pistol', score: 0, kills: 0, enemies: 4 });

  const showingResults = useRef(false);
  showingResults.current = stats.ended || !!preview;

  // Keep the engine source aligned with the visible checkbox, including hot reloads.
  controls.current.developer=developer;
  controls.current.weapon=weapon;

  useEffect(() => {
    if (!paused || !ready || stats.ended || preview) return;
    const sequence = createDeveloperCode();
    const unlock = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey ||
        (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable="true"]'))) {
        sequence.reset(); return;
      }
      // Physical key codes also work when a Korean input method is selected.
      if (!sequence.press(event.code, event.repeat)) return;
      event.preventDefault();
      controls.current.developer = true;
      ranked.current?.markDeveloper();
      setDeveloper(true);
      setDeveloperUnlocked(true);
    };
    const reset = () => sequence.reset();
    window.addEventListener('keydown', unlock);
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('keydown', unlock); window.removeEventListener('blur', reset); };
  }, [paused, ready, stats.ended, preview]);

  useEffect(() => {
    const page = document.getElementById('game-page')!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const x = scrollX, y = scrollY;
    const overflow = document.documentElement.style.overflow;
    const animations = (page.getAnimations?.({ subtree: true }) ?? []).filter(a => a.playState === 'running');
    animations.forEach(a => a.pause());
    const controller = new AbortController();
    const run = new RankedRun(leaderboardApi);
    ranked.current = run;
    let dispose: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout>;
    page.inert = true;
    dialog.current?.focus({ preventScroll: true });
    // Lock wheel/keyboard scrolling without changing the viewport width or layout.
    const preventScroll = (e: Event) => {if(!(e.target instanceof HTMLElement && e.target.closest('.glass-results')))e.preventDefault();};
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    const fail = (message: string) => {
      run.cancel();
      dispose?.(); dispose = undefined;
      setReady(false); setFailed(true); setStatus(message);
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { e.preventDefault(); if(controls.current.paused)resume(); else if(controls.current.touchInput && !controls.current.preview)pause(); else onClose(); return; }
      if(e.target instanceof HTMLElement && e.target.closest('input,select,textarea,button') && e.key!=='Tab')return;
      if (['PageDown', 'PageUp', 'Home', 'End', 'Space', 'ArrowUp', 'ArrowDown'].includes(e.code) && e.target !== close.current) e.preventDefault();
      if (e.key === 'Tab') {
        const scope=dialog.current!.querySelector('.glass-pause, .glass-results') ?? dialog.current!;
        const buttons = [...scope.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', keydown);
    const capturedWidth = window.innerWidth;
    const onResize = () => {
      // Keyboards and browser chrome change viewport height. Results must also
      // survive rotation: their completed score and submission belong to this mount.
      if (showingResults.current || window.innerWidth === capturedWidth) return;
      onClose();
    };
    window.addEventListener('resize', onResize);
    const prepare = async () => {
      try {
        // Share the initial read with all homepage tickers and the results panel.
        setStatus('Loading leaderboards…');
        await boardStore.load();
        if (controller.signal.aborted) return;
        const snapshot = await Promise.race([
          captureGameWorld(page, controller.signal, message => { if (!controller.signal.aborted) setStatus(message); }),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('SCENE_TIMEOUT')), 30000); }),
        ]);
        clearTimeout(timer!);
        if (controller.signal.aborted) return;
        setStatus('Loading characters…');
        await Promise.race([
          Promise.all([loadPlayerSprite(),loadDeathSprites(),loadBonusSprite(),loadEnemySprites()]),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('SPRITE_LOAD_FAILED')), 20000); }),
        ]);
        clearTimeout(timer!);
        if(controller.signal.aborted)return;
        setStatus('Preparing your game session…');
        await run.start();
        if (controller.signal.aborted) { run.cancel(); return; }
        document.documentElement.style.overflow = 'hidden';
        setStatus('Starting the game…');
        dispose = startGame(surface.current!, actors.current!, snapshot, setStats, () => fail('Graphics connection lost. Exit and try again.'), () => controls.current, run);
        setReady(true);
      } catch (error) {
        clearTimeout(timer!);
        if (!controller.signal.aborted) {
          controller.abort();
          fail(errorMessage(error));
        }
      }
    };
    const startTimer = setTimeout(() => void prepare(), 0);
    return () => {
      controller.abort(); run.cancel(); clearTimeout(startTimer); clearTimeout(timer!); dispose?.();
      page.inert = false;
      animations.forEach(a => a.play());
      document.documentElement.style.overflow = overflow;
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.scrollTo({ left: x, top: y, behavior: 'instant' });
      (previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : document.querySelector<HTMLButtonElement>('.glass-launch'))?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return <div className="glass-game" lang="en" tabIndex={-1} role="dialog" aria-modal="true" aria-label="SMASH game" ref={dialog}>
    <canvas ref={surface} className="glass-surface" aria-hidden="true" />
    <canvas ref={actors} className="glass-actors" aria-label="Use WASD or arrow keys to move and aim. Press X to fire forward and Z for melee." />
    <div className={`glass-topbar glass-hud${ready && !paused && !stats.ended && !preview && stats.playerNearTop ? ' is-near-player' : ''}`}>
      <div className="glass-hud-title"><span>SMASH Jinki</span><strong aria-label="Score">{String(stats.score).padStart(8,'0')}</strong></div>
      <div className="glass-hud-lives" aria-label={developer?'Unlimited lives':`${stats.lives} lives remaining`}><svg viewBox="0 0 16 14" aria-hidden="true"><path d="M2 0h4v2h4V0h4v2h2v6h-2v2h-2v2h-2v2H6v-2H4v-2H2V8H0V2h2Z"/></svg><span>× {developer?'∞':String(stats.lives).padStart(2,'0')}</span></div>
      <div className="glass-hud-progress" aria-label="Page smashed"><span>SMASHED</span><strong>{stats.total?Math.round(stats.broken/stats.total*100):0}%</strong></div>
      <button ref={close} className="glass-pause-trigger" aria-label={ready?'Pause game':'Exit game'} title={ready?'Pause':'Exit'} disabled={stats.ended || !!preview} onClick={ready?pause:onClose}><svg viewBox="0 0 24 24" aria-hidden="true">{ready?<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>:<path d="m6 4 6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6-6-6Z"/>}</svg></button>
    </div>
    {paused && !stats.ended && !preview && <div className="glass-results-backdrop"><section className="glass-results glass-pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <header className="glass-window-header"><h2 id="pause-title">Paused</h2><button autoFocus aria-label="Resume game" title="Resume game" onClick={resume}>×</button></header>
      <div className="glass-pause-actions"><button onClick={onClose}>Exit game</button><button onClick={onRetry}>Restart</button></div>
      <button className="glass-finish-run" onClick={()=>{resume();controls.current.finish?.();}}>Finish run &amp; view score</button>
      {developerUnlocked && <div className="glass-dev-options">
      <div className="glass-developer"><label><input type="checkbox" checked={developer} disabled={stats.ended || !!preview} onChange={e=>{const checked=e.currentTarget.checked;controls.current.developer=checked;if(checked)ranked.current?.markDeveloper();setDeveloper(checked);dialog.current?.focus();}}/> Developer mode</label>
      {developer && <><select aria-label="Select weapon" value={weapon} onChange={e=>{const value=e.target.value as Weapon;setWeapon(value);controls.current.weapon=value;dialog.current?.focus();}}>{(['pistol',...WEAPONS] as Weapon[]).map(w=><option key={w} value={w}>{LABELS[w]}</option>)}</select>
      <button disabled={!ready || !!preview} onClick={()=>{controls.current.preview=true;setPreview({...stats,completedAt:new Date().toISOString()});}}>Preview results</button>
      <button disabled={!ready || !!preview} onClick={()=>{controls.current.preview=true;setPreview({...stats,score:((boardStore.getSnapshot().data?.monthly.entries[0]?.score ?? 0)+500),completedAt:new Date().toISOString()});}}>Preview high score</button></>}
      </div>
      </div>}
    </section></div>}
    {!ready && <div className="glass-loading" role="status"><span className="glass-loading-mark" aria-hidden="true" /><p>{status}</p>{failed && <button onClick={onRetry}>Try again</button>}</div>}
    {ready && !paused && !stats.ended && !preview && <>
      <TouchControls onInput={(code,down)=>controls.current.touchInput?.(code,down)} />
      <div className="glass-help"><span><kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd> Move · aim</span><span><kbd>X</kbd> Fire · hold for rapid fire</span><span><kbd>Z</kbd> Melee</span><span className="glass-fps">{stats.fps || '—'} FPS · WEBGL</span></div>
      {glassComplete({totalGlassArea:stats.total,destroyedGlassArea:stats.broken}) && <div className="glass-complete" role="status">PAGE CLEARED <span>All glass shattered. Text still provides cover.</span></div>}
    </>}
    {(stats.ended || preview) && <Results run={ranked.current} onRetry={onRetry} stats={preview ?? stats} preview={!!preview} onClose={onClose} onResume={()=>{controls.current.preview=false;setPreview(null);resume();}}/>}
  </div>;
}
