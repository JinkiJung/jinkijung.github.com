import { createPortal } from 'react-dom';
import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import './game.css';
const GameMode = lazy(() => import('./GameMode'));

class GameLoadBoundary extends Component<{ children: ReactNode; onClose: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <div className="glass-boot" role="alert">Unable to load the game. Refresh the page and try again.<button onClick={this.props.onClose}>Exit</button></div>
      : this.props.children;
  }
}

export default function GameLauncher() {
  const [open, setOpen] = useState(false);
  const [round,setRound]=useState(0);
  const close = useCallback(() => setOpen(false), []);
  return <>
    <button className="glass-launch" type="button" onClick={() => setOpen(true)} aria-label="Start SMASH" title="SMASH"><svg className="header-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></svg><span className="header-link-label">SMASH</span></button>
    {open && createPortal(<GameLoadBoundary onClose={close}><Suspense fallback={<div className="glass-boot" role="status">Loading game… <button onClick={close}>Cancel</button></div>}><GameMode key={round} onClose={close} onRetry={()=>setRound(value=>value+1)} /></Suspense></GameLoadBoundary>,document.body)}
  </>;
}
