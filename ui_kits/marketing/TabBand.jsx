// TabBand.jsx — centered tab pill row with content-switching demo
const TabBand = () => {
  const tabs = [
    { id: 'ai', label: 'AI Apps', headline: 'Stream tokens from any model.', body: 'A unified gateway to OpenAI, Anthropic, Mistral, and your own weights.' },
    { id: 'web', label: 'Web Apps', headline: 'Production-ready frontends.', body: 'Next, Remix, SvelteKit, Nuxt — zero-config deployments, automatic CDN, edge functions.' },
    { id: 'ecom', label: 'Ecommerce', headline: 'Composable commerce.', body: 'Headless storefronts at sub-second TTFB. Built for Shopify, BigCommerce, Saleor.' },
    { id: 'mkt',  label: 'Marketing', headline: 'Sites that ship in hours.', body: 'A/B test landings, preview every campaign, measure conversion on the edge.' },
    { id: 'plat', label: 'Platforms', headline: 'Multi-tenant by default.', body: 'Spin up isolated environments per customer. Subdomains, SSL, billing, all included.' },
  ];
  const [active, setActive] = React.useState('ai');
  const cur = tabs.find(t => t.id === active);

  return (
    <section className="feature-band section-pad-tight" id="solutions" style={{borderTop: '1px solid #ebebeb', background: '#fff'}}>
      <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 32}}>
        <span className="eyebrow">What you can build</span>
        <div className="tab-row">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-pill ${t.id === active ? 'tab-pill-active' : ''}`}
              onClick={() => setActive(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <div style={{textAlign: 'center', maxWidth: 720, display:'flex', flexDirection:'column', gap: 14}}>
          <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 36, lineHeight: '44px', letterSpacing: '-1.44px', color: '#171717', margin: 0, textWrap: 'balance'}}>{cur.headline}</h2>
          <p style={{fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: '26px', color: '#4d4d4d', margin: 0}}>{cur.body}</p>
        </div>
      </div>
    </section>
  );
};

window.TabBand = TabBand;
