import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";

export const PAGE_ARCHIVES = [
  { years: "2025 – 2026", url: "https://jinkijung.github.io/v2025/" },
  { years: "2022 – 2024", url: "https://jinkijung.github.io/v2022/" },
  { years: "2018 – 2021", url: "https://jinkijung.github.io/v2018/" },
  { years: "2013 – 2017", url: "https://jinkijung.github.io/v2013/" },
  { years: "2008 – 2012", url: "https://jinkijung.github.io/v2008/" },
  { years: "2003 – 2007", url: "https://jinkijung.github.io/v2003/" },
];

export const PAGE_SLIDES = [
  {
    label: "Intro",
    title: "Oddly Creative Builder",
    body: "Designing and building tools at the intersection of language, systems, and interaction — mostly solo, always from scratch.",
  },
  {
    label: "Work",
    title: "Projects & Research",
    body: "From sub-50ms LLM gateways to CRDT-based outliners. Each project is a question asked in code, usually answered in a different language than it started.",
  },
  {
    label: "Writing",
    title: "Notes & Essays",
    body: "Long-form thinking on software design, tools for thought, and the odd experience of building for an audience of one.",
  },
  {
    label: "Connect",
    title: "Open to Collaboration",
    body: "Available for research partnerships, consulting, and the occasional side project that's too weird to have a job description yet.",
  },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
