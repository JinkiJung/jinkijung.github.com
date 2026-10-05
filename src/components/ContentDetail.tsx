import type { Work } from "../data";

interface Props {
  work: Work | undefined;
}

export default function ContentDetail({ work }: Props) {
  if (!work) return null;
  return (
    <section className="detail" key={work.id}>
      <div className="detail-main">
        <div className="detail-eyebrow">
          <span className="badge">{work.kind.split(" · ")[0]}</span>
          <span>{work.kind.split(" · ")[1]}</span>
        </div>
        <h2 className="detail-title">{work.title}</h2>
        <p className="detail-body">{work.summary}</p>
        <dl className="detail-meta">
          <dt>Role</dt>   <dd>{work.role}</dd>
          <dt>Stack</dt>  <dd>{work.stack.join(" · ")}</dd>
          <dt>Period</dt> <dd>{work.period}</dd>
          <dt>Link</dt>   <dd><a href={`https://${work.repo}`} target="_blank" rel="noreferrer">{work.repo} →</a></dd>
        </dl>
      </div>
      <aside className="detail-aside">
        <h4>Tags</h4>
        <div className="tags">
          {work.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
        <h4 style={{ marginTop: 8 }}>Notes</h4>
        <ul>
          <li><span className="k">→</span> Use ←/→ keys to navigate works.</li>
          <li><span className="k">→</span> Click a card to update this panel.</li>
          <li><span className="k">→</span> Drag the row to pan.</li>
        </ul>
      </aside>
    </section>
  );
}
