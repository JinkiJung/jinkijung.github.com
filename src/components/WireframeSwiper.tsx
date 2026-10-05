export const TOTAL = 4;

interface Props {
  current: number;
  onGoTo: (i: number) => void;
}

export default function WireframeSwiper({ current, onGoTo }: Props) {
  const prev = () => onGoTo(Math.max(0, current - 1));
  const next = () => onGoTo(Math.min(TOTAL - 1, current + 1));

  return (
    <div className="wf-swiper-root" data-breakable>
      {/* Background layer */}
      <div className="wf-bg-layer">
        <img src="/images/background.png" alt="" className="wf-overlay-img" />
      </div>

      {/* Overlay layer */}
      <div className="wf-overlay-layer">
        <div
          className="wf-overlay-track"
          style={{ transform: `translateX(${-current * 100}%)` }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="wf-overlay-page">
              <img src={`/images/${i}.png`} alt={`page ${i}`} className="wf-overlay-img" />
            </div>
          ))}
        </div>
      </div>

      {/* Left arrow */}
      {current > 0 && (
        <button className="wf-arrow wf-arrow-left" onClick={prev} aria-label="Previous">
          ←
        </button>
      )}

      {/* Right arrow */}
      {current < TOTAL - 1 && (
        <button className="wf-arrow wf-arrow-right" onClick={next} aria-label="Next">
          →
        </button>
      )}
    </div>
  );
}
