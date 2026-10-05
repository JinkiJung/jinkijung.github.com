import LeaderboardFooter from "../LeaderboardFooter";
import Voyage from "./Voyage";

export default function EndToEndSection() {
  return (
    <section className="viewport-section e2e-section" id="end-to-end">
      <div className="shell">
        <div className="e2e-bar" data-breakable>
          <span className="header-mark">e2e</span>
          <span className="header-name">End to end</span>
          <span className="header-meta">· Maritime digitalization</span>
        </div>

        <div className="e2e-main" data-breakable>
          <Voyage />
        </div>

        <LeaderboardFooter kind="monthly" />
      </div>
    </section>
  );
}
