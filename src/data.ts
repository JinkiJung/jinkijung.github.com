export interface Profile {
  name: string;
  role: string;
  location: string;
  status: string;
}

export interface Section {
  id: string;
  label: string;
  url: string;
}

export interface Work {
  id: string;
  kind: string;
  title: string;
  summary: string;
  role: string;
  stack: string[];
  period: string;
  repo: string;
  tags: string[];
  thumbLabel: string;
}

export interface Visitor {
  name: string;
  msg: string;
  ts: string;
}

export const PROFILE: Profile = {
  name: "Jinki Jung",
  role: "Oddly Creative Builder",
  location: "Daejeon → Remote",
  status: "Available for collaboration",
};

export const SECTIONS: Section[] = [
  { id: "cv",        label: "CV",        url: "https://jinkijung.github.io/pdf/Curriculum_vitae_250707.pdf" },
  { id: "portfolio", label: "Portfolio", url: "https://jinkijung.github.io/iil-career/" },
  { id: "github",    label: "GitHub",    url: "https://github.com/jinkijung" },
  { id: "linkedin",  label: "LinkedIn",  url: "https://linkedin.com/in/jinkijung" },
];

export const WORKS: Work[] = [
  {
    id: "edge-stream",
    kind: "Project · 2025",
    title: "Edge Stream — sub-50ms token streaming for any LLM.",
    summary: "A thin gateway that fronts OpenAI, Anthropic, and self-hosted weights with a single SSE endpoint. Built for ~3M requests / day at a 99th-percentile latency of 47 ms.",
    role: "Solo · design + implementation",
    stack: ["Rust", "Cloudflare Workers", "Redis"],
    period: "Aug 2025 — present",
    repo: "github.com/jinkijung/edge-stream",
    tags: ["infra", "llm", "edge"],
    thumbLabel: "/edge-stream",
  },
  {
    id: "kintsugi",
    kind: "Project · 2025",
    title: "Kintsugi — a small editor for fragmentary writing.",
    summary: "An offline-first markdown editor that emphasises non-linear notes. Files are content-addressed; revisions are diffs by sentence, not by line.",
    role: "Solo · design + implementation",
    stack: ["Swift", "SwiftData", "Metal"],
    period: "Mar 2025 — Jul 2025",
    repo: "github.com/jinkijung/kintsugi",
    tags: ["productivity", "editor", "mac"],
    thumbLabel: "/kintsugi",
  },
  {
    id: "paper-vision",
    kind: "Paper · 2024",
    title: "Latency-Aware Routing in Distributed Vision Models.",
    summary: "Co-authored at KAIST. Routes a single inference across heterogeneous accelerators based on sustained tail latency, not throughput. 1.8× speed-up on a fixed budget.",
    role: "Second author",
    stack: ["PyTorch", "Triton", "Kubernetes"],
    period: "Published Nov 2024",
    repo: "arxiv.org/abs/2411.xxxxx",
    tags: ["paper", "systems", "vision"],
    thumbLabel: "arXiv:2411.xxxxx",
  },
  {
    id: "rooftop",
    kind: "Essay · 2024",
    title: "A note on building for one user.",
    summary: "On the disproportionate weight of solo software. Five thousand words on writing tools you'll be the only person to ever use, and why that's the most generous form of design.",
    role: "Writing",
    stack: ["Long-form", "~5,200 words"],
    period: "Posted Sep 2024",
    repo: "jinki.dev/notes/one-user",
    tags: ["essay", "tools"],
    thumbLabel: "essay · one-user",
  },
  {
    id: "compose",
    kind: "Project · 2023",
    title: "Compose — a CRDT-based collaborative outliner.",
    summary: "An outliner with real-time multiplayer, offline edits, and a 2 KB initial JS bundle. Used internally at two universities and one design studio.",
    role: "Co-founder · technical lead",
    stack: ["TypeScript", "Yjs", "SvelteKit"],
    period: "2023 — 2024",
    repo: "github.com/jinkijung/compose",
    tags: ["collab", "crdt", "web"],
    thumbLabel: "/compose",
  },
  {
    id: "talk-ssg",
    kind: "Talk · 2023",
    title: "Static is a feeling, not a build step.",
    summary: "A 25-minute talk given at JSConf Korea on the slow flattening of \"static\" and \"dynamic\" rendering — and what we lose when we let the framework decide.",
    role: "Speaker",
    stack: ["25 min", "JSConf KR"],
    period: "Oct 2023",
    repo: "youtube.com/watch?v=jjsk-ssg",
    tags: ["talk", "web"],
    thumbLabel: "talk · jsconf kr",
  },
];

export const VISITORS: Visitor[] = [
  { name: "Hyemin",    msg: "Just here from your JSConf talk. The CRDT slide was the one.", ts: "12 min ago" },
  { name: "anonymous", msg: "Edge Stream is exactly what I've been trying to build. Thank you for open-sourcing it.", ts: "1 hr ago" },
  { name: "Prof. Lee", msg: "Saw the routing paper accepted at OSDI — congratulations.", ts: "3 hr ago" },
  { name: "thylacine", msg: "The Kintsugi diff-by-sentence model is genuinely novel. Wrote a thread.", ts: "Yesterday" },
  { name: "Sara K.",   msg: "Are you taking on freelance / consulting? Sent an email.", ts: "2 days ago" },
  { name: "anonymous", msg: "Your essay made me delete 80% of the code I had written this week. ✓", ts: "4 days ago" },
];
