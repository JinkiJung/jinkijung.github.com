# Jinki Jung — Design System

A personal-brand design system written in the posture of a deployment dashboard's marketing surface — engineered, calm, monospaced where it matters, sentence-cased everywhere else. The system is a study in restraint: near-white surfaces, ink-near-black text, a single multi-stop mesh gradient that does all the decorative work.

## Source

The system was built from a single canonical design spec provided by the user — there is no Figma, codebase, or app source attached. The spec describes the surface that Jinki Jung publishes as a personal brand page in the visual idiom of a developer-platform marketing site.

If you have access to the original brand artifacts (Figma library, deployed site, custom Geist font files), drop them into the project and re-run this skill to upgrade fidelity.

## Index

- `README.md` — this file. Brand overview, content fundamentals, visual foundations, iconography.
- `colors_and_type.css` — CSS variables for the entire token system. Import this anywhere.
- `preview/` — small specimen cards that populate the Design System tab. One concept per card.
- `ui_kits/marketing/` — the marketing-surface UI kit: nav, hero, logo strip, feature grid, tabs, dark band, pricing, footer. React + Babel inline JSX. Open `ui_kits/marketing/index.html`.
- `SKILL.md` — agent-skill manifest so this folder can be downloaded and reused in Claude Code.

> **Fonts.** Geist and Geist Mono are loaded from the Google Fonts CDN inside `colors_and_type.css` — no local `fonts/` directory is needed. If the brand owner ships proprietary TTFs, drop them in `fonts/` and update the `@import`.

## What the brand is

Jinki Jung is a personal brand presented as if it were a deployment platform's home page. The audience is engineers who already know the syntax — the page never explains itself, it just shows you the syntax. The voice is calm, technical, and slightly editorial. The decoration is one thing only: a multi-stop mesh gradient (cyan → blue → violet → magenta → coral → amber) that floats behind hero copy and never appears at icon scale.

## What's in scope

- Marketing surface (hero, feature bands, pricing, footer).
- A complete token system: colors, type scale, spacing, radius, elevation.
- Component primitives: buttons (two scales), cards (four kinds), inputs, nav, badges, code blocks.

## What's NOT in scope (yet)

- In-app product surfaces — only the marketing surface is documented.
- The proprietary Geist font files. We load Geist + Geist Mono via Google Fonts; this is a near-perfect match but not bit-exact.

---

## Content fundamentals

### Voice

The brand writes the way a senior engineer talks: declarative, present-tense, no metaphors. It does not promise; it states. Sentences are short. Periods are mandatory at the end of display headlines — the period is part of the brand's voice and never gets dropped.

- **Person.** Second person ("you") for everything user-facing. Never "we" outside of the about section. No "I."
- **Tense.** Present. "Build and deploy on the AI Cloud." not "Built for builders."
- **Case.** Sentence case everywhere narrative. ALL CAPS is forbidden in headlines and body. Mono labels (eyebrows like `WHAT'S NEW`) may render in mono-caps style but the geometric sans never does.
- **Punctuation.** Display headlines terminate with a period. Eyebrows do not. Body copy uses Oxford commas. Em dashes are welcome — they signal a thinking voice.
- **Emoji.** None. The brand uses no emoji anywhere — not in copy, not in lists, not in error messages. The voice is engineered, not friendly-startup.

### Diction examples

- **Hero scale:** "Build and deploy on the AI Cloud."
- **Section headline:** "Your frontend, delivered."
- **Section headline:** "A compute model for all workloads."
- **Section headline:** "Deploy your first app in seconds."
- **Eyebrow (mono):** `WHAT'S NEW` · `AI SDK 5.0` · `BUILD LOG`
- **CTA:** "Start Deploying" · "Get a Demo" · "Sign Up" · "Log In" · "Ask AI"
- **Badge:** "New" · "Beta" · "Live"

### Anti-patterns

