import { PAGE_ARCHIVES } from "../main";

export default function ArchiveLinks() {
  return (
    <section id="previous-versions" className="archive" data-breakable>
      <header className="archive-head">
        <span className="archive-eyebrow">Previous versions</span>
      </header>
      <div className="archive-list">
        {PAGE_ARCHIVES.map((item) => (
          <a
            key={item.years}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="archive-chip"
          >
            {item.years}
          </a>
        ))}
      </div>
    </section>
  );
}
