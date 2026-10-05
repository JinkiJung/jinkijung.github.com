import { useState, useEffect } from "react";
import type { Work } from "../data";

const RSS_URL = "https://jinkijung.tistory.com/rss";

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
}

function formatDate(pubDate: string): string {
  const d = new Date(pubDate);
  return isNaN(d.getTime())
    ? pubDate
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function parseItems(text: string, count: number): Work[] {
  const xml = new DOMParser().parseFromString(text, "text/xml");
  return Array.from(xml.querySelectorAll("item"))
    .slice(0, count)
    .map((item, i) => {
      const get = (tag: string) =>
        item.querySelector(tag)?.textContent?.trim() ?? "";

      const title    = get("title") || `Post ${i + 1}`;
      const link     = get("link") || get("guid");
      const pubDate  = get("pubDate");
      const rawDesc  = get("description");
      const cats     = Array.from(item.querySelectorAll("category"))
        .map((c) => c.textContent?.trim() ?? "")
        .filter(Boolean);

      const plain   = stripHtml(rawDesc).trim();
      const summary = plain.length > 200 ? plain.slice(0, 200) + "…" : plain;
      const period  = formatDate(pubDate);
      const year    = new Date(pubDate).getFullYear();
      const slug    = link.split("/").filter(Boolean).pop() ?? String(i);
      const repo    = link.replace(/^https?:\/\//, "");

      return {
        id:         slug,
        kind:       `Post · ${isNaN(year) ? "" : year}`,
        title,
        summary,
        role:       "Writing",
        stack:      cats.length ? cats.slice(0, 3) : ["Blog"],
        period,
        repo,
        tags:       cats,
        thumbLabel: `/${slug}`,
      } satisfies Work;
    });
}

interface UseBlogPostsResult {
  posts: Work[];
  loading: boolean;
  error: string | null;
}

export function useBlogPosts(count = 5): UseBlogPostsResult {
  const [posts,   setPosts]   = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(RSS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setPosts(parseItems(text, count));
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [count]);

  return { posts, loading, error };
}