- ❌ "Welcome to Jinki Jung — let's get you started!" (friendly-startup tone, exclamation, em-spaced)
- ❌ "OUR PLATFORM POWERS THE BEST TEAMS" (all caps narrative)
- ❌ "We're excited to announce..." (we-voice, marketing-blog cadence)
- ❌ "🚀 Ship faster" (emoji)
- ✅ "Build and deploy on the AI Cloud."
- ✅ "Your frontend, delivered."

---

## Visual foundations

### Color

The system runs on **ink + gray + one gradient**. Five facts to remember:

1. **`#171717` is the brand.** It is the text color, the primary CTA fill, and the polarity-flipped dark band. Reserve it.
2. **`#fafafa` is the page.** 98% white. Every section sits on this tone unless it's deliberately flipped.
3. **One gradient, three pairs, never miniaturised.** The mesh combines develop (blue→teal), preview (violet→pink), ship (coral→amber). It lives at hero scale only. Never crop it to a single color. Never use it on a 24px icon.
4. **A full 100–1000 gray + blue + red + amber + green + teal + purple + pink scale exists in tokens**, but marketing only uses the `100`, `700`, `1000` steps. The rest are reserved for in-product surfaces.
5. **No sixth accent.** New marketing colors flatten the voice. If you need to highlight, use the gradient or use ink.

### Type

Two faces:

- **Geist** (geometric sans) for everything narrative. Weights 400 / 500 / 600 only — the brand never uses 700+.
- **Geist Mono** for terminal mockups, code, and small mono-caption eyebrows.

Negative tracking is part of the voice — `-2.4px` at 48px hero, scaling proportionally smaller as the size drops. Body sits at neutral or slightly-negative tracking. Default tracking on display sizes breaks the brand.

> **Substitution note.** The proprietary Geist font files were not supplied. We load Geist and Geist Mono from the Google Fonts CDN — this is a near-perfect match. If the brand owner ships a custom-cut variant, drop the files into `fonts/` and update `colors_and_type.css`.
>
> **Uploaded font flag.** A `Piscolabis-Regular.otf` was uploaded to `fonts/`. Piscolabis is a hand-drawn / script display face — it does **not** match the Geist (geometric sans) system spec. It's wired as `--font-display-alt` for optional decorative use, not as the primary display family. Confirm intent with the brand owner.

### Spacing

4px base unit. Every value in the system is a multiple of 4. Marketing bands use `4xl`–`5xl` (64–96px) top/bottom; hero bands stretch to `section` (192px) so the mesh gradient has room to breathe. Card interior padding is `lg` (24px) for marketing cards, `md` (16px) for denser template cards. The page reads as engineered through **generous outer gaps + tight interior** — never the other way around.

### Backgrounds

- **Default page:** flat `#fafafa`.
- **Hero & feature bands:** the multi-stop mesh gradient as an atmospheric backdrop, rendered as inline SVG or canvas-painted radial-mix. Never tiled, never cropped.
- **Dark band:** flat `#171717` (polarity flip).
- **Cards:** flat white with hairline inset + soft drop. No textures, no patterns, no noise overlays.

### Borders

1px hairline at `#ebebeb` is the universal divider — table rows, card edges, input borders, dropdown menus. A heavier `#a1a1a1` divider appears only as the stronger visual rule on light bands or as deemphasised text. The brand never uses dashed or dotted borders.

### Shadows / elevation

**Stacked shadows, not single drops.** Cards layer two or three small offsets (`0px 1px 1px #00000005`, `0px 2px 2px #0000000a`, `0px 8px 8px -8px #0000000a`) plus an inset `0 0 0 1px #00000014` hairline ring. The result reads as "card sits on paper" rather than "card floats above paper." A single 8px-blur Material-style drop instantly looks wrong.

### Corner radii

Two coexisting pill scales:

- **Marketing pills:** 100px (the canonical CTA shape).
- **In-app buttons + inputs:** 6px (`--geist-radius`).
- **Marketing cards:** 8px (`--geist-marketing-radius`).
- **Pricing / hero cards:** 12–16px.
- **Tab pills (centered nav row):** 64px.

