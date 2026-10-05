import { useEffect, useRef, useState } from "react";
import { INTRO, STAGES, type Link, type Stage } from "./data";

const IMG_RATIO = 1536 / 1024;

// Where each stage's scene sits in voyage.jpg, in % of the image width.
const ZONES: Record<Stage["id"], [number, number]> = {
  research: [0, 31],
  standard: [32, 68],
  product:  [69, 100],
};

function Links({ links }: { links: Link[] }) {
  return (
    <span className="e2e-links">
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
      ))}
    </span>
  );
}

function StageText({ stage }: { stage: Stage }) {
  return (
    <div className="e2e-text" key={stage.id}>
      <div className="e2e-text-head">
        <span className="wf-detail-label">{stage.step} {stage.name} · {stage.org} · {stage.period} · {stage.role}</span>
        <h2 className="e2e-text-title">{stage.title}</h2>
        {stage.links.length > 0 && (
          <div className="e2e-stage-links">
            <span className="e2e-work-tag">Evidence</span>
            <Links links={stage.links} />
          </div>
        )}
      </div>
      <div className="e2e-text-body">
        <div className="e2e-paras">
          {stage.paras.map((t) => <p key={t}>{t}</p>)}
        </div>
        {stage.works.length > 0 && (
          <ol className="e2e-works">
            {stage.works.map((w) => (
              <li key={w.name} className="e2e-work">
                <span className="e2e-work-tag">{w.tag}</span>
                <strong className="e2e-work-name">{w.name}</strong>
                <p>{w.summary}</p>
                <Links links={w.links} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// The whole illustrated route stays on screen; the text below follows the scene you pick.
export default function Voyage() {
  const [active, setActive] = useState<Stage["id"] | null>(null);
  const stage = STAGES.find((s) => s.id === active);
  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Fit the 3:2 image inside the available area so the zones line up with it.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.min(width, height * IMG_RATIO);
      setBox({ w, h: w / IMG_RATIO });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const steps: (Stage["id"] | null)[] = [null, ...STAGES.map((s) => s.id)];

  return (
    <div className="e2e-voyage">
      <div className="e2e-voyage-frame" ref={frameRef}>
        <div className="e2e-voyage-img" style={{ width: box.w, height: box.h }}>
          <img src="/images/e2e/voyage.jpg" alt="A route from a lighthouse, through a connected harbor, to a phone on a ship's bridge" />
          {STAGES.map((s) => {
            const [x0, x1] = ZONES[s.id];
            const dim = active !== null && active !== s.id;
            return (
              <button
                key={s.id}
                className={`e2e-zone${dim ? " is-dim" : ""}${active === s.id ? " is-active" : ""}`}
                style={{ left: `${x0}%`, width: `${x1 - x0}%` }}
                onClick={() => setActive(active === s.id ? null : s.id)}
                aria-label={`${s.name} stage`}
              >
                <span className="e2e-zone-label">
                  <span className="e2e-zone-step">{s.step}</span> {s.name}
                  <span className="e2e-zone-org"> · {s.org}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wf-detail e2e-voyage-detail">
        <div className="e2e-detail-reference" aria-hidden="true">
          <StageText stage={STAGES.find(s => s.id === "standard")!} />
        </div>
        <div className="e2e-detail-content">
        {stage ? (
          <StageText stage={stage} />
        ) : (
          <div className="e2e-text">
            <div className="e2e-text-head">
              <span className="wf-detail-label">{INTRO.eyebrow} · tap a scene</span>
              <h2 className="e2e-text-title">{INTRO.title}</h2>
            </div>
            <div className="e2e-text-body">
              <div className="e2e-paras"><p>{INTRO.body}</p></div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="wf-indicators">
        {steps.map((id) => (
          <button
            key={id ?? "route"}
            className={`wf-indicator ${active === id ? "is-active" : ""}`}
            onClick={() => setActive(id)}
            aria-label={id ? `${id} stage` : "Route"}
          />
        ))}
      </div>
    </div>
  );
}
