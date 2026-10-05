/**
 * Fetches the Tistory RSS feed and writes public/posts.json.
 * Run manually: node scripts/fetch-rss.mjs
 * Run in CI:    triggered by .github/workflows/fetch-rss.yml
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RSS_URL   = "https://jinkijung.tistory.com/rss";
const COUNT     = 5;
const OUT_PATH  = join(__dirname, "..", "public", "posts.json");

// ── XML helpers ────────────────────────────────────────────────────────────

function unwrapCdata(str) {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function tagContent(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m  = block.match(re);
  return m ? unwrapCdata(m[1]).trim() : "";
}

function allTagContents(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...block.matchAll(re)].map(m => unwrapCdata(m[1]).trim()).filter(Boolean);
}

function decodeEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", hellip: "…", ndash: "–", mdash: "—", middot: "·" };
  // Tistory may XML-escape HTML that already contains escaped entities.
  for (let i = 0; i < 4; i++) {
    const next = text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] !== "#") return named[entity.toLowerCase()] ?? match;
      const hex = entity[1].toLowerCase() === "x";
      const code = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    });
    if (next === text) break;
    text = next;
  }
  return text;
}

function stripHtml(html) {
  return decodeEntities(html)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(pubDate) {
  const d = new Date(pubDate);
  return isNaN(d.getTime())
    ? pubDate
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching ${RSS_URL} …`);
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const text  = await res.text();
  const posts = [];

  for (const m of text.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    if (posts.length >= COUNT) break;
    const item = m[1];

    const title      = decodeEntities(tagContent(item, "title"));
    const link       = tagContent(item, "link") || tagContent(item, "guid");
    const rawDesc    = tagContent(item, "description");
    const pubDate    = tagContent(item, "pubDate");
    const categories = allTagContents(item, "category").map(decodeEntities);

    const plain   = stripHtml(rawDesc);
    const summary = plain.length > 200 ? plain.slice(0, 200) + "…" : plain;
    const period  = formatDate(pubDate);
    const year    = new Date(pubDate).getFullYear();
    const slug    = link.split("/").filter(Boolean).pop() ?? String(posts.length);
    const repo    = link.replace(/^https?:\/\//, "");

    posts.push({
      id:         slug,
      kind:       `Post · ${isNaN(year) ? "" : year}`,
      title:      title || `Post ${posts.length + 1}`,
      summary,
      role:       "Writing",
      stack:      categories.length ? categories.slice(0, 3) : ["Blog"],
      period,
      repo,
      tags:       categories,
      thumbLabel: `/${slug}`,
    });
  }

  if (!posts.length) throw new Error("RSS feed contains no posts; keeping existing posts.json");
  writeFileSync(OUT_PATH, JSON.stringify(posts, null, 2), "utf-8");
  console.log(`✓ Wrote ${posts.length} posts → ${OUT_PATH}`);
}

main().catch(err => {
  console.error("✗", err.message);
  process.exit(1);
});
