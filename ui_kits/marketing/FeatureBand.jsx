// FeatureBand.jsx — eyebrow + headline + 3-up feature card grid
const FeatureIcon = ({ children }) => (
  <span className="feature-card-icon" aria-hidden="true">{children}</span>
);

// Lucide-style minimal stroke icons (1.5px)
const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z"/></svg>
);
const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>
);
const IconLayers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></svg>
);

const FeatureBand = () => {
  return (
    <section className="feature-band section-pad" id="products">
      <div className="container">
        <div className="feature-head">
          <span className="eyebrow">Platform</span>
          <h2>Your frontend, delivered.</h2>
          <p>The fastest way to take an idea to production. Preview every branch, scale to zero, run code at the edge.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <FeatureIcon><IconGlobe/></FeatureIcon>
            <h3>Edge Functions</h3>
            <p>Run code closer to your users. Sub-50ms cold starts. Sub-15ms warm. Deployed to 30+ regions.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon><IconBolt/></FeatureIcon>
            <h3>Instant Previews</h3>
            <p>Every commit gets a URL. Share it with stakeholders. Comment on it. Promote it to prod.</p>
          </div>
          <div className="feature-card">
            <FeatureIcon><IconLayers/></FeatureIcon>
            <h3>Active CPU</h3>
            <p>Pay for compute when your code runs, not when it idles. Scale to zero by default.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

window.FeatureBand = FeatureBand;
