---
name: jinki-jung-design
description: Use this skill to generate well-branded interfaces and assets for Jinki Jung, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

- `README.md` — brand overview, content fundamentals, visual foundations, iconography. Start here.
- `colors_and_type.css` — drop-in CSS variables for the entire token system. Import this anywhere.
- `ui_kits/marketing/` — full marketing UI kit (React+Babel inline JSX). Open `index.html` to see the rendered surface; read each `*.jsx` component to copy patterns.
- `preview/` — small specimen cards demonstrating tokens and components in isolation.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick rules to internalise before designing

1. **Ink #171717 is the brand.** It's the only primary. CTAs, body text, dark band — all the same ink.
2. **One gradient, hero scale only.** The multi-stop mesh (cyan → blue → violet → magenta → coral → amber) is the only decoration. Never miniaturise it. Never crop to a single color.
3. **Two pill scales, pick one per screen.** 100px marketing pills OR 6px nav-radius. Never mix.
4. **Geist + Geist Mono.** Display weight 600 ceiling. Aggressive negative tracking (-2.4px at 48px, scaling down). Sentence case. Periods on headlines.
5. **Stacked shadows + inset hairlines.** No single-blur Material drops.
6. **No emoji.** Ever. The voice is engineered.
7. **Mono is the technical voice.** Eyebrows, code, filenames. Never body paragraphs.

## Substitution flags

- Geist / Geist Mono via Google Fonts CDN (not the proprietary cut).
- Lucide-style inline SVG icons (no proprietary icon set was supplied).
- No real brand logos supplied — kit uses wordmark placeholders.
