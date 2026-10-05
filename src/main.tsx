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
    body: "From real-time mobile AR tracking to VR training with Tasc. My research spans augmented reality, reusable training scenarios, and simulations that explore how to keep AR users safe.",
  },
  {
    label: "Writing",
    title: "Notes & Essays",
    body: "Now based in Korea, I’m also an author who turned six years of life in Denmark into a collection of essays. I write a Korean-language blog, too. Explore my latest writing in",
    link: { label: "Recent posts", href: "#recent-posts" },
  },
  {
    label: "Off duty",
    title: "Away from the Keyboard",
    body: "In my spare time, you’ll find me paddling a canoe or setting up a chair somewhere scenic, happy to take things slow. I’m a middle-aged guy who loves birdwatching, old games, books, travel, cooking, and a good dad joke — or a terrible one.",
  },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
