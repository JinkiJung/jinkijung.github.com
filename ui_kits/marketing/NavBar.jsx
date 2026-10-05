// NavBar.jsx — sticky top nav with logo, links, CTAs
const NavBar = () => {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo">
          <span className="nav-logo-mark">jj</span>
          <span>Jinki Jung</span>
        </a>
        <nav className="nav-links">
          <a className="nav-link" href="#products">Products</a>
          <a className="nav-link" href="#solutions">Solutions</a>
          <a className="nav-link" href="#pricing">Pricing</a>
          <a className="nav-link" href="#docs">Docs</a>
          <a className="nav-link" href="#blog">Blog</a>
          <a className="nav-link" href="#enterprise">Enterprise</a>
        </nav>
        <div className="nav-spacer"></div>
        <div className="nav-ctas">
          <button className="btn-nav btn-nav-ghost">
            <span style={{fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888'}}>⌘K</span>
            <span>Ask AI</span>
          </button>
          <button className="btn-nav btn-nav-link">Log In</button>
          <button className="btn-nav btn-nav-primary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

window.NavBar = NavBar;