Pick a scale and stay there per screen — never put a 100px marketing CTA next to a 6px nav radius on the same screen.

### Hover / press states

- **Buttons:** hover dims fill by ~6% (black goes `#171717` → `#262626`; white goes `#ffffff` → `#fafafa`). Press dims by ~10% and applies an inset 1px shadow.
- **Cards:** hover lightens the inset hairline ring slightly; the card itself does not lift. No transform-Y, no shadow growth.
- **Links:** underline appears on hover; color does not change.
- **Tabs:** ghost background fills in (`#fafafa`) on hover; active state inverts to `#171717` fill with white text.

### Animation

Calm and short. Easings are flat or `cubic-bezier(0.4, 0, 0.2, 1)`. Hover transitions run 150ms; page transitions 200ms. No bounces, no spring overshoots, no parallax. The mesh gradient may slowly drift (8–12s ease-in-out loops) as the only atmospheric motion.

### Transparency & blur

Transparency is reserved for the gradient (which mixes via overlapping radial stops at ~60% opacity each) and for hairline borders (`#00000014` inset rings). Backdrop-blur is not used on cards. A modal scrim is `rgba(0, 0, 0, 0.5)` over the page with no blur.

### Imagery vibe

Cool, calm, slightly cyan-shifted. Customer logos render monochrome (single ink color, no full-color logos). Code editor mockups use the dark `#171717` band. Template thumbnails are 16:9 landscape with a consistent grayscale palette in the placeholder state. The page reads cool, not warm.

### Layout rules

- Max content width 1400px. Edge gutters 24px desktop, 16px mobile.
- Sticky nav at 64px tall on every page.
- Three-up feature grids → two-up → one-up.
- Pricing 3-up with the middle tier polarity-flipped to ink.
- Logo strips render single-row, ~5 logos wide, monochrome at 24px height.

---

## Iconography

The brand uses **monochrome stroke icons** at 1.5px stroke weight. The icon system was not supplied with the spec — we substitute **Lucide** (lucide.dev) via CDN as the closest stylistic match (geometric, 1.5px stroke, 24px grid, single-color). If the brand owner publishes a proprietary icon set, swap it in.

- **Icon weight:** stroke 1.5px, never filled, never multi-color.
- **Icon size:** 16px in nav and inline labels; 20px in card headers; 24px in feature illustrations.
- **Icon color:** inherits text color (`#171717` on light, `#ffffff` on dark). The icon never carries its own color; it always borrows the surrounding text token.
- **Emoji:** never used.
- **Unicode glyphs as icons:** never used as decoration. Arrow → in CTAs is fine since it reads as typography.

Customer logos are rendered as monochrome SVGs in the logo strip, always at consistent 24px height. We did not have brand logos to copy in; the kit ships with placeholder name-marks instead.

> **Substitution flag.** Lucide is a substitute. Real Geist/Vercel-style icons would ship with the source kit. Please confirm with the brand owner or supply assets.

---

## Caveats & open questions

- **Fonts:** Geist + Geist Mono loaded via Google Fonts CDN. Near-perfect match but not bit-exact. If the brand owner has custom-cut TTFs, drop them into `fonts/`.
- **Icons:** Lucide is a substitute for an unnamed proprietary icon set.
- **Logos / brand imagery:** none supplied — the marketing kit uses placeholder name-marks.
- **In-product surfaces:** out of scope. Only the marketing surface is documented.


## Game leaderboard configuration

The game requests `jinki-v2` sessions. Deploy the dual-version backend **before** this frontend; v2 has only been validated locally and is not yet deployed. For local backend development, copy `.env.example` to `.env.local`, run your backend on port 8787 and run `npm run dev` for the frontend on port 5173. See [GAME_MODE.md](GAME_MODE.md#leaderboard-backend-integration) for request caching, score eligibility, version rollout and verification commands.
