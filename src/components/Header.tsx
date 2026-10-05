import GameLauncher from "../game/GameLauncher";
import { PROFILE, SECTIONS } from "../data";

function LinkIcon({ id }: { id: string }) {
  return (
    <svg className="header-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {id === "cv" && <>
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </>}
      {id === "portfolio" && <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a22 22 0 0 0 18 0M12 12v3" />
      </>}
      {id === "github" && <path fill="currentColor" stroke="none" d="M12 .75a11.25 11.25 0 0 0-3.558 21.922c.563.104.768-.244.768-.543 0-.267-.01-.974-.015-1.912-3.13.68-3.79-1.51-3.79-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.004 1.721 2.634 1.224 3.275.936.102-.727.393-1.224.715-1.506-2.498-.284-5.124-1.25-5.124-5.563 0-1.229.44-2.234 1.16-3.02-.117-.284-.503-1.43.11-2.98 0 0 .945-.303 3.094 1.154A10.8 10.8 0 0 1 12 6.18c.956.005 1.918.13 2.817.379 2.148-1.457 3.091-1.154 3.091-1.154.615 1.55.229 2.696.113 2.98.721.786 1.157 1.791 1.157 3.02 0 4.324-2.63 5.276-5.136 5.554.404.349.765 1.036.765 2.088 0 1.507-.014 2.723-.014 3.092 0 .302.203.653.774.542A11.251 11.251 0 0 0 12 .75Z" />}
      {id === "linkedin" && <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <path d="M7.5 11v6M11.5 17v-6M11.5 13.5a2.5 2.5 0 0 1 5 0V17" />
      </>}
    </svg>
  );
}

export default function Header() {
  return (
    <header className="header">
      <a href="#" className="header-brand" onClick={(e) => e.preventDefault()}>
        <span className="header-mark">jj</span>
        <span className="header-name">{PROFILE.name}</span>
        <span className="header-meta" style={{ marginLeft: 8 }}>· {PROFILE.role}</span>
      </a>
      <nav className="header-nav">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            title={s.label}
          >
            <LinkIcon id={s.id} />
            <span className="header-link-label">{s.label}</span>
          </a>
        ))}
        <GameLauncher />
      </nav>
    </header>
  );
}
