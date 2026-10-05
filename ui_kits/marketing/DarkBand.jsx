// DarkBand.jsx — polarity-flipped section with code mockup
const DarkBand = () => {
  return (
    <section className="dark-band section-pad" id="docs">
      <div className="container dark-band-grid">
        <div>
          <div className="eyebrow dark-eyebrow" style={{marginBottom: 18}}>Compute</div>
          <h2>A compute model for all workloads.</h2>
          <p>One platform for static, dynamic, streaming, and long-running compute. Pay for what you use; scale to zero when you don't.</p>
          <div style={{display: 'flex', gap: 12}}>
            <button className="btn-pill" style={{background: '#fff', color: '#171717'}}>Read the docs <span style={{fontFamily: 'var(--font-mono)'}}>→</span></button>
            <button className="btn-pill" style={{background: 'transparent', color: '#fff', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)'}}>View pricing</button>
          </div>
        </div>
        <div className="code-card">
          <div className="code-head">
            <div className="code-dot"></div>
            <div className="code-dot"></div>
            <div className="code-dot"></div>
            <div className="code-title">~/jinki-app · zsh</div>
          </div>
          <div className="code-body">
            <div><span className="code-dim">$</span> jj deploy --prod</div>
            <div className="code-dim">→ uploading 132 files…</div>
            <div className="code-dim">→ building edge bundle…</div>
            <div className="code-dim">→ provisioning regions: iad, fra, sin…</div>
            <div><span className="code-string">✓</span> deployed to <span className="code-link">jinki.dev</span> in 4.2s</div>
            <div style={{height: 8}}></div>
            <div className="code-comment">// inspect production stream</div>
            <div><span className="code-dim">$</span> jj logs --follow</div>
            <div><span className="code-warn">[warn]</span> <span className="code-dim">cold start 47ms (iad1)</span></div>
            <div><span className="code-string">[200]</span> <span className="code-dim">GET / 12ms</span></div>
            <div><span className="code-string">[200]</span> <span className="code-dim">GET /api/stream 8ms</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

window.DarkBand = DarkBand;
