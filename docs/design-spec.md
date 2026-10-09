# Fase 3 restyle spec — Robotshow.id in Lusion's design language

Single source of truth for the section restyle. Every agent working on `src/components/*` must follow this.

## 1. Tokens (already live in `src/index.css` — do not edit that file)

Palette:
- `--color-bg #f0f1fa` (paper), `--color-ink #000`, `--color-white #fff`
- `--color-blue #0016ec` (primary accent), `--color-blue-bright #1a2ffb`
- `--color-acid #c1ff00` (secondary accent, sparingly), `--color-red #ff4c41` (status/error only), `--color-grey-blue #2b2e3a`
- Legacy aliases are already light: `--text-pure/#text-heading` black, `--text-body #2b2e3a`, `--text-muted #61667a`, `--border-subtle rgba(0,0,0,.12)`, `--bg-surface #fff`, `--bg-glass rgba(240,241,250,.72)`, `--accent #0016ec`, `--shadow-card`.

Layout / type:
- `--pad-x max(5vw,40px)`, `--grid-gap 2vw`, `--radius 20px` (cards), `--radius-full` (pills), `--hairline`
- `--font-display` Switzer, `--font-mono` IBM Plex Mono
- Utility classes: `.container`, `.grid-12`, `.mono-label` (0.72rem mono uppercase tracking .12em), `.display` (900 / -0.04em / lh .95), `.cross` (14px corner tick), `.btn-cyber-primary`, `.btn-cyber-outline`, `.cyber-card`, `.marquee`.
- `.theme-dark` scope flips legacy aliases back to the dark palette — **only the 3D lab section may use it.**

## 2. Hard rules

1. **Transparent sections.** A section must NOT paint its own background. Background comes from `PageBackdrop` via `data-bg="<hex>"` on the section root. Choose from: `#f0f1fa` (paper), `#ffffff`, `#e7e9f6` (cool tint), `#f5f6fc`, `#0a0c10` (lab/dark media only). No gradients, no pattern fills. At most one dark section besides the lab.
2. **Keep everything.** All copy, i18n keys (`t.*`), `data-split` / `data-reveal` / `data-parallax` hooks, GSAP motion, aria labels, WhatsApp links, existing hover behaviors. Restyle presentation only.
3. **Do NOT edit** `src/context/LanguageContext.jsx`, `src/index.css`, `src/App.jsx`, `src/robot.jsx`, `src/three/*`, or files outside your assigned scope. No new i18n keys — reuse existing `t.*`; meta/eyebrow labels that need no translation may be literal uppercase EN (e.g. `(01)`) only if they already exist in the file.
4. **Type scale.** Statement headings: `.display` + `clamp(3.5rem, 8vw, 9rem)`. Sub-headings: weight 700, ~1.6–2.2rem, letter-spacing -0.02em. Body: 1rem/1.6, `var(--text-body)`. Every eyebrow/tag/meta = `.mono-label`.
5. **Accents:** blue is the workhorse; acid green only for tiny highlights (live dots, one keyword, arrows). Never more than two accents per section. Red only for status.
6. **Anti-slop:** no glassmorphism stacks, no glow shadows, no neon, no emoji, no purple-blue gradient text, no cyan-on-black (except the lab), no drop shadows heavier than `var(--shadow-card)`. Cards = white + `var(--hairline)` + `20px` radius. Use hairline rules and `.cross` markers for structure.
7. **Mono meta voice:** index numbers `(01)`, spec rows, dates, labels — all `.mono-label`.
8. **Buttons** use `.btn-cyber-primary` / `.btn-cyber-outline` classes (already restyled globally).
9. Never hardcode `rgba(255,255,255,…)` for text/borders assuming a dark background.

## 3. Verification (each agent)

- `npm run lint` must pass (fast-refresh warnings are OK, errors are not).
- Do NOT run `npm run build`, do NOT start a dev server (one is already running on `:5173`), do NOT take screenshots (the orchestrator does that).
- Report: files changed, `data-bg` values added, any copy you had to leave as-is.

## 4. Section assignment

| Agent | Files | Notes |
|---|---|---|
| A | `StorySection.jsx`, `ServiceSection.jsx` | Story = editorial statement section (big display type, photo cards); Service = offer cards with `mono-label` specs |
| B | `FleetSection.jsx`, `FaqSection.jsx` | Fleet = card grid, keep hover thumbnails + links; FAQ = accordion, hairline rows |
| C | `Footer.jsx`, `RobotPage.jsx` (+ check `Catalog.jsx` only if it renders inside Footer scope — otherwise skip) | Footer: giant wordmark, mono nav columns; RobotPage: light detail layout with `theme-dark` only around the 3D viewer |
| orchestrator | `Navbar.jsx`, `Hero.jsx`, `LabSection.jsx` | — |
