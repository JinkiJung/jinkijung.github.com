// PricingBand.jsx — 3-up pricing grid with middle tier polarity-flipped
const Tick = ({ light }) => (
  <span className="tick" style={light ? {color: '#171717'} : null}>✓</span>
);

const PricingBand = () => {
  return (
    <section className="pricing-band section-pad" id="pricing">
      <div className="container">
        <div className="feature-head" style={{marginBottom: 24}}>
          <span className="eyebrow">Pricing</span>
          <h2>Active CPU pricing.</h2>
          <p>Pay for compute that runs. Don't pay for compute that idles.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-tier">Hobby</h3>
            <p className="pricing-tier-desc">For personal projects. Free forever.</p>
            <div className="pricing-price">$0 <small>/ month</small></div>
            <ul className="pricing-features">
              <li><Tick/> 100GB bandwidth</li>
              <li><Tick/> Preview deployments</li>
              <li><Tick/> Community support</li>
              <li><Tick/> 1 user</li>
            </ul>
            <a className="pricing-btn pricing-btn-light">Get started</a>
          </div>
          <div className="pricing-card featured">
            <h3 className="pricing-tier">Pro</h3>
            <p className="pricing-tier-desc">For growing teams shipping every day.</p>
            <div className="pricing-price">$20 <small>/ user / month</small></div>
            <ul className="pricing-features">
              <li><Tick/> 1TB bandwidth included</li>
              <li><Tick/> Edge functions, unlimited</li>
              <li><Tick/> Branch previews + comments</li>
              <li><Tick/> Email support</li>
              <li><Tick/> Up to 10 users</li>
            </ul>
            <a className="pricing-btn pricing-btn-on-dark">Start Pro <span style={{fontFamily: 'var(--font-mono)', marginLeft: 6}}>→</span></a>
          </div>
          <div className="pricing-card">
            <h3 className="pricing-tier">Enterprise</h3>
            <p className="pricing-tier-desc">For organisations with custom needs.</p>
            <div className="pricing-price">Talk.</div>
            <ul className="pricing-features">
              <li><Tick light/> Custom commits</li>
              <li><Tick light/> SAML SSO + SCIM</li>
              <li><Tick light/> Dedicated support</li>
              <li><Tick light/> 99.99% SLA</li>
              <li><Tick light/> Unlimited users</li>
            </ul>
            <a className="pricing-btn pricing-btn-light">Contact sales</a>
          </div>
        </div>
      </div>
    </section>
  );
};

window.PricingBand = PricingBand;
