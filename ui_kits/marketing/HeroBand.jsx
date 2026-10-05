// HeroBand.jsx — the mesh-gradient hero with announcement pill, headline, CTAs
const HeroBand = () => {
  return (
    <section className="hero">
      <div className="hero-mesh"></div>
      <div className="hero-fade"></div>
      <div className="container section-pad-hero hero-inner">
        <a href="#" className="banner-pill">
          <span className="banner-pill-tag">New</span>
          <span>Introducing AI SDK 5.0</span>
          <span className="banner-pill-sep">·</span>
          <span className="banner-pill-arrow">→</span>
        </a>
        <h1 className="hero-h1">
          Build and deploy <span className="hero-h1-em">on the AI Cloud</span>.
        </h1>
        <p className="hero-lede">
          Jinki Jung is the platform for engineers — preview every commit, ship to the edge, scale to zero. No config required.
        </p>
        <div className="hero-ctas">
          <button className="btn-pill btn-pill-primary">
            Start Deploying
            <span style={{fontFamily: 'var(--font-mono)'}}>→</span>
          </button>
          <button className="btn-pill btn-pill-secondary">Get a Demo</button>
        </div>
      </div>
    </section>
  );
};

window.HeroBand = HeroBand;
