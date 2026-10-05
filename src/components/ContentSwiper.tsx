import { useState, useRef, useEffect, useCallback } from "react";
import type { Work } from "../data";

interface Props {
  works: Work[];
  activeId: string;
  onSelect: (id: string) => void;
  label?: string;
}

const STEP = 336;

export default function ContentSwiper({ works, activeId, onSelect, label = "Selected works" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);

  const recompute = useCallback(() => {
    if (!trackRef.current || !viewportRef.current) return;
    const trackW = trackRef.current.scrollWidth;
    const viewW = viewportRef.current.clientWidth;
    setMaxOffset(Math.max(0, trackW - viewW));
  }, []);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  const clamp = (n: number) => Math.max(0, Math.min(maxOffset, n));
  const prev = () => setOffset((o) => clamp(o - STEP));
  const next = () => setOffset((o) => clamp(o + STEP));

  const dragRef = useRef({ x: 0, start: 0, dragging: false });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: e.clientX, start: offset, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.x;
    setOffset(clamp(dragRef.current.start - dx));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pages = Math.max(1, Math.ceil((maxOffset + 1) / STEP) + 1);
  const curPage = Math.round(offset / STEP);

  return (
    <section className="swiper" id="works">
      <div className="swiper-head">
        <span className="swiper-eyebrow">{label} · {works.length}</span>
        <div className="swiper-controls">
          <button className="swiper-btn" onClick={prev} disabled={offset <= 0} aria-label="Previous">←</button>
          <button className="swiper-btn" onClick={next} disabled={offset >= maxOffset} aria-label="Next">→</button>
        </div>
      </div>

      <div
        className="swiper-viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: dragRef.current.dragging ? "grabbing" : "grab", userSelect: "none" }}
      >
        <div
          ref={trackRef}
          className="swiper-track"
          style={{ transform: `translateX(${-offset}px)` }}
        >
          {works.map((w) => (
            <article
              key={w.id}
              className={`swipe-card ${w.id === activeId ? "is-active" : ""}`}
              onClick={() => onSelect(w.id)}
            >
              <div className="swipe-card-thumb">
                <div className="swipe-card-thumb-grid"></div>
                <div className="swipe-card-thumb-mono">{w.thumbLabel}</div>
              </div>
              <div className="swipe-card-body">
                <div className="swipe-card-kicker">{w.kind}</div>
                <div className="swipe-card-title">{w.title}</div>
                <div className="swipe-card-meta">
                  <span>{w.stack[0]}</span>
                  <span>·</span>
                  <span>{w.period.split(" — ")[0]}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="swiper-dots">
        {Array.from({ length: pages }).map((_, i) => (
          <span key={i} className={`swiper-dot ${i === curPage ? "is-active" : ""}`}></span>
        ))}
      </div>
    </section>
  );
}
