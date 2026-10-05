// LogoStrip.jsx — single-row monochrome customer wordmarks
const LogoStrip = () => {
  const logos = ['Notion', 'Linear', 'Stripe', 'Vercel', 'Figma', 'Anthropic', 'Supabase'];
  return (
    <section className="logo-strip">
      <div className="container">
        <div className="logo-strip-label">
          <span className="eyebrow">Trusted by the teams shipping the modern web</span>
        </div>
        <div className="logo-strip-row">
          {logos.map(name => (
            <div key={name} className="logo-mark">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
};

window.LogoStrip = LogoStrip;
