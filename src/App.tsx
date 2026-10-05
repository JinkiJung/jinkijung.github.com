import { useState } from "react";
import Header from "./components/Header";
import VisitorLog from "./components/VisitorLog";
import WireframeSwiper, { TOTAL } from "./components/WireframeSwiper";
import CareerTimeline from "./components/CareerTimeline";
import BlogPosts from "./components/BlogPosts";
import ArchiveLinks from "./components/ArchiveLinks";
import EndToEndSection from "./components/endtoend/EndToEndSection";
import { PAGE_SLIDES } from "./main";
import LeaderboardFooter from "./components/LeaderboardFooter";

const FADE_MS = 220;

function WireframeLayout() {
  const [current, setCurrent] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleGoTo = (i: number) => {
    setCurrent(i);
    if (i === slideIndex) return;
    setVisible(false);
    setTimeout(() => {
      setSlideIndex(i);
      setVisible(true);
    }, FADE_MS);
  };

  const slide = PAGE_SLIDES[slideIndex];

  return (
    <div className="viewport-section hero-section">
      <div className="shell">
        <div className="wf-header" data-breakable>
          <Header />
        </div>
        <WireframeSwiper current={current} onGoTo={handleGoTo} />
        <div className="wf-detail" data-breakable>
          <div className={`wf-detail-content${visible ? "" : " is-fading"}`}>
            <span className="wf-detail-label">{slide.label}</span>
            <h2 className="wf-detail-title">{slide.title}</h2>
            <p className="wf-detail-body">{slide.body}{slide.link && <> <a href={slide.link.href}>{slide.link.label}</a> below.</>}</p>
          </div>
        </div>
        <div className="wf-indicators" data-breakable>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              className={`wf-indicator ${i === current ? "is-active" : ""}`}
              onClick={() => handleGoTo(i)}
              aria-label={`Go to page ${i}`}
            />
          ))}
        </div>
        <LeaderboardFooter kind="weekly" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <div id="game-page">
        <WireframeLayout />
        <EndToEndSection />
        <div className="below-fold">
          <div className="shell">
            <CareerTimeline />
            <ArchiveLinks />
            <BlogPosts />
            <VisitorLog />
            <LeaderboardFooter kind="completion" />
          </div>
        </div>
      </div>
    </>
  );
}
