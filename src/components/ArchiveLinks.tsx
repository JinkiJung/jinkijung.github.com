import { PAGE_ARCHIVES } from "../main";

export default function ArchiveLinks() {
  return (
    <section className="archive" data-breakable>
      <header className="archive-head">
        <span className="archive-eyebrow">Previous versions</span>
      </header>
      <div className="archive-list">
        {PAGE_ARCHIVES.map((item) => (
          <span
            key={item.years}
            aria-disabled="true"
            title="Coming soon"
            className="archive-chip"
          >
            {item.years}
          </span>
        ))}
      </div>
    </section>
  );
}
