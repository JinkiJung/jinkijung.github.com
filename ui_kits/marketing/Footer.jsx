// Footer.jsx — 4-column footer with mono eyebrow labels
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="nav-logo" style={{marginBottom: 14}}>
            <span className="nav-logo-mark">jj</span>
            <span>Jinki Jung</span>
          </div>
          <p style={{fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '22px', color: '#4d4d4d', margin: 0, maxWidth: 280}}>
            Build and deploy on the AI Cloud. Calm, technical, opinionated.
          </p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#">Edge Functions</a></li>
            <li><a href="#">Previews</a></li>
            <li><a href="#">AI Gateway</a></li>
            <li><a href="#">Analytics</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Docs</a></li>
            <li><a href="#">Templates</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Security</a></li>
            <li><a href="#">DPA</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Jinki Jung. All rights reserved.</span>
        <span style={{fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em'}}>v2.4.1 · iad1</span>
      </div>
    </footer>
  );
};

window.Footer = Footer;
