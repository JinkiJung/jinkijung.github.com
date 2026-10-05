import { useState, useEffect, useRef, type CSSProperties } from "react";

interface CareerNode {
  id: string;
  label: string;
  col: number;
  y: number;
  role: string;
  period: string;
  url: string;
}

const PHASES: string[][] = [
  ["Academy"],
  ["Research"],
  ["Open source /", "Standard"],
  ["Product Strategy", "& Commercialization"],
];

const NODES: CareerNode[] = [
  { id: "univ",  label: "Soongsil University", col: 0, y: 90,  role: "B.Sc. Media Science",         period: "2003 – 2007",    url: "https://www.ssu.ac.kr/" },
  { id: "grad",  label: "KAIST",               col: 0, y: 124, role: "M.Sc./Ph.D Computer Science", period: "2007 – 2015",    url: "https://www.kaist.ac.kr/" },
  { id: "kaist", label: "KAIST",               col: 1, y: 150, role: "Postdoc Researcher",          period: "2015 – 2016",    url: "https://www.kaist.ac.kr/" },
  { id: "kriso", label: "KRISO",               col: 1, y: 180, role: "Postdoc Researcher",          period: "2016 – 2019",    url: "https://www.kriso.re.kr/" },
  { id: "dmc",   label: "DMC",                 col: 2, y: 210, role: "Senior SW developer",         period: "2019 – 2025",    url: "https://dmc.international/" },
  { id: "aiven", label: "AIVeNautics",         col: 3, y: 232, role: "Technical director",          period: "2025 – present", url: "https://www.aivenautics.com/" },
];

const CONNECTIONS = [
  { from: "univ",  to: "grad"  },
  { from: "kaist", to: "kriso" },
  { from: "grad",  to: "kaist" },
  { from: "kriso", to: "dmc"   },
  { from: "dmc",   to: "aiven" },
];

// ── Layout constants ─────────────────────────────────────────────────────────
const VW       = 1000;
const VH       = 280;   // desktop viewBox height
const VH_M     = 460;   // mobile viewBox height
const COL_W    = VW / 4;
const NODE_X_OFF = 44;
const NODE_X_M   = 44;  // all nodes share same x in mobile
const COL_GAP    = 5;
const R          = 8;

