import { useState, useEffect } from "react";
import type { Work } from "../data";

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").replace(/\s+/g, " ").trim();
}

export default function BlogPosts() {
  const [posts, setPosts] = useState<Work[] | null>(null);

  useEffect(() => {
    fetch("/posts.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Work[] | null) => { if (data) setPosts(data); })
      .catch(() => {});
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="blog-posts" data-breakable>
      <header className="blog-posts-head">
        <span className="blog-posts-eyebrow">Recent Posts</span>
      </header>
      <ul className="blog-posts-list">
        {posts.map((post) => {
          const summary = stripHtml(post.summary);
          const excerpt = summary.length > 80 ? summary.slice(0, 80) + "…" : summary;
          return (
            <li key={post.id} className="blog-posts-row">
              <a
                href={`https://${post.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-posts-link"
              >
                <span className="blog-posts-title">{post.title}</span>
                {excerpt && <span className="blog-posts-excerpt">{excerpt}</span>}
              </a>
              <div className="blog-posts-meta">
                <span className="blog-posts-period">{post.period}</span>
                {post.tags[0] && (
                  <span className="blog-posts-tag">{post.tags[0]}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
