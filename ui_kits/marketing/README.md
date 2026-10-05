# Marketing UI Kit — Jinki Jung

The marketing-surface UI kit: a click-thru recreation of the brand's home-page rhythm.

## Components

- `NavBar.jsx` — sticky 64-px nav with logo, link row, and Ask AI / Log In / Sign Up cluster.
- `HeroBand.jsx` — mesh-gradient hero with announcement pill, 72-px display headline, lede, primary + secondary CTAs.
- `LogoStrip.jsx` — single-row monochrome customer wordmarks.
- `FeatureBand.jsx` — 3-up feature grid with Lucide-style stroke icons.
- `TabBand.jsx` — interactive tab-pill row that swaps headline + body underneath. Click a pill.
- `DarkBand.jsx` — polarity-flipped compute section with terminal mockup.
- `PricingBand.jsx` — 3-up pricing grid with middle-tier polarity flip.
- `Footer.jsx` — 4-column footer with mono eyebrow labels.
- `App.jsx` — composes them all.

## Run

Open `index.html`. The Tab row is the only interactive demo — the rest are visual.

## Faithful to

The kit replicates the canonical design spec passed in by the user. No Figma or codebase was supplied; the visual targets are the description in the root `README.md` and the per-component tokens in `colors_and_type.css`.

## Substitutions flagged

- Geist + Geist Mono loaded from Google Fonts CDN.
- Lucide-equivalent inline SVG icons (1.5px stroke).
- Placeholder wordmark "logos" — no real brand logos supplied.