const MOBILE_Y: Record<string, number> = {
  univ: 65, grad: 115, kaist: 200, kriso: 250, dmc: 335, aiven: 420,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ease  = (t: number) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
function nodeX(col: number) { return col * COL_W + NODE_X_OFF; }
// SVG text scales with viewBox; compensate so apparent size stays fixed in CSS px.
// fs(targetPx) = targetPx / (containerW / VW)
function makeFsHelper(containerW: number) {
  const scale = containerW > 0 ? containerW / VW : 1;
  return (px: number) => px / scale;
}

export default function CareerTimeline() {
  const [hovered, setHovered]       = useState<string | null>(null);
  const [selected, setSelected]     = useState<string | null>(null);
  const sectionRef                  = useRef<HTMLElement>(null);
  const [containerW, setContainerW] = useState(1200);

  // Real-time width tracking via ResizeObserver
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setContainerW(entry.contentRect.width)
    );
    ro.observe(el);
    setContainerW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // t = 0 (fully desktop) … 1 (fully mobile), eased
  const t = ease(clamp((800 - containerW) / (800 - 640), 0, 1));

  // Compensate SVG text scaling: keep font sizes fixed in CSS px
  const fs = makeFsHelper(containerW);

  const activeId   = hovered ?? selected;
  const activeNode = NODES.find((n) => n.id === activeId);

  const isConnHighlighted = (from: string, to: string) =>
    hovered === from || hovered === to || selected === from || selected === to;

  // Interpolated node position
  const iX = (col: number)              => lerp(nodeX(col), NODE_X_M, t);
  const iY = (id: string, dy: number)   => lerp(dy, MOBILE_Y[id]!, t);

  // Interpolated viewBox height
  const ivh = lerp(VH, VH_M, t);

  // Desktop col-bg rect: top expands upward as t increases (46 → 0)
  const bgY = lerp(46, 0, t);
  const bgH = ivh - bgY - COL_GAP;

  // Mobile phase bg-label positions (fixed at mobile y, only fades in via opacity)
  const mobileBgLabels = PHASES.map((lines, i) => {
    const nodes = NODES.filter((n) => n.col === i);
    if (!nodes.length) return null;
    const lastId = nodes[nodes.length - 1].id;
    return { text: lines[0], y: MOBILE_Y[lastId]! + 20 };
  }).filter((x): x is { text: string; y: number } => x !== null);

  const nodeHandlers = (id: string) => ({
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick:      () => setSelected(selected === id ? null : id),
    style: { cursor: "pointer" } as CSSProperties,
  });

  return (
    <section className="career" data-breakable ref={sectionRef}>
      {/* ── Header ── */}
      <div className="career-head">
        <span className="career-eyebrow">Career: </span>
        <div className={`career-meta ${activeNode ? "is-visible" : ""}`}>
          {activeNode && (
            <>
              <a className="career-meta-name" href={activeNode.url} target="_blank" rel="noreferrer">
                {activeNode.label} →
              </a>
              <span className="career-meta-dot">·</span>
              <span className="career-meta-role">{activeNode.role}</span>
              <span className="career-meta-dot">·</span>
              <span className="career-meta-period">{activeNode.period}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Unified interpolated SVG ── */}
      <svg
        viewBox={`0 0 ${VW} ${ivh}`}
        className="career-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 4 desktop column backgrounds — fade out */}
        {PHASES.map((_, i) => (
          <rect
            key={`bg-d-${i}`}
            x={i * COL_W + COL_GAP}
            y={bgY}
            width={COL_W - COL_GAP * 2}
            height={bgH}
            rx={8}
            className="career-col-bg"
            style={{ opacity: 1 - t }}
          />
        ))}

        {/* Single mobile background — fade in */}
        <rect
          x={COL_GAP}
          y={0}
          width={VW - COL_GAP * 2}
          height={ivh - COL_GAP}
          rx={8}
          className="career-col-bg"
          style={{ opacity: t, pointerEvents: "none" }}
        />

        {/* Four non-overlapping game regions, independent of decorative cross-fades. */}
        {PHASES.map((_, i) => {
          const edges = [0, 157.5, 292.5, 377.5, VH_M - COL_GAP];
          return <rect key={`game-region-${i}`} className="career-game-region"
            x={lerp(i * COL_W + COL_GAP, COL_GAP, t)}
            y={lerp(bgY, edges[i], t)}
            width={lerp(COL_W - COL_GAP * 2, VW - COL_GAP * 2, t)}
            height={lerp(bgH, edges[i + 1] - edges[i], t)}
            fill="none" pointerEvents="none" aria-hidden="true" />;
        })}

        {/* Desktop column labels — fade out */}
        {PHASES.map((lines, i) => (
          <text
            key={`lbl-d-${i}`}
            textAnchor="middle"
            className="career-col-label"
            style={{ opacity: 1 - t, fontSize: fs(11) }}
          >
            {lines.map((line, j) => (
              <tspan key={j} x={i * COL_W + COL_W / 2} y={j === 0 ? 18 : 34}>
                {line}
              </tspan>
            ))}
          </text>
        ))}

        {/* Mobile phase labels — fade in as faded background text */}
        {mobileBgLabels.map(({ text, y }, i) => (
          <text
            key={`lbl-m-${i}`}
            x={VW - 16}
            y={y}
            textAnchor="end"
            className="career-bg-label"
            style={{ opacity: t * 0.09, fontSize: fs(24) }}
          >
            {text}
          </text>
        ))}

        {/* Connections */}
        {CONNECTIONS.map(({ from, to }) => {
          const fNode = NODES.find((n) => n.id === from)!;
          const tNode = NODES.find((n) => n.id === to)!;
          const hi   = isConnHighlighted(from, to);
          const cls  = `career-conn${hi ? " is-active" : ""}`;
          const sameCol = fNode.col === tNode.col;

          if (sameCol) {
            // Vertical line — x moves together as col collapses to mobile
            const x = iX(fNode.col);
            return (
              <line
                key={`${from}-${to}`}
                x1={x} y1={iY(from, fNode.y) + R}
                x2={x} y2={iY(to, tNode.y) - R}
                className={cls}
              />
            );
          }

          // Cross-col: ㄴ path smoothly morphs to a vertical line as t → 1
          // M x1,y1  V cornerY  H x2
          const x1      = iX(fNode.col);
          const y1      = iY(from, fNode.y) + R;
          const cornerY = lerp(tNode.y,             MOBILE_Y[to]! - R, t);
          const x2      = lerp(nodeX(tNode.col) - R, NODE_X_M,         t);
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${x1},${y1} V ${cornerY} H ${x2}`}
              fill="none"
              className={cls}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => {
          const x        = iX(node.col);
          const y        = iY(node.id, node.y);
          const isActive = hovered === node.id || selected === node.id;
          return (
            <g key={node.id} {...nodeHandlers(node.id)}>
              <circle cx={x} cy={y} r={R + 10} fill="transparent" />
              <circle cx={x} cy={y} r={R + 5}  className={`career-node-ring${isActive ? " is-visible" : ""}`} />
              <circle cx={x} cy={y} r={R}       className={`career-node-dot${isActive ? " is-active" : ""}`} />
              <text   x={x + R + 9} y={y + 4}  className={`career-node-label${isActive ? " is-active" : ""}`} style={{ fontSize: fs(13) }}>
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
