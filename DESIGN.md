# DESIGN.md: Vinul Gajaman Portfolio

The single source of truth for the build. If code and this file disagree, this file wins. If this file and a measured value in `research/portvio/*.md` disagree, fix this file first, then the code.

> **Rev 2 (2026-10-06, completeness pass).** Every portvio effect is now listed in **Appendix A: Fidelity checklist** with the section that implements it. Corrections in this revision: spring timings (§2.1, §2.2), count-up easing (§2.5), menu link size and phone panel direction (§3.1), the open accordion row layout (§3.5), the footer wordmark (§3.12), the primary-button label timing (§2.5), plus new specs for the `portvio` motion profile and Back/Forward scroll restoration (§2.4), layered scroll depth in the hero (§3.2), the full skills index (§3.4), deferred portvio components (§3.14) and the scroll-craft dwell and tilt techniques (§2.1, §2.5).

- **Owner:** Vinul Gajaman, Software Engineer (Full-Stack & Mobile), Colombo, Sri Lanka. Content source: `docs/Vinul Gajaman CV.pdf`.
- **Reference to replicate, then exceed:** https://portvio.framer.website/ (scraped 2026-10-05). Evidence:
  - `research/portvio/structure.md`: layout, tokens and screenshots
  - `research/portvio/motion.md`: load and scroll motion
  - `research/portvio/interactions.md`: hover, mouse and click behaviour
  - `research/portvio/bundle.md`: exact configs from the JS bundles
- **Quality floor:** scroll-craft's `references/taste.md`, copied verbatim to `research/scroll-craft/DESIGN.source.md`, plus the engine notes in `research/scroll-craft/analysis.md`.
- **Citations:**
  - **[taste: Section]**: a rule from taste.md.
  - **[sc: technique]**: a value from the scroll-craft engine.
  - **[pv: file §]**: a value measured on portvio.
  - **New**: an upgrade that goes beyond portvio.
- **Stack (fixed, versions verified in `node_modules` on 2026-10-06):**
  - Next.js 16.3.8 (App Router, TypeScript, `output: 'export'`), React 19.2.8
  - Tailwind CSS 4.3
  - GSAP 3.15.0 with ScrollTrigger, SplitText and CustomEase, all bundled in the `gsap` package and free. **Add `@gsap/react` (not installed yet).**
  - Lenis 1.3.26 (`lenis/react`)
  - `motion` 14.0.0 (`motion/react`), only for hover variants, layout FLIP and presence
  - Clash Display (self-hosted, `next/font/local`) and Inter (`next/font/google`)

> **Next.js warning:** `AGENTS.md` says this Next version has breaking changes. Read `node_modules/next/dist/docs/` before writing routing, font, image, metadata or export code. Already checked for this spec:
> - `01-app/02-guides/static-exports.md`: no Server Actions, no default image loader, and dynamic routes need `generateStaticParams` with `dynamicParams = false`.
> - `03-api-reference/02-components/link.md`: `onNavigate` with `e.preventDefault()`, `scroll={false}` and `transitionTypes`.
> - `03-api-reference/02-components/font.md`: `next/font/local` with `variable`, `declarations` and `adjustFontFallback`.

---

## Table of contents

0. [Principles](#0-principles)
1. [Brand and art direction](#1-brand-and-art-direction)
2. [Motion system](#2-motion-system)
3. [Information architecture and homepage spec](#3-information-architecture-and-homepage-spec)
4. [Project detail pages `/work/[slug]`](#4-project-detail-pages-workslug)
5. [Media placeholder inventory](#5-media-placeholder-inventory)
6. [Accessibility, performance and reduced motion](#6-accessibility-performance-and-reduced-motion)
7. [Engineering architecture](#7-engineering-architecture)
8. [scroll-craft rules: adopted and overridden](#8-scroll-craft-rules-adopted-and-overridden)
9. [Open items for Vinul](#9-open-items-for-vinul)
10. [Appendix A: Fidelity checklist](#appendix-a-fidelity-checklist)

---

## 0. Principles

1. **Portvio's language, Vinul's content.**
   - Copy portvio's palette, type, spacing, radii, signature transitions and interaction timings exactly. Every value below is measured.
   - Replace the agency content with Vinul's real CV content.
   - No lorem, no invented numbers and no fake testimonials **[taste: States and content]**.
   - The CV's References section (referees' names, emails and phone numbers) never appears on the site, in metadata or in any downloadable file.
2. **More premium, never noisier.** Every upgrade extends something portvio already does:
   - masked line reveals (portvio uses them in its menu)
   - the 7° slant (portvio's hero curtain)
   - zero-bounce springs
   - the difference-blend cursor

   Nothing bounces and nothing glows neon.
3. **Compositor-only motion.**
   - Animate `transform`, `opacity` and `clip-path` only.
   - `filter: blur()` is allowed only on small word spans (`<BlurText>`) and on static layers.
   - Never use `transition: all`. Never animate width, height, top, left, margin or padding **[taste: Motion]**.
   - "Grow" effects use `clip-path` or FLIP, never box-size animation.
4. **Reduced motion means fewer and gentler effects, not none.** Every primitive has a reduced-motion branch (§6.3) **[taste: Motion]**.
5. **The build works without media.** The site must look finished with zero images. Every media slot renders an animated placeholder, labelled with its slot id, until its file exists in `/public/media/` (§5).

---

## 1. Brand and art direction

### 1.1 Mood

A dark room lit by one warm source:
- **Canvas and surfaces:** a near-black canvas (#0D0D0D), warm graphite cards and one orange accent (#F65802).
- **Photography:** monochrome orange-to-crimson, rim-lit side-profile silhouettes of Vinul.
- **Type:** heavy, wide, uppercase Clash Display for headlines; calm Inter for everything else.
- **Motion:** slow, weighty and critically damped. Things glide into place and settle without overshoot. Scroll is a long inertial glide (Lenis, 1.8s).

Portvio screenshots to keep open while building:
- `research/portvio/structure/shots/home-vp-01..17.png` (desktop)
- `home-mobile-vp-01..19.png` (phone)
- `research/portvio/motion/scroll-desktop/shots/scroll-00300.png` (curtain)
- `scroll-03600.png` (staircase)
- `home-vp-12.png` (showreel)

### 1.2 Colour tokens (exact, from portvio)

Source: [pv: structure §2.3, bundle §2, interactions §8]. Contrast ratios were computed against #0D0D0D with the WCAG relative-luminance formula.

| Token (CSS var) | Value | Role | Contrast on canvas |
|---|---|---|---|
| `--color-canvas` | `#0D0D0D` | Page and section background, menu panel, dark text on light fills | n/a |
| `--color-canvas-deep` | `#0A0A0A` | Preloader and page-transition panel | n/a |
| `--color-placeholder` | `#161515` | **New.** Ground for media placeholders | n/a |
| `--color-surface` | `#232222` | Cards: work, process, impact, experience, stack tiles, Prev/Next pills, stat boxes | n/a |
| `--color-surface-70` | `rgba(35,34,34,.70)` | Hover on expertise and education rows | n/a |
| `--color-surface-2` | `#282727` | Start of the highlighted-card gradient | n/a |
| `--color-surface-3` | `#303030` | End of the highlighted-card gradient; process inner panel | n/a |
| `--color-surface-btn` | `#2F2E2D` | Accordion button, open state | n/a |
| `--color-line` | `#3C3C3C` | Default 1px borders and dividers | 1.9:1 (decorative only) |
| `--color-ink` | `#FFFFFF` | Primary text, white button, cursor | 19.4:1 |
| `--color-ink-soft` | `#BDBDBD` | Secondary text | 10.3:1 |
| `--color-ink-faint` | `#999999` | Tertiary text | 6.8:1 |
| `--color-accent` | `#F65802` | "Willpower Orange", the only accent | 5.9:1 (as text) |
| `--color-accent-85` | `rgba(246,88,2,.85)` | Hover on form buttons | n/a |
| `--color-accent-ink` | `#0D0D0D` | Text and icons on orange (see §1.2.1) | 5.9:1 on orange |
| `--color-glass` | `rgba(255,255,255,.20)` | Glass on photos (hero chips, hero arrow tab) | n/a |
| `--color-glass-hover` | `rgba(255,255,255,.30)` | Glass hover, glass border | n/a |
| `--color-tag` | `rgba(255,255,255,.10)` | Tag chips, input ground | n/a |
| `--color-faint` | `rgba(255,255,255,.05)` | Faint fill | n/a |
| `--color-backdrop` | `rgba(0,0,0,.25)` | Menu backdrop (with `blur(5px)`) | n/a |
| `--color-error` | `#FF2244` | Form errors | 5.3:1 |
| `--color-error-bg` | `rgba(255,34,68,.15)` | Error-state ground | n/a |

**Gradients and effects (exact):**
- **Divider line:** 1px tall, `linear-gradient(90deg, rgba(255,255,255,.3) 0%, #0D0D0D 100%)`. Alternate rows use the mirrored direction.
- **Footer glow:**
  - `radial-gradient(50% 50% at 50% 50%, #F65802 0%, #0D0D0D 100%)` with `filter: blur(50px)` and `opacity: .6`
  - Size 100% × 600px at `bottom: -300px`; tablet 400px / -200px; phone 300px / -150px
  - The filter sits on a static layer, so it is rasterised once.
- **Process inner panel:** `linear-gradient(180deg, #303030 0%, #303030 100%)`.
- **Highlighted card:** `linear-gradient(180deg, #282727 0%, #303030 100%)`.
- **Marquee edge masks:**
  - Hero chips: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,.9) 10.36%, rgba(0,0,0,.9) 88.29%, transparent 100%)`
  - Stack tiles: the same, with stops at 7.21% / 92.79%
- **Showreel video:** `filter: brightness(.7)`, static.

#### 1.2.1 Contrast decision: text on orange

White on `#F65802` measures **3.3:1**. That fails WCAG AA for portvio's 18px/500 button labels, because 18px at weight 500 does not count as large text.

- **Default:** labels and icons on orange use `--color-accent-ink` (#0D0D0D), which measures 5.9:1.
- **One-token switch:** this lives in a single token. If Vinul wants portvio's white labels, set `--color-accent-ink: #FFFFFF` and accept the AA failure. Do not change the colour anywhere else.

This is open item 5 in §9 **[taste: Colour; States: "Check button contrast"]**.

#### 1.2.2 Browser surfaces [taste: Browser surfaces]

- `::selection { background:#F65802; color:#0D0D0D }`
- `caret-color: #F65802`
- `scrollbar-color: #3C3C3C #0D0D0D; scrollbar-width: thin`
- Links: `text-underline-offset: .2em; text-decoration-thickness: 1px`
- Focus ring: see §6.1
- `font-variant-numeric: tabular-nums` on every counter, clock, year and "01/03"
- `color-scheme: dark`

### 1.3 Typography

**Families (two at most [taste: Typography]):**
- **Clash Display** 600 and 700 (Indian Type Foundry via Fontshare; the ITF Free Font License allows web use).
  - Self-host the files already downloaded: `research/portvio/structure/fonts/ClashDisplay-600.woff2` and `ClashDisplay-700.woff2`. Both render at the live site's exact widths ("STRATEGIC" at 48px = 291.2px).
  - Copy them to `src/fonts/` and load with `next/font/local` as variable `--font-clash`.
  - Set `adjustFontFallback: false` and pass portvio's metric overrides through `declarations` (below).
- **Inter** 400 / 500 / 600 / 700 via `next/font/google`, with `subsets:['latin']`, `display:'swap'` and variable `--font-inter`.
  - taste.md discourages Inter as a default choice. We keep it because it is portvio's actual body face and the brief asks for a replica **[taste: Font choice, "the brand's own face"]**.
- **Fallback metrics (from portvio, to avoid layout shift):**
  - Clash fallback: `local("Arial")` with `ascent-override: 83.42%; descent-override: 23.43%; line-gap-override: 8.44%; size-adjust: 106.69%`.
  - Inter fallback: `ascent-override: 89.79%; descent-override: 22.36%; line-gap-override: 0%; size-adjust: 107.89%`. `next/font/google` generates an equivalent automatically (`adjustFontFallback: true`).

**Type scale.** Sizes are listed as Desktop ≥1200 / Tablet 810–1199 / Phone <810. Rows marked **New** are upgrades. Every other row is measured [pv: structure §2.2, bundle §3].

| Token | Family / weight | Size D / T / P | Line-height | Tracking | Case | Default colour | Used for |
|---|---|---|---|---|---|---|---|
| `display-wordmark` **New** | Clash 700 | fitted to the container (§1.3.1) | 0.82 | −0.02em | UPPER | ink | Hero "VINUL GAJAMAN", giant footer name, next-project title |
| `display-counter` **New** | Clash 600 | clamp(64px, 10vw, 160px) | 0.9 | −0.03em | — | ink | Preloader counter |
| `display-impact` **New** | Clash 600 | clamp(56px, 6.5vw, 96px) | 0.94 | −0.03em | — | ink | Impact rail numbers. Capped at 6rem, because taste.md limits display type outside a hero moment to about 6rem |
| `h2` | Clash 700 | 48 / 42 / 34px | 1.2 | 0 | UPPER | ink | Section titles, SHOWREEL labels, project title, 404 |
| `menu-link` | Clash 700 | **54px at every width** (measured at 1440 and at 390) | 1.0 (54px line box, 56px rows, gap 4, so a 60px pitch) | 0 | Title | ink | Menu overlay links. Desktop positions: x 832, y 202 / 262 / 322 / 382 / 442 [pv: structure/data/home-extra.json `menuText`, `html/home-mobile-menu-open.html`] |
| `number` | Clash 600 | 36 / 32 / 26px | 1.2 | 0 | UPPER | ink | Stat boxes, years, education years |
| `statement` | Inter 700 | 32 / 28 / 24px | 1.3 | 0 | UPPER | ink + accent spans | About statement, expertise titles, "LET'S TALK", case-study H3s |
| `lead` | Inter 500 | 20 / 17 / 16px | 1.32 | −0.02em | — | ink or ink-soft | Eyebrows, hero paragraph, card titles, meta values |
| `ui` | Inter 500 | 18px all | 1.48 | 0 | — | ink | Buttons, hero tagline, stat labels, Prev/Next |
| `link-roll` | Inter 400 (nav email, footer) / 500 (Menu) | 16 / 18px | 1.0 | 0 | — | ink | `<RollText>` links |
| `body` | Inter 400 | 16px all | 1.6 | −0.02em | — | ink-soft | Paragraphs, card copy, counters ("6 Projects") |
| `tag` | Inter 600 | 16px all | 1.32 | −0.02em | UPPER | ink | Tag chips, "WHAT I DID:" |
| `small` | Inter 400 | 14px all | 1.28 | 0 | — | ink or ink-soft | "01/03", roles, copyright |
| `micro` **New** | Inter 600 | 12px all | 1.0 | 0.08em | UPPER | ink-soft | Cursor labels, placeholder labels, "Current" pill |
| `input` | Inter 400 | 16px all | 1.2 | 0 | — | ink | Form fields |

**Rules:**
- **Tracking:** it tightens only on the new display sizes of 64px and up **[taste: Typography, "tracking tightens as size grows"]**. Portvio's H2s keep tracking 0 for fidelity.
- **Wrapping:** `text-wrap: balance` on `h2`, `statement` and `menu-link`; `text-wrap: pretty` on `body` and `lead` **[taste: Typography]**.
- **Measure:** body paragraphs are at most 62ch wide **[taste: Typography]**. The case-study article column is 940px (portvio); paragraphs inside it are capped at 68ch.
- **Phone wordmark:** below 810px the hero wordmark breaks onto two lines, so it never wraps raggedly **[taste: "Step the hero down one rung below ~700px"]**.
- **Dashes:** no em dashes in visible copy. En dashes are for ranges only ("2024 – 2025") **[taste: Refuse list, Content]**.

#### 1.3.1 Wordmark fitting (measured)

The wordmark is live text, not an SVG. These widths are in em at weight 700, measured with the real Clash Display file by `research/tools/design-measure.cjs`:

| Text | Width at tracking 0 | At −0.02em | At −0.03em |
|---|---|---|---|
| `VINUL GAJAMAN` | 8.906 | 8.646 | 8.516 |
| `VINUL` | 3.133 | 3.033 | 2.983 |
| `GAJAMAN` | 5.633 | 5.493 | 5.423 |

- **Cap height:** 0.67em. CSS letter-spacing also adds space after the last character, so subtract one tracking step to get the ink width.
- **Fitting:** use container query units, not `vw`, because `vw` includes the Windows scrollbar and causes horizontal overflow. The wrapper gets `container-type: inline-size; width: 100%`, and the text gets `font-size: calc(100cqw / K)`.
- **Constants (they include the 0.30em orange sparkle superscript that replaces portvio's ®):**
  - Desktop and tablet, one line `VINUL GAJAMAN✦`: **K = 8.93**. That is 156.8px at 1440 (cap 105px) and 110px at 1024.
  - Phone, two lines `VINUL` / `GAJAMAN✦`, both at the same size, left-aligned: **K = 5.77** (fitted to "GAJAMAN" plus the sparkle). That is 62px at 390 (cap 41.5px), which matches portvio's phone wordmark (358 × about 46px).
  - Footer, one line at −0.03em: **K = 8.80**.
- **Sparkle:** a 4-point star, `#F65802`, `width: .28em`, `vertical-align: super`, `margin-left: .02em`.

### 1.4 Spacing, layout and grid

[pv: structure §2.5–2.6]

| | Phone <810 | Tablet 810–1199 | Desktop ≥1200 |
|---|---|---|---|
| Side gutter `--gutter` | 16px (contact keeps 20) | 20px | 20px |
| Container | 100% (358 at 390) | 100% (984 at 1024) | max-width 1440px (content 1400) |
| Section padding (top / bottom) | 60 / 20 | 80 / 20 | 100 / 40 |
| Heavy section bottom (impact, experience) | 80 | 100 | 140 |
| Heading → content gap | 30 | 40 | 50 |
| Narrow container (experience shell, centred headers) | 600 | 960 | 960 |

- **Heading spacing:** more space above a heading than below it. Portvio's 100 / 40 already does this **[taste: Spacing]**.
- **Card-internal gaps:** portvio's scale of 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 30 / 50 / 60 / 80 / 100px. It is a superset of taste.md's 4px scale.
- **Grid:** 12 columns with a 20px gap on desktop.
- **Split section header** (portvio's signature):
  - Eyebrow in columns 1–4.
  - H2 in columns 5–10. It starts at about x 477 on a 1440 screen, a third of the width.
  - Counter in columns 11–12, right-aligned, `body` ink-soft.
  - Tablet uses the same split. Phone stacks eyebrow → H2 → counter with 20px gaps.
- **Centred header** (process, experience): eyebrow above the H2 with a 20px gap, centred.
- **Breakpoints** in the Tailwind v4 `@theme` (§7.3): `--breakpoint-md: 50.625rem` (810px) and `--breakpoint-lg: 75rem` (1200px).
  - Code is mobile-first: the base is phone, `md:` is tablet, `lg:` is desktop.
  - Remove all other default breakpoints.

### 1.5 Radii, borders, depth

- **Radii** [pv: structure §2.4]:

  | Radius | Used on |
  |---|---|
  | 4px | Tags, button icon box |
  | 6px | Buttons, inputs, glass tab |
  | 8px | Hero thumbnail, footer field |
  | 10px | Process card, stack tiles, Prev/Next, experience shell, chips |
  | 12px | Process inner panel, expertise images |
  | 16px | Expertise rows, work cards, about image, impact panels |
  | 20px | Contact glass card, showreel frame, gallery images |
  | 100px | Pills, round buttons, cursor |
- **Borders:**
  - Default `1px solid #3C3C3C`; on glass, `1px solid rgba(255,255,255,.3)`.
  - Draw them as `::after` overlays (`inset:0; border-radius:inherit; pointer-events:none`) so a border never changes layout. This is portvio's own technique.
- **Depth upgrades** (portvio has no shadows) **[taste: Depth]**:
  - Edge light on every `surface` card: `box-shadow: inset 0 1px 0 rgba(255,255,255,.06)`.
  - Stacked work cards: `box-shadow: 0 -24px 60px -20px rgba(5,5,5,.7)`, tinted to the canvas and never `#000`.
  - Global grain (§1.6).
  - **Overlap as depth:** sections slide over the sticky hero (portvio), and the stacked work cards overlap each other.
  - There are three elevations only: flat, edge-lit card and stacked card.

### 1.6 Background system (premium upgrade)

1. **Grain overlay (`<Grain/>`):**
   - A fixed full-viewport layer, `pointer-events:none`, z 55.
   - Background: a 256×256 tiling noise PNG. Generate it once from an SVG `feTurbulence` (`baseFrequency=.8 numOctaves=4`) and save it as `/public/textures/grain.png` (≤ 20KB).
   - `opacity: .045`, `mix-blend-mode: overlay` **[taste: Depth, grain 4–5%] [sc: grain 0.045]**.
   - Jitter: `animation: grain .8s steps(6) infinite`, moving `transform: translate()` in ±3% steps (transform only). Static under reduced motion.
2. **Gradient-mesh glow fields (`<AmbientGlow/>`):**
   - Two or three radial blobs in each dark section that needs warmth (about, process, impact, experience): `radial-gradient(closest-side, rgba(246,88,2,.10), transparent)`, 600–900px across.
   - The softness comes from the gradient itself, with no `filter`.
   - Each blob drifts on a 24–32s `ease-in-out` alternate loop (translate ±6vw / ±4vh, scale 1 → 1.15), plus scroll parallax of 0.15.
   - Opacity never goes above .12: a lit room, not a neon sign **[taste: AI-purple trap, neon ban]**.
   - A blob pauses when its section is off-screen.
3. **Cursor spotlight (`<Spotlight/>`, fine pointer only):**
   - Sets `--mx` / `--my` on the host element.
   - A pseudo-element paints `radial-gradient(28rem circle at var(--mx) var(--my), rgba(246,88,2,.08), transparent 70%)`. scroll-craft uses 28rem at 16% **[sc: spotlight]**; we use 8% on #0D0D0D.
   - Used on the expertise list, the experience shell and the footer.
4. **Footer glow:** portvio's exact glow (§1.2). In addition, its centre follows the cursor's x position via `gsap.quickTo(…, {duration: 1.2, ease: "power3.out"})`, clamped to 30–70% of the width. At idle it breathes between opacity .5 and .65 over 6s.
5. **Scroll progress:** a fixed 2px bar at the top in `#F65802`, `transform: scaleX(progress)`, `transform-origin: 0 50%`, z 50 **[sc: 2px progress bar]**. It fades in after `scrollY > 100vh` and hides while the menu is open.

No WebGL: CSS gives the same look at these opacities and keeps the JS budget (§6.2).

### 1.7 Z-index scale

| Layer | z |
|---|---|
| Hero | 1 |
| Sections | 2 |
| About curtain | 3 |
| Section content above the curtain | 4 |
| Nav | 10 |
| Compact nav pill | 20 |
| Menu backdrop | 40 |
| Menu panel | 41 |
| Menu trigger while open | 42 |
| Progress bar | 50 |
| Grain | 55 |
| Cursor | 60 |
| Page-transition panels | 70 / 71 |
| Preloader | 80 |
| Skip link | 90 |

The cursor stays visible over the menu (portvio behaviour).

### 1.8 "More premium than portvio": the upgrade list

Each item names its portvio baseline, so a reviewer can see it extends the existing language rather than adding a new style.

| # | Upgrade | Portvio baseline | Spec |
|---|---|---|---|
| U1 | **Preloader:** 000→100 counter, masked name reveal, curtain lifts on a 7° slant | No preloader | §2.5 `<Preloader>` |
| U2 | **Layered hero depth:** the wordmark sits between the background plate and Vinul's cut-out, with mouse parallax | Flat photo + wordmark | §3.2 |
| U3 | **Per-char wordmark rise**, per-word blur tagline, masked paragraph lines | Block fade-ups | §3.2 |
| U4 | **Masked line reveals on every H2** | Block fade-up, y 30 | `<RevealText mode="lines">` |
| U5 | **Scroll-filled About statement** (word opacity scrub) | Static after its fade-up | `<ScrollFillText>` |
| U6 | **Counters** on every number | Static numbers | `<Counter>` |
| U7 | **Velocity-reactive marquees** (speed and skew follow scroll velocity) | Constant 40 / 50 px/s | `<Marquee velocity>` |
| U8 | **Cursor-following image preview** on expertise rows | Background fade only | §3.5 |
| U9 | **Pinned stacking project deck** (6 cards; earlier cards scale and dim) | 3 zig-zag rows | `<StackCards>` §3.7 |
| U10 | **Horizontal pinned impact rail** with count-ups | No horizontal section | `<HorizontalRail>` §3.8 |
| U11 | **Scroll-scrubbed image zooms** (contact background, case-study banners) | Parallax only | `<ScrollZoom>` |
| U12 | **Slanted clip-path entry on Contact**, echoing the hero curtain | Hard edge | §3.11 |
| U13 | **Context cursor:** difference dot plus labelled states ("View", "Open", "Copy") | Dot only | `<Cursor>` |
| U14 | **Magnetic buttons** (primary CTAs, Menu trigger, round icon buttons) | None | `<Magnetic>` |
| U15 | **Page transitions:** orange then dark slanted panels with the route title | Instant swap | `<PageTransition>` |
| U16 | **Compact floating Menu pill** after the hero | Absolute nav only (scrolls away) | §3.1 |
| U17 | **Grain, gradient-mesh glow and spotlight** background system | Flat #0D0D0D | §1.6 |
| U18 | **Menu link dimming and sparkle** on hover; scroll locked while open | Roll only | §3.1 |
| U19 | **Scroll-drawn experience timeline** above the experience shell | Pricing shell, no timeline | §3.9 |
| U20 | **Pointer tilt** on the impact panels (scroll-craft's exact tilt) | No mouse-driven transforms | `<Tilt>` §2.5, §3.8 |

The hero's layered scroll depth (§3.2) is part of U2 and also works on touch devices.

---

## 2. Motion system

### 2.1 Easing tokens

Register every token once in `src/lib/gsap.ts` with `CustomEase.create(name, data)`, and mirror each one as a CSS variable in `@theme` (§7.3).

**Cubic-bezier tokens**

| Token | Value | Source | Used for |
|---|---|---|---|
| `portvio` | `cubic-bezier(.44, 0, .56, 1)` | [pv: bundle §5.1] hero background tween, form-button colour | Hero background scale, colour tweens |
| `mask` | `cubic-bezier(.645, .045, .355, 1)` | [pv: bundle §5.15] menu link reveal (easeInOutCubic) | Masked line reveals, menu links, page-transition panels |
| `roll` | `cubic-bezier(.42, 0, .58, 1)` | [pv: interactions §2] motion `easeInOut` | `<RollText>` |
| `out` | `cubic-bezier(.23, 1, .32, 1)` | [taste: Motion `--sc-ease-out`] | Small UI hovers (120–180ms), press, cursor label |
| `drawer` | `cubic-bezier(.32, .72, 0, 1)` | scroll-craft `--sc-ease-drawer` | Compact nav pill |
| `expoInOut` | `cubic-bezier(.87, 0, .13, 1)` | GSAP `expo.inOut` | Preloader exit, transition panels |
| `smoothstep` | `x*x*(3-2x)` (function) | [sc: easing] | Per-word windows in `<ScrollFillText>` |
| `dwell(x, L)` | `(1-L)*x + L*(4*(x-.5)**3 + .5)`, with L ≤ 0.6 (function; f(0)=0, f(1)=1) | [sc: dwell, `scrollcraft.js` `dwell()`] | Scroll-scrubbed media (`<ScrollZoom>`, L = 0.4): moves faster at the edges and settles while the element is centred. Use as the GSAP `ease` of the scrubbed tween: `ease: x => dwell(x, .4)` |
| Lenis | `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | [pv: motion §0] | Smooth scroll |

**Exact spring tokens (portvio's zero-bounce Framer springs as CSS `linear()` curves).** Use them in CSS as `transition: transform var(--dur) var(--ease-spring-…)`. In GSAP, build them with the helper `springEase(points)`, which converts the 25 equally spaced samples into a CustomEase path `M0,0 L(i/24),(y_i) …`. The result reproduces portvio's motion curves exactly [pv: bundle §7, `bundle/springs.json`].

| Token | Framer config | Duration | `linear()` samples |
|---|---|---|---|
| `--ease-spring-hero` | spring d1.0 b0 | 1.007s | `linear(0, .0624, .1884, .3303, .4648, .582, .679, .7567, .8175, .8643, .8997, .9264, .9458, .9606, .9714, .9794, .9851, .9893, .9923, .9945, .9961, .9972, .998, .9986, 1)` |
| `--ease-spring-reveal` | spring d1.2 b0 | 1.207s | `linear(0, .0609, .188, .3287, .4624, .579, .6777, .7551, .8159, .8636, .899, .9257, .9456, .9606, .9714, .9793, .9851, .9893, .9923, .9945, .9961, .9972, .998, .9986, 1)` |
| `--ease-spring-layout` | spring d0.8 b0 | 0.809s | `linear(0, .0647, .189, .3327, .4685, .5863, .6809, .759, .8198, .8653, .9008, .9274, .9471, .9613, .972, .9799, .9854, .9895, .9925, .9946, .9962, .9973, .9981, .9986, 1)` |
| `--ease-spring-ui` | spring d0.6 b0 | 0.63s | `linear(0, .0686, .2069, .3534, .4894, .6058, .704, .7782, .8355, .879, .9127, .9365, .9541, .9669, .9766, .9832, .988, .9915, .994, .9957, .997, .9979, .9985, .9989, 1)` |
| `--ease-spring-fade` | spring d0.4 b0 | 0.442s | `linear(0, .0767, .226, .3777, .5225, .6369, .7328, .8027, .8557, .8971, .9258, .9477, .9626, .9734, .9815, .9869, .9909, .9936, .9956, .9969, .9978, .9985, .9989, .9993, 1)` |
| `--ease-spring-snappy` | spring d0.4 b0.2 | 0.42s | `linear(0, .077, .2184, .3893, .5428, .6821, .7871, .8707, .9268, .9666, .9902, 1.0045, 1.0111, 1.0135, 1.0132, 1.0114, 1.0093, 1.007, 1.0051, 1.0034, 1.0022, 1.0013, 1.0007, 1.0002, 1)` |
| `--ease-spring-card` | k300 c100 | 2.243s (50% at 0.23s, 90% at 0.75s, 95% at 0.98s) | `linear(0, .23, .4241, .568, .6769, .7576, .8187, .864, .8983, .9237, .9429, .9572, .9679, .976, .982, .9865, .9899, .9924, .9943, .9958, .9968, .9976, .9982, .9987, 1)` |

Shortcuts when exactness does not matter:
- A zero-bounce spring lies between GSAP `power3.out` (50% at 0.16 of the duration, 90% at 0.44) and `power4.out` (0.13 / 0.37). The spring itself is 0.17 / 0.39.
- `cubic-bezier(.28, .55, .1, 1.05)` is the bundle's single-curve approximation.

**Never use `ease-in` or `power*.in` on UI [taste: Motion]**. Exits use `mask` or `expoInOut`.

### 2.2 Spring tokens (motion library)

In `motion`, pass the Framer form directly: `{ type: "spring", duration, bounce }`. It resolves to the same physics portvio uses [pv: interactions §8, bundle §7].

| Token | motion config | Stiffness / damping (m = 1) | t50 / t90 / settle | Used for |
|---|---|---|---|---|
| `springHero` | `{duration:1, bounce:0}` | 85.3 / 18.5 | 182ms / 421ms / 1.00s | Hero intro elements |
| `springReveal` | `{duration:1.2, bounce:0}` | 59.2 / 15.4 | 218ms / 506ms / 1.20s | Section reveals |
| `springLayout` | `{duration:.8, bounce:0}` | 133.2 / 23.1 | 145ms / 337ms / 0.81s | Accordion, slider, row hover colour |
| `springUI` | `{duration:.6, bounce:0}` | 236.8 / 30.8 | 109ms / 253ms / 0.63s | Buttons, card hover, menu panel, slot swaps, cursor states |
| `springFade` | `{duration:.4, bounce:0}` | 532.9 / 46.2 | 72ms / 169ms / 0.44s | Backdrop fades |
| `springSnappy` | `{duration:.4, bounce:.2}` | 505.6 / 36.0 (1.4% overshoot) | 67ms / 132ms / 0.42s | Hamburger ↔ X, accordion "+" rotation |
| `springCursor` | `{stiffness:400, damping:60, mass:1}` | 400 / 60 (ζ 1.5) | 111ms / 322ms / 0.93s | Cursor follow |
| `springToggle` | `{stiffness:500, damping:60, mass:1}` | 500 / 60 (ζ 1.34) | 91ms / 252ms / 0.72s | Toggles; reference for scroll smoothing |
| `springCard` | `{stiffness:300, damping:100, mass:1}` | 300 / 100 (ζ 2.9) | 234ms / 754ms / 2.24s (95% at 978ms) | Process card pop |

`springSnappy` is the only place bounce exists; it is portvio's own component default. Nothing else overshoots.

Timings above were integrated numerically (`research/tools/critic-springs.cjs`; settle = within 0.1%). `research/portvio/motion.md` quotes about 170 / 390ms for spring d1.0 (a stiffness-100 fit) and "about 0.45s to 95%" for the card spring. The bundle's `findSpring` values (85.26 / 18.47) and the integration supersede both.

### 2.3 Duration and stagger tokens

| Token | Value | Source |
|---|---|---|
| `d.press` | 0.10s | [taste: buttons 100–160ms] |
| `d.hover` | 0.18s | [taste: hover 120–180ms]; small colour and opacity hovers |
| `d.roll` | 0.20s per char | [pv] `<RollText>` |
| `d.rollLg` | 0.30s per char | [pv] menu links |
| `d.colour` | 0.20s | [pv] form button |
| `d.ui` | 0.63s | [pv] `springUI` |
| `d.layout` | 0.80s | [pv] accordion, menu link masks |
| `d.hero` | 1.00s | [pv] hero appear |
| `d.reveal` | 1.20s | [pv] section reveals |
| `d.count` | 1.40s, ease `power2.out` (= cubic out, `1 - (1-t)^3`) | [sc: count-ups 1400ms, `scrollcraft.js` entry counters]. GSAP's `power2` is the cubic curve; `power3` would be quartic |
| `d.transition` | 0.70s cover + 0.70s reveal | New |
| `s.roll` | 0.025s | [pv] |
| `s.rollLg` | 0.030s | [pv] |
| `s.chars` | 0.020s for headings, 0.035s for the wordmark | New |
| `s.words` | 0.050s | [pv: motion §5] detail-page blur words |
| `s.lines` | 0.080s | New; within [taste: stagger 30–80ms] |
| `s.menu` | 0.050s, capped at 0.15s total | [pv] menu links at 0 / .05 / .10 / .15 / .15 |
| `s.siblings` | delays of 0.2 / 0.3 / 0.4s | [pv] hand-set sibling delays (portvio uses no `staggerChildren`) |
| `scrub` | `0.7` (ScrollTrigger `scrub: 0.7`) | Reproduces portvio's spring-smoothed scroll transforms (k500 c60, settle 0.72s) [pv: bundle §7] |

**Trigger rule** (portvio uses `threshold: .5, once: true`):
- An element reveals when 50% of it is visible.
- In ScrollTrigger, that is `start: "center bottom"` for elements shorter than the viewport and `start: "top center"` for taller ones, both with `once: true`.
- Nothing replays on scroll-up, and elements skipped by a fast scroll still fire once [pv: motion §2c, §3].
- Process cards use threshold 0: `start: "top bottom"`.

### 2.4 Global systems

**Smooth scroll (`<SmoothScroll>`)** [pv: motion §0, bundle §5.18]
- Mount `ReactLenis` from `lenis/react` with `root` and these options:

  ```ts
  { duration: 1.8,
    easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: { offset: 0, duration: 1.8 },
    stopInertiaOnNavigate: true }
  ```

- Drive Lenis from GSAP so there is one rAF for the whole page:

  ```ts
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
  ```

- Anything with its own scroll area gets `data-lenis-prevent`.
- Call `lenis.stop()` while the menu, preloader or a page transition is active, and `lenis.start()` afterwards.
- Under reduced motion, do not mount Lenis; native scroll takes over. Lenis 1.3 also honours `respectReducedMotion` (default `true`) as a second safety net.
- Feel check: one 100px wheel tick should move 44px at 200ms, 95px at 814ms and 100px at 1.6s [pv: motion §0].

**ScrollTrigger setup**
- `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Call `ScrollTrigger.refresh()`:
  - after `document.fonts.ready`
  - after the preloader exits
  - after any media slot swaps from placeholder to a real file (once, on `load`)
- Use `gsap.matchMedia()` with these contexts, so every effect is built and reverted per context:

  ```ts
  { isDesktop: "(min-width:1200px)",
    isTablet:  "(min-width:810px) and (max-width:1199.98px)",
    isPhone:   "(max-width:809.98px)",
    reduce:    "(prefers-reduced-motion: reduce)",
    fine:      "(hover:hover) and (pointer:fine)" }
  ```

- All GSAP code runs inside `useGSAP()` (from `@gsap/react`) with a `scope` ref, so it is cleaned up on unmount and route change.

**Hover gating:** Tailwind v4's `hover:` variant already applies only on `(hover:hover)` devices. JS hover effects (cursor, magnetic, previews, spotlight, card mouse-follow) mount only under `fine` **[taste: Motion, gate hover]**.

**Press feedback:** every pressable element gets `active:scale-[.97]` with `transition: transform 100ms var(--ease-out)` **[taste: Motion, press]**.

**Motion profile (`portvio` | `plus`):**
- `src/lib/motion-tokens.ts` exports `MOTION_PROFILE`, read from `process.env.NEXT_PUBLIC_MOTION_PROFILE` (default `plus`).
- In `portvio`, every upgrade that **replaces** a portvio motion falls back to portvio's exact baseline:
  - `<RevealText>` becomes a block `<Reveal text>` (y 30, `springReveal`, delay .2).
  - The hero intro runs only the wrapper column of §3.2.
  - Work, Impact and Experience keep their layouts but drop the scale-back, rail skew and tilt.
  - Preloader, page transitions, magnetic, cursor states, compact nav and the background system are off.
- Use it for side-by-side checks against the portvio recordings in `research/portvio/motion/videos/`. Ship `plus`.

**Back / Forward scroll restoration.** Portvio restores the previous scroll position on Back (measured 4934px [pv: motion §0]). Native restoration breaks here because Lenis, the pins and the 300svh spacers change the document height, so do it by hand:
- Set `history.scrollRestoration = 'manual'`.
- Before every navigation, write `sessionStorage['vg-scroll:' + location.pathname] = lenis.scroll` (inside try/catch).
- On a `popstate` arrival:
  1. Wait for `ScrollTrigger.refresh()` to finish.
  2. Call `lenis.scrollTo(saved, { immediate: true, force: true })`.
  3. Then run the 0.3s fade-in (§2.5 `<PageTransition>`).
- Appear animations above the restored position are set to their end state, using `ScrollTrigger.isInViewport` or `trigger.progress === 1`, so content above the fold never pops.

**No-flash rule:**
- A tiny inline script in `<head>` adds `html.js` before first paint.
- Initial hidden states are CSS rules scoped to `html.js` inside `@media (prefers-reduced-motion: no-preference)`. Example: `html.js [data-reveal]{opacity:0}`.
- Without JS, all content is visible. The hero headline is visible on first load **[sc: "the hero headline must already be visible"]**.

### 2.5 Primitive catalog

All primitives live in `src/components/motion/`. Each one accepts `className`, renders semantic HTML and has a reduced-motion branch (§6.3).

#### `<Reveal>`: block fade-up (portvio default)

```
props:   as='div', variant: 'text' | 'card' | 'card-tall' | 'from-left', delay: 0.2 | 0.3 | 0.4 (default 0.2)
from:    text      {autoAlpha:0, y:30}
         card      {autoAlpha:0, y:30, scale:0.8}
         card-tall {autoAlpha:0, y:60, scale:0.8}   // process cards; ease springCard, threshold 0
         from-left {autoAlpha:0, x:-50}             // about portrait
to:      {autoAlpha:1, x:0, y:0, scale:1, duration:1.207, ease:'springReveal', delay}
trigger: 50% visible (trigger rule), once
```

Portvio starts appear animations at opacity .001, not 0, so the elements stay paintable. `autoAlpha` keeps the element in layout.

#### `<RevealText mode="chars | words | lines">`: SplitText reveals

- Uses GSAP SplitText with `autoSplit: true` and `onSplit(self)`, which re-splits after fonts load and on resize and returns the tween. Other options: `aria: "auto"`, `mask: "lines"` for the lines and chars modes, and `linesClass: "rt-line"`.
- `.rt-line { padding-bottom: .14em; margin-bottom: -.14em }` keeps descenders from being clipped **[sc: line reveal]**.

| Mode | Split | From → to | Duration / ease | Stagger | Used for |
|---|---|---|---|---|---|
| `lines` | lines (masked) | yPercent 110 → 0 | 1.0s `mask` | `s.lines` .08 | All H2s, hero paragraph |
| `chars` | lines (masked) + chars | yPercent 110 → 0, rotateX −40° → 0 (`transform-origin: 50% 100%`, parent `perspective: 1000px`) | 1.2s `expo.out` | `s.chars` .02 (wordmark .035) | Wordmark, preloader name, contact title, giant footer name |
| `words` | words | autoAlpha 0 → 1, y 20 → 0 | 1.0s `springHero` | .05 | Eyebrows, short labels |

- Trigger: 50% visible, once.
- The eyebrow's sparkle rotates −90° → 0 over 1.0s `springHero` with the same trigger.

#### `<BlurText>`: per-word blur-in (portvio detail-page effect)

- Exact values [pv: motion §5]: each word goes from `{opacity:.001, filter:'blur(10px)', x:20}` to `{opacity:1, filter:'blur(0px)', x:0}`.
- Ease: spring d1 b0 (`springHero`, 1.007s), stagger 0.05s per word.
- Trigger: on mount (hero, case-study summary) or in view.
- Only for short text (≤ 40 words). Set `clearProps: "filter"` on complete.

#### `<ScrollFillText>`: word opacity scrub (U5)

- Split into words, then scrub with ScrollTrigger: `start: "top 85%"`, `end: "bottom 55%"`, `scrub: 0.7`.
- Word opacity goes from .18 to 1 in sequence. Each word's window is 1/n of the progress, eased with `smoothstep` inside the window **[sc: smoothstep]**.
- Accent spans are pre-coloured `#F65802` and go through the same opacity ramp.
- Only opacity is animated.

#### `<MaskReveal>`: image or clip reveal

- The outer box goes from `clip-path: inset(100% 0 0 0 round R)` to `inset(0 0 0 0 round R)`, and the inner media from `scale: 1.3` to 1.
- 1.4s `mask`, triggered at 50% visible, once.
- Variant `iris`: `circle(0% at 50% 50%)` → `circle(75% at 50% 50%)` **[sc: wipes]**.

#### `<ScrollZoom>`: scroll-scrubbed zoom (U11)

- The inner media goes from `scale: from` (default 1.2) to 1, scrubbed over `start: "top bottom"` → `end: "bottom top"` (or a given range) with `scrub: 0.7`.
- Ease: `x => dwell(x, 0.4)` (§2.1), so the zoom settles while the element is centred in the viewport **[sc: dwell]**. `dwell` keeps f(0)=0 and f(1)=1, so the start and end frames are unchanged.
- Optional parallax: `yPercent: -6 → 6`.
- The container needs `overflow:hidden`. On phone the zoom is halved (1.1 → 1).

#### `<ParallaxImage speed={0.1}>`: portvio speed-90 parallax

- Portvio: `translateY = +0.1 × scrollY`, with oversized images (125% / 280% tall) [pv: bundle §5.4, §5.8].
- Our element-relative version:
  - The image is `height: 120%; top: -10%`.
  - Scrub `yPercent: -8 → 8` over the element's time in the viewport (`top bottom` → `bottom top`).
  - That travels about 0.1 × (vh + h), which matches the feel.
- Off on phone (portvio also disables it on phone).

#### `<RollText>`: portvio per-letter 3D flip (exact)

[pv: interactions §2, bundle §5.14]

```
wrapper: display:inline-flex; overflow:hidden; perspective:1000px
inner (motion.div): position:relative; white-space:pre; line-height:1; padding-bottom:2px
  copy A (relative), copy B (absolute; top:0; left:0), both aria-hidden; the real text sits in an sr-only span
  each char: motion.span display:inline-block; transform-style:preserve-3d (spaces too, as U+00A0)
A: initial {y:0, rotateX:0, opacity:1}        hover {y:'-100%', rotateX:90, opacity:0}
B: initial {y:'100%', rotateX:-90, opacity:0} hover {y:0, rotateX:0, opacity:1}
per-char transition {duration: D, ease: [.42,0,.58,1]}; parent variants use staggerChildren: S
sizes: default D .2 / S .025 · size="lg" (menu links, card titles) D .3 / S .03
```

- The hover target is the whole link, or the closest `[data-roll-parent]` so that buttons and cards trigger it.
- Hover-out reverses, with letters again in forward order.
- It also triggers on `:focus-visible`.

#### `<SlotSwap>`: conveyor label or icon swap

Used for the Prev/Next pills, the hero glass arrow, the "Copy → Copied" label and counter digits [pv: interactions §3].
- **Vertical:** copy A goes y 0 → −30px (out of an `overflow:hidden` mask) while copy B comes from +30px → 0.
- **Horizontal (arrow):** A goes x 0 → +24px while B comes from −24px → 0.
- Glass background: `rgba(255,255,255,.2)` → `.3`.
- All on `springUI`.

#### `<PrimaryButton variant="orange | white | dark">`: portvio square-fill button

[pv: interactions §3, bundle §5.13]
- **Geometry:** height 60, `padding: 6px 24px 6px 6px`, gap 14, radius 6, `overflow:hidden`. Icon box 48×48 with radius 4 on the left, holding a 24px arrow (stroke 1.5). Label `ui` 18/500.
- **Colours:**

  | Variant | Background | Box | Arrow | Label |
  |---|---|---|---|---|
  | Orange | `#F65802` | `#FFFFFF` | `#0D0D0D` | `--color-accent-ink` |
  | White | `#FFF` | `#0D0D0D` | `#FFF` | `#0D0D0D` |
  | Dark (new, for orange grounds) | `#0D0D0D` | `#F65802` | `#0D0D0D` | `#FFF` |

- **Fill implementation (CSS only, compositor-friendly, exact geometry):**
  - The box is a full-size absolute layer with `clip-path: inset(6px calc(100% - 54px) 6px 6px round 4px)` at rest and `inset(2px round 4px)` on hover. This is portvio's measured end state: the box expands to `inset: 2px`.
  - Transition: `clip-path .63s var(--ease-spring-ui)`.
  - The arrow sits on its own layer and rotates 0 → −45° on the same curve.
  - The label colour switches to the box's contrast colour on the **same spring as the fill**: `color .63s var(--ease-spring-ui)`. Portvio measured 50% at 80–165ms and settled at 520–600ms [pv: interactions §3]. With the default `--color-accent-ink` (#0D0D0D) the orange variant's label is already dark and stays dark. With portvio's white labels (§1.2.1) it goes #FFF → #0D0D0D. White variant: #0D0D0D → #FFF.
  - DOM order (portvio): the arrow box (48×48, z 2) and the label (z 2) sit above the fill layer (z 1), so the arrow stays at the left inside the filled button. End state: `research/portvio/interactions/sheet_buttons.png`, frame `in600`.
  - The label also plays `<RollText>` as an upgrade.
- **Behaviour:**
  - Wrapped in `<Magnetic strength={0.3}>`.
  - Press: `scale(.97)`. Focus ring per §6.1. Disabled: `opacity:.5; pointer-events:none`.
- **Submit variant** (portvio's "Button 2"):
  - Full width, 54px tall, padding 16, centred label.
  - Hover: background → `--color-accent-85` over 0.2s `portvio`.
  - States: loading (20px spinner rotating 360° per second, linear), success ("Message sent"), error (background `--color-error-bg`, text `--color-error`).

#### `<Magnetic strength={0.3} max={10}>` (U14)

- Fine pointers only.
- On `pointermove` inside the element's rect plus a 24px halo, translate the element toward the pointer by `(pointer − centre) × strength`, clamped to ±`max` px **[sc: magnet 0.2–0.35]**.
- The inner label moves an extra 0.5× for a layered effect.
- Uses `gsap.quickTo(el, 'x'|'y', { duration: 0.4, ease: 'power3.out' })`. On leave it returns over 0.6s `power3.out`, with no elastic (portvio never bounces).
- Read the rect on `pointerenter` and on resize, never in `pointermove`.
- Applied to: primary buttons, the Menu trigger and pill, the accordion "+" buttons, the Prev/Next pills and the footer "Copy" button.

#### `<Tilt max={6}>` (U20)

scroll-craft's pointer tilt, ported exactly [sc: `scrollcraft.js` tilt]:
- Fine pointers only (`pointerType === 'mouse'`), desktop and tablet.
- Normalise the pointer to the element's centre: `nx = (x - cx) / (w/2)` and `ny = (y - cy) / (h/2)`. It is active while |nx| and |ny| are both under 1.6 (a halo); outside that the target is 0.
- Targets: `rotateX = clamp(ny, -1, 1) × -max` and `rotateY = clamp(nx, -1, 1) × max`. Use max 6° (scroll-craft's range is 5–9°).
- Each frame on `gsap.ticker`: `cur += (target - cur) × 0.09`. Write `transform: perspective(1100px) rotateX(..) rotateY(..)` on an inner wrapper, never on the element ScrollTrigger measures.
- Read the rect on `pointerenter`, on scroll end and on resize, never inside `pointermove` (§6.2 rule 7).
- Applied to: the Impact panels (§3.8) only. Work cards keep portvio's flat cover follow, so the deck's sticky geometry stays exact.

#### `<Marquee speed gap mask velocity reverse>`

- **Base** [pv: motion §1–2]:
  - Hero chips: 40px/s, gap 8, mask 10.36% / 88.29%.
  - Stack tiles: 50px/s, gap 6, mask 7.21% / 92.79%.
  - Linear, leftward and seamless: content is duplicated until it is at least 2× the container, and the duplicates are `aria-hidden`.
  - No hover slow-down (portvio).
- Runs on `gsap.ticker` with a wrapped x (`gsap.utils.wrap`) and permanent `will-change: transform` on the track.
- **Velocity (U7):**
  - Read the Lenis velocity, or `ScrollTrigger.getVelocity()`.
  - Speed multiplier = `1 + clamp(|v| / 1000, 0, 3)`, so up to 4×. `skewX` = `clamp(v / 300, -6, 6)` degrees.
  - Both are smoothed with `quickTo` (0.5s `power3.out`) and decay back to rest.
  - With `reverse`, scrolling up flips the direction.
- Pauses when off-screen (IntersectionObserver) or when the document is hidden.
- **Phone:**
  - The stack marquee keeps running. Portvio disables it, but it is our only stack overview on phone.
  - Velocity effects are off.

#### `<Counter to from={0} decimals prefix suffix duration={1.4}>` (U6)

- Counts with `gsap.to(obj, { val: to, duration: 1.4, ease: 'power2.out', snap: { val: 1 / 10 ** decimals } })` **[sc: count-ups, cubic ease-out `1-(1-t)^3`]**.
- Trigger: 50% visible, once. Inside the rail, use `containerAnimation`.
- Text uses `tabular-nums`. The box width is reserved with the final value (render it invisibly to size the box), so nothing shifts.
- Counting down (`from > to`) is supported, for latency (2000 → 50).
- SSR renders the final value; JS resets it to `from` just before the trigger. No-JS visitors and crawlers see the real numbers.

#### `<StackCards>` (U9)

See §3.7.

#### `<HorizontalRail>` (U10)

See §3.8.

#### `<PinnedZoom>` (portvio showreel)

See §3.10.

#### `<StickyHero>` + `<Curtain>` (portvio's signature transition)

See §3.2 and §3.3.

#### `<Cursor>` (U13)

Mounted once in the root layout, fine pointers only, `aria-hidden`.

**Base (portvio exact)** [pv: interactions §1.1]:
- A 14×14 `#FFF` circle, `border-radius: 100px`, `mix-blend-mode: difference`, `position: fixed; pointer-events: none; z-index: 60`.
- Follows the pointer with `springCursor` (stiffness 400, damping 60, mass 1).
- Offset +16 / +16 with bottom-centre alignment (`translate(-50%, 0)`). The native cursor stays visible.
- Starts at opacity 0 (portvio). It fades in on the first `pointermove` and fades out on `pointerleave` of `document.documentElement`, both as `opacity` on `springFade` (0.44s). Portvio's fade duration was not captured, so this value is **New**. On the first move the position is set without a spring, so the dot never flies in from (0, 0).

**Context states**, set by `data-cursor="view|open|copy|play|hide"` on the hovered element (the nearest ancestor wins):

| State | Visual | Where |
|---|---|---|
| `view` | Grows to an 88px circle, `#FFF`, `mix-blend-mode: normal`, label "View" in `micro` `#0D0D0D`. It centres on the pointer (offset animates 16 → 0), and the native cursor is hidden inside the element (`cursor: none`) | Work cards, next-project block |
| `open` | 64px circle, label "Open" (or "Close" when the row is open) | Expertise rows |
| `copy` | 64px circle, label "Copy", then "Copied" for 1.2s after a click | Footer and contact email |
| `play` | 88px circle, label "Play", normal blend | Showreel frame |
| `link` | Scales to 0.5 (7px); the native hand cursor carries the affordance | Any `a` or `button` without a state |
| `hide` | Opacity 0 | Form inputs, textareas |

- **Implementation:**
  - The element is always 88px, scaled down to 14/88 = 0.159 at rest, so size changes animate `scale` only, on `springUI`. It never scales from 0 **[taste: Motion, never `scale(0)`]**.
  - The label fades in over 0.15s `out` after the scale passes 70%.
  - x and y come from `motion`'s `useSpring` with exact stiffness and damping, plus a small external store, so a pointer move never triggers a React re-render.
- Hidden while the preloader or a page transition runs. Off under reduced motion.
- taste.md's refuse list bans custom cursors. We override that because the brief asks for mouse effects and portvio has a cursor (§8).

#### `<Preloader>` (U1)

- **When:** plays **once per session** (`sessionStorage['vg-loaded']`, wrapped in try/catch). Later navigations go straight to the hero intro, which starts at 0.3s (portvio's appear start).
- **Layout:** a fixed full-screen `#0A0A0A` panel, z 80, with grain.
  - Bottom-left: "VINUL GAJAMAN" in `h2`, revealed with `RevealText chars` (stagger .035).
  - Bottom-right: the counter in `display-counter`, `tabular-nums`, always three digits (`000`).
  - Under the counter: a 1px `#3C3C3C` track with an orange fill (`scaleX` = progress).
  - Top-left: "Software Engineer · Full-Stack & Mobile" in `small`, ink-soft. Top-right: "Colombo, Sri Lanka" in the same style.
- **Progress** follows real readiness: `document.fonts.ready` counts for 40%, and hero media decode (`img.decode()` or video `canplay`) for 60%.
  - The counter tweens toward the target with `quickTo` (0.6s `power3.out`).
  - It takes at least 1.4s and at most 3.0s (forced complete at 3.0s).
- **Exit timeline (about 1.2s):**
  1. The counter and the name go to yPercent −110 (masked) over 0.6s `mask`, stagger 0.05.
  2. At 0.35s, the panel lifts on a slant. Its clip-path goes from `polygon(0 0, 100% 0, 100% 100%, 0 calc(100% + 12.28vw))` to `polygon(0 0, 100% 0, 100% 0%, 0 calc(0% - 12.28vw))` over 0.9s `expoInOut`. The bottom edge stays at a constant 7°, left side higher (100vw × tan 7° = 12.28vw), echoing the curtain. Write the slant in `vw`, not %, because polygon percentages are relative to the element's height.
  3. At 0.55s, the hero intro (§3.2) starts, overlapping the lift.
- **Then:** `lenis.start()`, `ScrollTrigger.refresh()` and the cursor is enabled.
- **Reduced motion:** no preloader.

#### `<PageTransition>` + `<TransitionLink>` (U15)

A client provider in the root layout.

- **`<TransitionLink>`** wraps `next/link`. In `onNavigate(e)`, it calls `e.preventDefault()`, runs the cover, then calls `router.push(href, { scroll: false })`. `onNavigate` only fires for same-origin SPA navigations, not for modifier-key clicks or downloads (verified in the Next 16 `link.md`).
- **Cover (0.7s):**
  - Two full-screen panels: orange `#F65802` (z 70), then `#0A0A0A` (z 71) 0.08s later.
  - Each starts at `yPercent: 100, skewY: 7deg` and moves to `yPercent: 0, skewY: 0` with `expoInOut`. This is the hero curtain's slant.
  - The destination title (project name or "Home") appears centred on the dark panel in `h2`, with `RevealText chars`.
- **Swap:**
  1. `router.push`.
  2. `lenis.scrollTo(0, { immediate: true })`.
  3. Wait for `usePathname()` to change, then one rAF.
  4. `ScrollTrigger.refresh()`.
- **Reveal (0.7s):** the dark panel goes to `yPercent: -100, skewY: -7deg` with `expoInOut`, and the orange panel follows 0.06s later. The new page's intro (§4.2) starts 0.35s into the reveal.
- **Hash links to the home page from a detail page** (`/#work`): cover, push `/`, then `lenis.scrollTo('#work', { immediate: true })` before the reveal.
- **Browser Back / Forward:** no cover, only a 0.3s fade, and native scroll restoration.
- React's `<ViewTransition>` (available in Next 16) is **not** used, so there is only one transition system.
- **Reduced motion:** a 200ms opacity crossfade.

#### `<Accordion>` (expertise)

- FLIP via motion `layout` on `springLayout` (0.8s, bounce 0) [pv: bundle §5.6]. One row is open at a time, and all rows start closed (portvio).
- **"+" button:**
  - Closed: background `#F65802`, icon at 0°.
  - Open: background `#2F2E2D`, icon rotated 135° (reads as ×).
  - Transition: `springSnappy`.
- Open content fades in (opacity 0 → 1) on the same spring.
- Semantics: `button[aria-expanded][aria-controls]` and `region`.

#### `<MediaSlot id>`

The placeholder and media renderer. See §5.3.

#### `<LiveClock tz="Asia/Colombo">`

- Ticks every second with `Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', second: '2-digit' })` (portvio's format is "11:38:34 PM"), rendered with `tabular-nums`.
- SSR renders a fixed-width empty placeholder, so there is no hydration mismatch.

### 2.6 Section transition map (every boundary on the home page)

| Boundary | Transition | Source |
|---|---|---|
| Preloader → Hero | Panel lifts on a 7° slanted clip-path; hero intro overlaps from 0.55s | New (U1) |
| Hero → About | Hero pinned; scales 1 → 0.7 (origin 50% 50%), y 0 → −80, drift −0.1 × scrollY. Dark curtain skews 0 → 7° and rises 220px. Upgrades: radius 0 → 24px, a dim of 0 → .45 on the hero, and layered depth rates inside the hero (§3.2) | [pv: motion §2b] + New + [sc: layered parallax] |
| About → Tech Stack | Continuous canvas; header fade-up; marquee already running | [pv] |
| Tech Stack → Expertise | H2 masked line reveal; row list scales up from .8 | [pv] + U4 |
| Expertise → Process | Process header pins at 100px while cards pin at 240px and build a staircase; all release together | [pv: motion §2d] |
| Process → Work | Header divider draws (scaleX 0 → 1); stacking deck begins | U9 |
| Work → Impact | Last card dwells (40svh), then the rail stage pins and slides horizontally | U10 |
| Impact → Experience | Rail unpins after a 15% dwell; timeline line draws as the shell rises | U19 |
| Experience → Showreel | Frame grows from 0.2 inside a dark pinned stage; labels converge from ±83.33vw | [pv: bundle §5.10] |
| Showreel → Contact | Contact background enters with a 7° slanted clip-path that straightens, plus a scrubbed zoom | U11 + U12 |
| Contact → Footer | Footer layout reveals (y 30, scale .8 → 1); orange glow rises; giant name chars rise | [pv] + New |
| Page → page | Orange then dark skewed panels with the destination title | U15 |

### 2.7 Scroll budget (desktop 1440×900, approximate)

| Section | Height | Pinned scroll |
|---|---|---|
| Hero | 900 (sticky under everything) | Whole page |
| About | about 650 | n/a |
| Tech Stack | about 360 | n/a |
| Expertise | about 1,100 (closed rows) | n/a |
| Process | about 2,200 | Header and cards, about 1,880 |
| Work (6 cards) | 6 × (640 + 40) + 40svh ≈ 4,440 | About 3,800 |
| Impact | 100svh + travel (≈ 1,500) + 15% dwell ≈ 2,600 | About 1,700 |
| Experience + Education | about 1,700 | n/a |
| Showreel | 400svh = 3,600 | 2,700 |
| Contact | about 1,000 | n/a |
| Footer | about 700 | n/a |
| **Total** | **≈ 19,000px** (portvio: 14,606) | |

If the page feels long in review, cut the work stack to 4 pinned cards plus a "More projects" row of 2 compact cards. Do not shorten the pins below **1.2 screens each [sc: a pinned section needs at least 1.2 screens]**.

---

## 3. Information architecture and homepage spec

### 3.0 Site map and section order

```
/                      Home (single long page)
/work/[slug]           6 case studies (generateStaticParams + dynamicParams = false)
/_not-found            404 (app/not-found.tsx)
```

Homepage order, with the portvio section each one maps to:

| # | Section (anchor) | Portvio source | Vinul content |
|---|---|---|---|
| 0 | Preloader | (new) | Name + counter |
| 1 | Hero `#hero` | Hero (sticky) | Name wordmark, role, summary, stack chips |
| 2 | About `#about` | About + Overlap curtain | Statement, 2 stats, summary, CTA |
| 3 | Tech Stack `#stack` | Partners (logo ticker) | Technology logos |
| 4 | Expertise `#expertise` | Services (accordion) | 5 disciplines from the skills list |
| 5 | Process `#process` | Work Process (sticky staircase) | 4-step engineering process |
| 6 | Selected Work `#work` | Projects (zig-zag) | The 6 CV projects, as a stacking deck |
| 7 | Impact `#impact` | (new, horizontal) | 6 measured results from the CV |
| 8 | Experience `#experience` | Pricing (2-card shell) + new timeline | Coding Legends and DMS, plus education rows |
| 9 | Showreel `#showreel` | Demo (pinned zoom) | Video |
| 10 | Contact `#contact` | CTA (photo + glass form) | Form + direct links |
| 11 | Footer | Footer | Giant name, links, contact |

Dropped from portvio:
- **Pricing:** its shell is reused for Experience.
- **Testimonials:** the CV has no testimonials and we will not invent any **[taste: "Real names", "no invented statistics"]**. A Recommendations section built on portvio's testimonial slider spec can be added later, but only with real LinkedIn recommendations (§9).

**Menu links (6):** Home `#hero`, About `#about`, Expertise `#expertise`, Work `#work`, Experience `#experience`, Contact `#contact`. Detail pages link back with `/#anchor`.

**CTA labels, one per intent [taste: "One label per intent"]:**

| Intent | Label |
|---|---|
| Contact | **"Let's Talk"**, everywhere |
| Project | **"View Case Study"** |
| Form submit | **"Send Message"** |
| CV | **"Download CV"**, only if the file exists (§9) |

### 3.1 Navigation and menu (global, in the root layout)

**Top nav** [pv: structure §3.1]: `position: absolute` at the top, so it scrolls away like portvio's. 86px tall, `padding: 20px`, max-width 1440, centred, transparent, z 10.

- **Desktop row** (space-between):
  - **Left group**, gap 100 (tablet 80):
    - **Logo:** an SVG monogram. A 32px orange disc (#F65802) holding a `#0D0D0D` "V", plus "VINUL" in Clash 700 at 20px, white. Box 143×32. Links to `#hero`.
    - **Location block:** "Colombo, Sri Lanka" (16/400) over `<LiveClock>` (16/400).
    - **Email link:** a 6px white dot plus `puldithvinul@gmail.com` as `<RollText>` (16/400), `mailto:`.
  - **Right:** the **Menu trigger** (87×24). A hamburger of three bars (24×2 at y 4 / 11 / 18) plus the "Menu" label (18/500, `<RollText>`).
- **Phone:** 72px tall, `padding: 20px 16px`. Logo and Menu only.
- **Load:** y −40 → 0 with autoAlpha, `springHero`, 0.2s delay (part of the hero intro timeline).

**Compact nav pill (U16):**
- Fixed at top 16px / right 20px (phone: right 16px), z 20.
- A 48px pill: `rgba(13,13,13,.6)`, `backdrop-filter: blur(12px)`, 1px `#3C3C3C` border, radius 100, padding 0 18. It holds the hamburger and the "Menu" label.
- **Show/hide:**
  - Appears once `scrollY > 100vh`, sliding yPercent −150 → 0 over 0.6s `drawer`.
  - Hides on scroll down (delta > 8px) and shows on scroll up.
- Wrapped in `<Magnetic>`.
- A matching 40px orange "V" disc appears at top-left with the same behaviour and links to `#hero`.

**Menu overlay** [pv: bundle §5.15, interactions §6], built with motion `AnimatePresence`:

| Layer | Enter → exit | Transition |
|---|---|---|
| Backdrop: fixed inset 0, z 40, `rgba(0,0,0,.25)` + `backdrop-filter: blur(5px)`; a click closes the menu | opacity 0 → 1 → 0 | `springFade` |
| Panel: fixed right 0, z 41, width 45% desktop (648px at 1440) / 64% tablet / 100% phone, background `#0D0D0D`, `padding: 0 40px` (phone `0 20px`), content vertically centred, Wrapper column gap 80 | x 560, opacity 0 → x 0, opacity 1 → x 560, opacity 0, **from the right at every width**. Measured on the 390px frames (`research/portvio/interactions/mobile_menu/sheet_open.png`, frame `0050`, where the hero still shows at the left edge). `structure.md`'s "enters from the left" is wrong | `springUI` (done at about 615ms) |
| Links: Clash 54/700 at every width, 56px rows, gap 4, each inside `overflow:hidden` | y 100 → 0 → 100 (opacity stays 1; the mask does the reveal) | tween 0.8s `mask`, delay `min(i × 0.05, 0.15)`: 0 / .05 / .10 / .15 / .15 / .15 (portvio caps at .15, as its 4th and 5th links share .15) |
| Contact block: a row with gap 24. "Contact" column (email, phone) and "Socials" column (LinkedIn, GitHub). Columns 272px wide; labels 16px ink-soft with 16px below; items 16/400 `<RollText>`, 12px apart | Rides in with the panel | — |
| Trigger (raised to z 42 while open) | Bars morph to an X: top bar to the centre and −45°, middle bar opacity 0 and scaleX .04, bottom bar to the centre and +45°. Label rolls "Menu" → "Close" | `springSnappy` (measured: X done at about 410ms; back to the hamburger at about 490ms); `<RollText>` .2 / .025 |
| Close sequence | Panel x 0 → 560 with opacity 1 → 0 (`springUI`); backdrop fades (`springFade`, about 390ms); links return to y 100 behind the panel with the same delays; the overlay unmounts at about 1.0s | Measured [pv: interactions §6.1] |

- **Link hover:** `<RollText>` at `lg` timing (0.3s / 0.03s).
- **Upgrade U18:** sibling links dim to opacity .35 (0.18s `out`), and a 24px orange sparkle slides in before the hovered link (x −20 → 0, opacity 0 → 1, `springUI`).
- **Behaviour:**
  - Esc closes the menu. Focus is trapped in the panel and returns to the trigger on close.
  - `lenis.stop()` while open. Portvio does not lock scroll; we do.
  - Clicking a link closes the menu, then calls `lenis.scrollTo(anchor)` 0.35s later.
- **Reduced motion:** opacity only, no x or y.

### 3.2 Hero `#hero`

**Copy (from the CV):**
- **Wordmark:** "VINUL GAJAMAN" followed by the orange sparkle.
  - Semantics: `<h1>` wraps the visual wordmark (`aria-hidden`) plus an sr-only "Vinul Gajaman, Software Engineer (Full-Stack & Mobile)".
- **Tagline** (top-left, `ui` 18/500 Title Case, max 280px, with a 24px white pixel-cross icon). This is where the role is visible: **"Full-Stack & Mobile Software Engineer Building Real-Time Systems."**
- **Paragraph** (bottom-left, `lead` 20/500, max 540px): **"2+ years shipping full-stack, mobile and real-time systems across enterprise, IoT and Web3."** That is 14 words **[taste: subtext ≤ 20 words]**.
- **Chips** (bottom-right marquee): `NestJS` · `Next.js` · `React Native` · `Kotlin` · `Jetpack Compose` · `Spring Boot` · `TimescaleDB` · `Kubernetes` · `Socket.io` · `TypeScript`.
- **Thumbnail carousel "01/03":** `hero-thumb-01..03`.

**Layout**
- **`section#hero`:** `position: sticky; top: 0; height: 100svh; min-height: 640px; overflow: hidden; z-index: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 20px 50px` (phone `0 16px 50px`) [pv: bundle §4].
- **Background stack** (absolute, inset 0):
  - **L0:** `hero-bg-plate` (Vinul removed), or `hero-portrait` as a single layer if the plate is missing.
  - **L1:** wordmark, when layered.
  - **L2:** `hero-subject` (transparent cut-out of Vinul on the same canvas as the plate).
  - **L3:** text UI.
  - **Phone:** `hero-portrait-mobile` (9:16) as a single layer, with the wordmark on top.
  - **Optional:** a `hero-loop` cinemagraph replaces L0 once `canplaythrough` fires (0.8s crossfade). Desktop only, and never under data-saver.
  - **Layer gating** [sc: hero-depth, "load the required scene assets together"]:
    - Layered mode (L0 plate + L1 wordmark + L2 subject) switches on only when **both** `hero-bg-plate` and `hero-subject` exist and have both resolved `img.decode()`.
    - Until then, or if either fails, render the complete single-layer `hero-portrait` with the wordmark on top. Never show a plate without its subject, which would leave an empty hole.
    - The switch is a 0.4s opacity crossfade, and only ever happens before the intro starts. If decoding finishes after the intro has started, stay single-layer for that visit.
- **Legibility scrims**, as siblings (never children of the copy) **[taste: Text over media]**:
  - A corner gradient behind the tagline: `radial-gradient(60% 50% at 15% 25%, rgba(13,13,13,.45), transparent)`.
  - A bottom band: `linear-gradient(0deg, rgba(13,13,13,.55) 0%, transparent 38%)`.
  - Measure at least 4.5:1 for the paragraph on the real image.
- **Desktop positions:**
  - Tagline: absolute at `left: 240px; top: 260px; width: 280px`, with a gap of 20 between icon and text.
  - Carousel: absolute at `right: 240px; top: 260px`. It holds a 130×110 thumbnail window (radius 8), "01/03" (`small`) under it, and a 32×110 glass arrow tab to its right (gap 6; `--color-glass`, `blur(10px)`, radius 6).
- **Tablet:** tagline at `left: 100px`, carousel at `right: 100px`.
- **Phone:** a flow column.
  - Nav (72px), then the tagline (18px) at the top, then the thumbnail.
  - A flexible spacer.
  - Then the wordmark (2 lines), the paragraph (16px) and the chips.
  - Gaps 80 / 30 / 16.
- **Wordmark:** fitted per §1.3.1, on one line for desktop and tablet and two lines for phone. Line-height 0.82.
- **Bottom row** (30px under the wordmark):
  - Paragraph on the left.
  - Chips marquee on the right: max 550px; each chip uses portvio's `body` preset in white (Inter 16/400, line-height 1.6, −0.02em), padding 10, `--color-glass` with `backdrop-filter: blur(10px)`, radius 10, 45.6px tall (10 + 25.6 + 10); gap 8; mask 10.36% / 88.29%. It loops about every 700px (17.5s at 40px/s).

**Load timeline** (GSAP timeline `heroIntro`). It starts 0.55s into the preloader exit, or at 0.3s on later visits [pv: motion §1, upgraded per U3]:

Each element has two layers. The **wrapper** carries portvio's exact block motion: opacity .001 → 1 plus the listed offset [pv: motion §1, bundle §5.1]. The **inner** layer carries the upgrade. In the `portvio` profile (§2.4) only the wrapper column runs.

| t (s) | Element | Wrapper: portvio exact | Inner: upgrade (U2, U3) | Duration / ease |
|---|---|---|---|---|
| 0.00 | Background (L0 or single image) | scale 1.2 → 1, opacity .001 → 1 | — | 1.0 `portvio` (tween) |
| 0.00 | Subject cut-out (L2, layered mode only) | — | scale 1.12 → 1, yPercent 4 → 0 | 1.6 `expo.out` |
| 0.20 | Nav | y −40 → 0, opacity | — | 1.007 `springHero` |
| 0.40 | Wordmark | y 52 → 0, opacity | chars yPercent 110 → 0 inside a line mask, rotateX −40° → 0 | wrapper `springHero`; chars 1.2 `expo.out`, stagger .035 |
| 0.80 | Tagline block (icon + text) | x −40 → 0, opacity | icon rotate −90° → 0; text `<BlurText>` per word (blur 10 → 0, x 20 → 0) | `springHero`; words stagger .05 |
| 0.80 | Paragraph | y 40 → 0, opacity | masked lines yPercent 110 → 0 | wrapper `springHero`; lines 1.0 `mask`, stagger .08 |
| 1.20 | Thumbnail carousel + "01/03" | x 40 → 0, opacity | — | 1.007 `springHero` |
| 1.20 | Chips marquee | y 40 → 0, opacity (the marquee runs invisibly from t = 0) | — | 0.809 `springLayout` (portvio runs this one after hydration, not through the appear script) |

Portvio's measured settle points, from navigation commit with the appear script starting at about 300ms, are the targets for §6.4: background 1190ms, nav 1390ms, wordmark 1610ms, tagline and paragraph 1990ms, carousel 2420ms, chips 2810ms. Our intro settles at about 2.5s after its own start. Without JS, the tagline and paragraph are visible (the `html.js` gate).

**Idle and mouse**
- **Chips marquee:** 40px/s, with velocity (U7).
- **Carousel:**
  - Clicking the arrow tab slides the strip −130px (`springUI` on x), and the counter digits change with a vertical `<SlotSwap>`.
  - **Upgrade:** autoplay every 5s, with a 2px orange progress line under the thumbnail (scaleX 0 → 1 over 5s, linear). It pauses on hover, on focus, off-screen and under reduced motion.
  - Arrow-tab hover: horizontal `<SlotSwap>` plus glass .2 → .3 (portvio exact).
- **Mouse parallax (U2; fine pointer; desktop and tablet):**
  - The pointer is normalised to −1…1.
  - L0 moves ±10px, L2 ±22px, the wordmark ∓8px (the opposite direction opens the depth gap), and the tagline and carousel ±4px.
  - `quickTo` with 0.9s `power3.out`. scroll-craft's tilt smoothing of 0.09 per frame settles in about 0.9s **[sc: tilt smoothing 0.09]**.

**Scroll (the signature transition)** [pv: motion §2b, bundle §5.2]
- The hero stays sticky for the whole page. Every later section is `position: relative; z-index: 2; background: #0D0D0D`, so it slides over the hero.
- **Shrink:**
  - ScrollTrigger: `trigger: #about, start: "top bottom", end: "bottom bottom", scrub: 0.7`. On desktop the range equals About's height (about 630–650px); on phone it is about 1,130px.
  - Hero inner: `scale 1 → 0.7` and `y 0 → -80`, with `transform-origin: 50% 50%`. That is Framer's default; the origin was not captured, but the measured y values only fit a centred scale.
  - Linear in progress. Measured checkpoints at 1440×900 [pv: motion §2b]: scrollY 300 → scale .857, y −68 (including drift); scrollY 600 → .714, −136; from 650 on → .70, with y = −80 − 0.1 × scrollY.
  - **Upgrades:** the clipping wrapper's `clip-path: inset(0 round 0px)` goes to `inset(0 round 24px)`, and a sibling dim layer (`#0D0D0D`) goes from opacity 0 to .45.
- **Layered scroll depth (U2, layered mode only; every device including touch)** [sc: layered parallax hero; hero-depth, "distinct layers visibly move at different rates", "pointer response must not be the only way to experience the hero"]:
  - On the same shrink timeline, the layers inside the scaled hero get extra `y`, as a fraction of the hero's total upward travel T. T = 80 + 0.1 × D, where D is the shrink range (about 143px at D = 630).
  - Rates: L0 plate +0.31·T (lags most) and also scale 1 → 1.06; L1 wordmark +0.17·T; L2 subject +0.20·T; L3 text and carousel 0 (moves with the page).
  - Linear, `scrub: 0.7`. That opens a visible depth gap of about 20 to 45px between the plate, the subject and the copy while the hero shrinks.
  - Single-layer mode: the background image alone gets +0.31·T and scale 1 → 1.06.
  - Phone: the same rates, applied to `hero-portrait-mobile` alone.
- **Drift:** an extra `y = -0.1 × scrollY` for the whole page (portvio's parallax speed 110). Apply it to the outer wrapper with `gsap.quickSetter(outer, 'y', 'px')` from a ScrollTrigger `onUpdate`.
- **Performance:** once `#about`'s bottom is 100vh past the viewport top, set `visibility: hidden` on the hero and pause its marquee and video. Toggle back when scrolling up.
- **Reduced motion:** no scale, no drift and no dim animation. The hero stays sticky and the sections still slide over it.

### 3.3 About `#about`

**Copy**
- **Eyebrow:** "About Me" (orange 4-point sparkle, 24px, gap 10, `lead` white).
- **Statement** (`statement`, uppercase, accent span in `#F65802`): **"I ENGINEER <accent>REAL-TIME, MOBILE & WEB SYSTEMS</accent>, FROM AIRPORT ACCESS CONTROL TO MULTI-CHAIN CRYPTO WALLETS, BUILT TO BE FAST, SECURE AND READY FOR PRODUCTION."**
- **Stat row 1:** box **"2+"** (`number`, Counter 0 → 2 with suffix "+"); label "Years of Experience" (`ui`).
- **Stat row 2:** box **"5"** (Counter 0 → 5); label "Production Environments Maintained" (`ui`).
- **Muted paragraph** (`lead`, ink-soft): **"Experienced in NestJS, Spring Boot, React/Next.js, React Native and Kotlin/Jetpack Compose, with production work in REST APIs, microservices, Docker/Kubernetes and CI/CD."**
- **CTA:** `<PrimaryButton variant="orange">Let's Talk</PrimaryButton>` → `#contact`. Optional secondary: `<PrimaryButton variant="white">Download CV</PrimaryButton>`, shown only if `cv-pdf` exists (§5, §9).
- **Media:** `about-portrait`.

**Layout**
- **Section:** `padding: 40px 20px` (portvio), z 2, canvas background.
- **Desktop:** a row with gap 100, max-width 1440.
  - Left: image card 450×550, radius 16, overflow hidden. The image is 120% tall for parallax.
  - Right: a column about 850px wide: eyebrow → 20 → statement → 50 → stat rows → 40 → bottom row.
- **Stat row:**
  - A number box (background `#232222`, radius 10, padding `10px 12px`, about 118×63 with a 3-character value), the label (`ui`), and a hooked-arrow icon (24px, white, `rotate(90deg)` as in portvio [pv: bundle §5.4]) at the row's right end (about 390px).
  - The numbers are static in portvio [pv: motion §2e]. The `<Counter>` is upgrade U6.
  - Rows are 134px apart, each followed by a 1px gradient divider about 400px wide.
- **Bottom row:** paragraph (max 540) on the left and the button on the right; space-between, aligned to the end.
- **Tablet:** a column with gap 50; image 100% × 400px.
- **Phone:** a column with the text first and the image last (portvio's order); image 100% × 420px.
- **Curtain layer (`<Curtain>`):**
  - Geometry: an absolute child at `top: 0; left: 0; width: 100%; height: 834px` (tablet and phone `92svh`), background `#0D0D0D`, `z-index: 3`, `pointer-events: none`, `transform-origin: 50% 50%`.
  - Motion: ScrollTrigger `trigger: #about, start: "top bottom", end: "+=" + curtainHeight, scrub: 0.7` animates `skewY 0 → 7deg` and `y 0 → -220px` [pv: motion §2b, bundle §5.3].
  - Effect: positive skewY raises the left edge and lowers the right, so the dark sheet climbs over the shrinking hero with a slanted top edge. Reference: `research/portvio/motion/scroll-desktop/shots/scroll-00300.png`, where the edge falls from y 493 at the left to y 547 at the right.
  - Content sits above it at z 4.

**Scroll and hover animations**

| Element | Effect | Params |
|---|---|---|
| Portrait card | `<Reveal from-left>` (x −50) | delay .2 |
| Portrait image | `<ParallaxImage>` | speed .1; off on phone |
| Eyebrow | `<RevealText words>` + sparkle rotation | delay .2 |
| Statement | Block `<Reveal text>` (delay .3), then `<ScrollFillText>` (U5) | Fill from `top 85%` to `bottom 55%` |
| Stat rows | `<Reveal text>` (delays .3 / .4) + `<Counter>` 1.4s | Divider scaleX 0 → 1 from the left, 1.0s `mask` |
| Paragraph + CTA | `<Reveal text>` | delay .3 |
| Portrait hover (upgrade) | Inner image scale 1 → 1.04 | `springUI`; fine pointer only |

### 3.4 Tech Stack `#stack` (portvio Partners)

**Copy:**
- Header: eyebrow "Tech Stack" (left) · "Tools I Build With" in the centre (16/400) · hooked arrow (right).
- Tiles (20), in this order: NestJS, Spring Boot, Java, Next.js, React, React Native, Kotlin, Jetpack Compose, TypeScript, PostgreSQL, MySQL, TimescaleDB, MongoDB, Firebase, Docker, Kubernetes, Azure, GitHub Actions, OpenAI, Socket.io.

**Skills index (new; required).** The marquee is decorative and `aria-hidden` (§6.1), so the CV's complete skills list must also exist as real, readable text.
- Placement: under the marquee, 40px below, full container width.
- Markup: a `<dl>` in 7 groups using the CV's own headings. Columns: 4 on desktop, 2 on tablet, 1 on phone; column gap 20, row gap 30.
- Each group: a label (`body` ink-soft), 12px gap, then the items as one `lead` line per group, separated by " · ".
- Reveal: `<Reveal text>` per group, delays .2 / .3 / .4 repeating (portvio's sibling cadence).

| Group (CV heading) | Items (verbatim from the CV) |
|---|---|
| Languages | Java · TypeScript · JavaScript · Kotlin · SQL |
| Backend | NestJS · Spring Boot · Spring AI · REST APIs · Microservices · Socket.io · JWT/Passport |
| Frontend & Mobile | React.js · Next.js · React Native (Expo) · Jetpack Compose · Tailwind CSS · Material-UI |
| Databases | PostgreSQL · MySQL · TimescaleDB · MongoDB · SQLite/PowerSync · Firebase |
| Cloud & DevOps | Docker · Kubernetes · Azure AKS · GitHub Actions · Git · Bitbucket · JIRA |
| Web3 | ethers.js · Web3j · BitcoinJ · BDK · BIP39/32/44 · 1inch API |
| Generative AI | OpenAI API · Gemini API · RAG · Claude Code |

**Layout:**
- Section `padding: 60px 20px 40px`. Header row space-between, then a 32px gap.
- Marquee tiles:
  - Size: 280×200 desktop, 220×160 tablet, 160×120 phone.
  - Style: background `#232222`, radius 10, edge light.
  - Content: a centred white monochrome logo SVG, 40px tall (28px on phone), with the name below in 12px `small` ink-soft (an upgrade for recognition).
  - Gap 6. Mask 7.21% / 92.79%.
- **Missing logo:** if a logo file is absent, the tile shows the name in Clash 600 at 24px instead. It never shows a broken image.

**Animation:**
- Header: `<Reveal text>` with delay .2.
- Marquee: 50px/s with velocity skew (U7); no hover slow-down.
- **Tile hover (upgrade):** the logo goes from opacity .7 to 1 and from `#FFFFFF` to `#F65802` (via `currentColor`, 0.18s `out`), and the border goes from `#3C3C3C` to `rgba(246,88,2,.4)`.

**Media:** `logo-<tech>` SVGs (§5). Use Simple Icons (CC0) where available; otherwise use each vendor's official mono mark. Logos are not generated.

### 3.5 Expertise `#expertise` (portvio Services accordion)

**Header (split):** eyebrow "Expertise" · H2 "ENGINEERING / ACROSS THE STACK" · counter "5 Disciplines".

**Rows (copy from the CV's skills and experience):**

| # | Title (`statement`) | Description (`body`, ink-soft) | Bullets (`lead`, 10px orange dots) | Media |
|---|---|---|---|---|
| 01. | BACKEND & REAL-TIME SYSTEMS | APIs, gateways and services that hold persistent connections and answer in milliseconds. | NestJS & Spring Boot · REST APIs & Microservices · Socket.io & persistent TCP · JWT/Passport auth & fail-closed RBAC | `expertise-01` |
| 02. | MOBILE ENGINEERING | Native Android and cross-platform apps that talk to hardware and keep working without signal. | Kotlin & Jetpack Compose · React Native (Expo) · Hardware SDKs: UHF RFID, ML Kit · Offline-first sync with SQLite & PowerSync | `expertise-02` |
| 03. | WEB PLATFORMS | Responsive interfaces for live monitoring consoles and data-heavy products. | Next.js & React.js · TypeScript · Tailwind CSS & Material-UI · Filtering and pagination for 5,000+ record datasets | `expertise-03` |
| 04. | WEB3 & WALLET SECURITY | Non-custodial wallets where keys are derived and kept on the device. | ethers.js, Web3j, BitcoinJ, BDK · BIP39/32/44 key derivation · AES-GCM seed encryption via Android Keystore · 1inch swaps & staking APIs | `expertise-04` |
| 05. | CLOUD, DEVOPS & AI | Containerised services, automated pipelines and retrieval-augmented AI. | Docker & Kubernetes (Azure AKS) · GitHub Actions CI/CD · OpenAI, Gemini & Spring AI · RAG pipelines | `expertise-05` |

**Layout** [pv: structure §4.4, bundle §5.6]
- Column with gap 24.
- **Closed row:** 1400×160, `padding: 50px`, radius 16, 1px `#3C3C3C` border, transparent. Left: the number (in a 114px column) and the title. Right: a 60×60 round button.
- **Open row:** background `#232222`, padding 50, height 348 (the component's open height), row `justify-content: space-between; align-items: center`. Verified against `research/portvio/interactions/clicks/accordion_open_1200.png` and the component CSS (`framer-H1RmS`):
  - **Left block** (flex 1, max-width 520): a row with gap 60 holding the number (in a 54px column) and a column with `gap: 130px`. That column has the title at the top and the description (`body` ink-soft, `text-wrap: balance`) at the bottom.
  - **Right block** (flex 1, max-width 560, space-between):
    - A row with gap 50 holding the image (240×280, radius 12, `overflow: hidden`) and the bullet list (column, gap 10; each bullet is a 10×10 orange dot plus `lead` text, gap 10). The list is vertically centred against the image.
    - Then the button holder (`padding-top: 16px`), with the 60×60 button aligned to the top.
  - **Closed state:** the image and the bullet list collapse to `height: 1px; opacity: 0; overflow: hidden`, and the right block aligns to the end. Animate this with FLIP and opacity only (§0.3), never with height.
- **Phone** (portvio's phone variant: width 100%, column, gap 40, padding 24):
  - Rows have a `#232222` background at rest.
  - The number and title wrap with gaps of 30 (row) and 40 (column). The title column is at least 260px wide, with a 20px gap to the description.
  - Open content: image 100% wide (min 240) × 230px tall, then the bullet list (min width 288), wrapping with gap 40.

**Animation**

| Element | Effect | Params |
|---|---|---|
| Header | H2 `<RevealText lines>`, eyebrow words, counter `<Reveal>` | delay .2 |
| Row list | `<Reveal card>` (y 30, scale .8 → 1) | delay .3 (portvio's whole-panel reveal) |
| Row hover (closed) | Background transparent → `rgba(35,34,34,.7)`; the title plays `<RollText>` at `lg` timing | Colour on `springLayout` (about 500ms measured) |
| Click | `<Accordion>` open / close | `springLayout`; button on `springSnappy` |
| Cursor image preview (U8) | See below | `data-cursor="open"` |
| Spotlight | `<Spotlight>` on the list container | 28rem, 8% accent |

**Cursor image preview (U8):** desktop with a fine pointer, closed rows only.
- A single fixed 240×280 frame (radius 12) holding the row's image follows the pointer (`quickTo` on x/y, 0.6s `power3.out`).
- It rotates with horizontal velocity: `clamp(vx × 0.02, -8, 8)` degrees.
- **Enter:** `clip-path: inset(100% 0 0 0 round 12px)` → `inset(0 round 12px)` plus scale .85 → 1 (0.5s `expo.out`). **Leave:** reverses in 0.35s.
- Moving between rows crossfades the inner images (0.3s).
- Hidden while a row is open.

### 3.6 Process `#process` (portvio Work Process, sticky staircase)

**Header (centred, sticky):** eyebrow "Process" · H2 "FROM PROBLEM TO PRODUCTION".

**Cards** (process description; no numbers or claims):

| # | Title | Copy (`body`, white) |
|---|---|---|
| //01 | Understand & Model | I start with the domain: who uses it, what must never fail and where the data comes from. Then I model it before writing code. |
| //02 | Architect & Prototype | Contracts, schemas and a thin working slice first, so latency, security and offline behaviour are proven early. |
| //03 | Build & Integrate | Typed services, real hardware and third-party APIs wired together, with tests and CI from day one. |
| //04 | Ship & Support | Containerised releases, zero-downtime deploys and hands-on production support after launch. |

**Layout** [pv: motion §2d, bundle §5.7]
- **Desktop:**
  - The header is `position: sticky; top: 100px`.
  - The cards wrapper is about 1,880px tall and holds 4 rows. Each row is `position: sticky; top: 240px`, 1400 wide, with 4 equal columns (350px pitch).
  - Card *i* sits in column *i*, with empty spacers elsewhere; rows are 50px apart.
  - Cards 2 and 3 get `margin-top: 25px`, which gives portvio's uneven skyline.
  - As you scroll, cards pin left to right like stairs, then release together as one row.
- **Card** (about 350 × 397–487): background `#232222`, radius 12, 1px `#3C3C3C`, edge light.
  - **Top edge:** an orange tab bar 50×5 (radius 100) at left 26.
  - **Header:** 90px tall, `padding: 32px 26px`, bottom border. Contains "//01" (`body` ink-soft) and the title (`lead`).
  - **Inner panel:**
    - Inset 6, `#303030` gradient, radius 10, `padding: 26px 20px`, a column with `gap: 150px` (portvio [pv: bundle §5.7]).
    - Three 8px dots (`rgba(255,255,255,.2)`, gap 6) at the top.
    - A 120px glyph area (new), centred inside the 150px gap. The gap stays 150, so the card heights match portvio: 423 / 487 / 397 / 423.
    - The copy at the bottom.
- **Tablet and phone:** a plain vertical list, full width, gap 16, nothing sticky (portvio's phone behaviour).

**Animation**

| Element | Effect | Params |
|---|---|---|
| Header | `<RevealText lines>` + eyebrow | Trigger 50%, delay .2 |
| Card pop | `<Reveal card-tall>`: autoAlpha 0, y 60, scale .8 → 1 | **Threshold 0** (`start: "top bottom"`), `springCard` (k300 c100) |
| Tab bar (upgrade) | scaleX 0 → 1 from the left when the card pins (`start: "top top+=240"`) | 0.8s `mask` |
| Glyph (upgrade) | One 1.5px-stroke SVG line drawing per step: 01 a node graph, 02 a wireframe grid, 03 interlocking brackets, 04 a rising arrow with a cycle. Drawn with `stroke-dashoffset` 100% → 0 when the card pins | 1.2s `power3.out` |

Pinned cards are never scaled or dimmed (portvio). Reduced motion: no pin, opacity reveal only.

### 3.7 Selected Work `#work` (stacking deck, U9)

**Header (split):**
- Eyebrow "Selected Work" · H2 "SYSTEMS BUILT / FOR PRODUCTION" · counter "6 Projects".
- A 1px `#3C3C3C` divider under the header draws scaleX 0 → 1 over 1.0s `mask`.

**Projects** (order, slug, tags and card copy from the CV). This table is also the case-study data (§4).

| # | Slug | Title | Tags (3) | Card description (`body`, ≤ 30 words) | Year | Company |
|---|---|---|---|---|---|---|
| 01 | `aasl-access-control` | AASL Airport Access Control Platform | REAL-TIME · BACKEND · WEB | Real-time UHF RFID and facial-recognition access control for airport personnel, cutting scan-to-display latency from ~2s to ~50–200ms. | 2026 † | Coding Legends |
| 02 | `jova-wallet` | Jova Multi-Chain Crypto Wallet | WEB3 · ANDROID · BACKEND | Non-custodial wallet for Bitcoin and 7 EVM chains, with on-device key derivation and signing, salted PIN lockout and staking APIs. | 2026 † | Coding Legends |
| 03 | `offline-expense-platform` | Offline-First Construction Expense Platform | MOBILE · OFFLINE-FIRST · BACKEND | Local-first expense tracking for crews without coverage: instant offline writes, maker-checker approvals, and uploads cut from ~20 minutes to seconds. | 2026 † | Coding Legends |
| 04 | `uhf-rfid-scanner` | Android UHF RFID Handheld Scanner | ANDROID · HARDWARE · IOT | Native Android app reading UHF tag EPC data over serial in real time, with ML Kit QR ticket and member verification. | 2026 † | Coding Legends |
| 05 | `techsalary-lk` | TechSalary LK | CLOUD-NATIVE · KUBERNETES · CI/CD | Salary-transparency platform built as 7 containerised microservices on Azure AKS, with a BFF gateway and zero-downtime rolling deploys. | 2026 † | Independent † |
| 06 | `ai-chatbot-backend` | AI Chatbot Backend | AI · RAG · BACKEND | Spring AI chatbot using retrieval-augmented generation over a product PDF knowledge base, exposed through REST endpoints. | 2025 † | DMS Software Technologies |

† Not stated in the CV. These are placeholders for Vinul to confirm (§9). Store them in `src/content/projects.ts` with `tbc: true`. The year uses the `number` style, so it never fakes precision beyond what Vinul confirms.

**Card layout (desktop)**
- **Card:** an `<a>` (`<TransitionLink>`), 1400 × `min(640px, 100svh - 260px)`, background `#232222`, radius 16, 1px `#3C3C3C`, edge light, stack shadow (§1.5), `overflow: hidden`, `data-cursor="view"`, `data-roll-parent`.
- **Info column** (about 520px, `padding: 30px`, space-between):
  - **Top:** tag chips (16/600 uppercase, `padding: 8px 10px`, background `rgba(255,255,255,.1)`, radius 4, gap 6), with the year (`number`) at the far side.
  - **Middle:** the title in `h2` (Clash 48), then the description (`body`), then the company (`small` ink-soft).
  - **Bottom:** stack chips (`small`, 1px `#3C3C3C` border, radius 4 (portvio's tag radius; taste: "one corner-radius scale"), `padding: 6px 10px`) and `<PrimaryButton variant="white">View Case Study</PrimaryButton>`.
- **Image well:** the remaining width (about 840px), full card height, inset 6, inner radius 12.
- **Zig-zag DNA:** odd cards have the image on the right and even cards on the left, as portvio alternates sides.
- **Tablet:** image well on top (16:10) with the info below; card height auto; still sticky.
- **Phone:** a vertical list with a 4:3 image on top; no stacking.

**Stack mechanics** (desktop and tablet)
- **Wrapper:** `display: flex; flex-direction: column; gap: 40px; padding-bottom: 40svh`. The bottom padding lets the last card dwell.
- **Card *i*:** `position: sticky; top: calc(100px + i * 24px)`. The top 24px of each earlier card stays visible as a stacked edge.
- **Scale-back:** for each card *i* < 5, a ScrollTrigger animates card *i*'s inner wrapper as card *i+1* arrives:
  - Trigger: `trigger: card[i+1], start: "top bottom", end: "top " + (100 + (i + 1) * 24) + "px", scrub: 0.7`.
  - `scale 1 → 0.94` (`transform-origin: 50% 0`).
  - Its dim overlay (`#0D0D0D`) goes from opacity 0 to .55.
  - Its image goes from `scale 1.0` to 1.08.
  - Set `will-change: transform` only while the trigger is active.
- **Entry:** each card plays `<Reveal card>` (y 30, scale .8 → 1, `springReveal`, delay .2) the first time it crosses 50%.

**Hover (fine pointer)**

| Effect | Params |
|---|---|
| A second image (`work-<slug>-hover`, or the `work-<slug>-preview` video if present) crossfades in: opacity 0 → 1 and scale 1 → 1.1 | `springUI` [pv: interactions §4] |
| The cover image follows the mouse slightly: x/y ±12px, opposite to the pointer | `quickTo` 0.8s `power3.out` |
| Title `<RollText>` at `lg` timing | — |
| Cursor `view` state ("View") | — |
| Button square-fill, triggered from anywhere on the card | `springUI` |

- `<ParallaxImage>` on the cover (desktop and tablet only).
- Reduced motion: no sticky, no scale and no hover zoom; a simple list with opacity reveals.

### 3.8 Impact `#impact` (horizontal rail, U10)

**Header (split):** eyebrow "Impact" · H2 "MEASURED / IN PRODUCTION" · counter "6 Results".

**Panels** (every value comes from the CV):

| # | Number (`display-impact`, Counter) | Unit line (`lead`) | Label (`ui`) | Context (`body` ink-soft) |
|---|---|---|---|---|
| 1 | `~2s → 50ms` (counts **down** 2000 → 50; the "~2s →" prefix is static) | scan-to-display latency | Real-time RFID pipeline | AASL Access Control · Coding Legends. In-memory O(1) authorization engine and Socket.io gateway; ~50–200ms. |
| 2 | `35%` (0 → 35) | faster API responses | Query design and data handling | Tour Management System · DMS |
| 3 | `100k+` (0 → 100, suffix "k+") | records migrated | Two legacy systems, zero data loss | Ahead of schedule · DMS |
| 4 | `150+` (0 → 150) | concurrent users supported | Across five production environments | End-to-end support · DMS |
| 5 | `7 + 1` (0 → 7, then a static "+ 1") | chains in one wallet | 7 EVM chains plus Bitcoin | Jova Wallet · Coding Legends |
| 6 | `~20 min → secs` (counts down 20 → 0, then swaps to "secs" via `<SlotSwap>`) | photo-upload time | Head-of-line blocking bug fixed | Offline-first platform · Coding Legends |

**Layout**
- **Section height:** `100svh + travel + dwell`, where `travel = track.scrollWidth - innerWidth + 2 × gutter` and `dwell = 0.15 × travel`.
- **Stage:** `position: sticky; top: 0; height: 100svh`, a column of header (top, padding 100/20) → rail (flex row, gap 20, padding 0 20).
- **Panel:** 440×520 (tablet 380×460), background `#232222`, radius 16, 1px `#3C3C3C`, edge light, `padding: 30px`, space-between.
  - Top: the number, with a small orange sparkle at the top-right.
  - Bottom: unit line, label, a 1px divider, then context.
- **Progress track:** under the rail, a 2px `#3C3C3C` track with an orange fill (`scaleX = progress`).
- **Phone:** no pin. A one-column stack of the same panels (auto height, gap 16); counters trigger as they enter.

**Animation**
- **Rail:**

  ```js
  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth + 40),
    ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + (travel + dwell),
                     scrub: 0.7, invalidateOnRefresh: true }
  })
  ```

  The tween occupies the first 0.87 of the timeline (1:1 px mapping), then holds.
  - scroll-craft's rail rule is "one screen of scroll per item, plus one" **[sc: horizontal rail]**. With 3 panels visible at once, that would be 7 screens of dead-feeling scroll, so we use 1:1 travel plus a dwell (§8).
- **Panels:** each panel's `<Counter>` (1.4s `power2.out`) triggers with `containerAnimation: railTween, start: "left 75%"`. The panel also reveals: y 40 → 0, opacity .3 → 1, 1.007s `springHero`.
- **Tilt (U20):** each panel's inner wrapper has `<Tilt max={6}>` (perspective 1100px, lerp .09; §2.5) on fine pointers. It is off while the rail velocity is above 300px/s, so tilt and skew never stack.
- **Velocity skew** on the track: `skewX` = `clamp(v / 400, -4, 4)` degrees, smoothed over 0.5s.
- `<AmbientGlow>` behind the stage.

### 3.9 Experience `#experience` (portvio Pricing shell + timeline) and Education

**Header (centred):** eyebrow "Experience" · H2 "WHERE I'VE / BUILT IT".

**Timeline rail (U19, new):** a horizontal line above the shell, 960 wide.
- **Line:** a 1px `#3C3C3C` base with an orange overlay whose `scaleX` is scrubbed 0 → 1, with `transform-origin: 0 50%`.
  - Trigger: `trigger: shell, start: "top 80%", end: "top 30%", scrub: 0.7`.
- **Nodes:** three nodes at 0%, 50% and 100%.
  - Labels (`small`): "06/2024 · DMS Intern" · "11/2025 · Coding Legends" · "NOW".
  - Each node is a 10px ring: 1px `#3C3C3C`, filling with `#F65802` when the line passes it (0.3s `out`).
  - The "NOW" node pulses (scale 1 → 1.8, opacity .6 → 0, 1.6s loop; static under reduced motion).
- **Phone:** the rail turns vertical on the left of the stacked cards, with the same scrub.

**Shell** [pv: structure §4.7]: max 960, background `#232222`, radius 10, padding 12, 1px `#3C3C3C`. Two cards side by side. On phone they stack with Coding Legends first, so the current role leads.

| | Left card (transparent, padding 38) | Right card (highlighted: `#282727 → #303030` gradient, 1px `#3C3C3C`, radius 10) |
|---|---|---|
| Company (`lead`) | DMS Software Technologies (Pvt) Ltd | Coding Legends (Pvt) Ltd, plus a "Current" pill (`micro`, orange 1px border, radius 100, with a 6px pulsing orange dot) |
| Role (`body` ink-soft) | Software Engineer Intern · Tour Management System (Spring Boot · React.js · Docker · MySQL, microservices) | Junior Software Engineer |
| Dates (`number`) | 2024 – 2025 (sub-line in `small`: 06/2024 – 11/2025 · Colombo) | 2025 – NOW (sub-line: 11/2025 – Present · Colombo) |
| Label (`tag` ink-soft) | WHAT I DID: | WHAT I DID: |
| Bullets (`body` white, 6px white dots, gap 12) | Cut average API response time by 35% through efficient query design · Built 15 responsive Material-UI components with filtering and pagination for 5,000+ records · Shipped an OpenAI + RAG chatbot handling 100+ daily queries, cutting manual tickets by 50% · Containerised apps with Docker, cutting setup from hours to under 5 minutes · Led the migration of two legacy systems with 100,000+ records and zero data loss · Maintained five production environments for 150+ concurrent users | Real-time RFID and biometric access control for Airport and Aviation Sri Lanka; latency ~2s → ~50–200ms · Owned the RFID backend over persistent TCP to UHF readers, with fail-closed RBAC and a 3-tier TimescaleDB lifecycle · Native Android app for UHF RFID handhelds with the UHFRManager SDK and ML Kit QR · Non-custodial wallets for Bitcoin and 7 EVM chains with Android Keystore AES-GCM and biometric/PIN security · NestJS wallet backends: JWT/Passport from scratch, 1inch swaps, staking, unsigned-transaction building · Offline-first expense platform; fixed a head-of-line upload bug, ~20 minutes → seconds |
| Chips | Spring Boot · React.js · MySQL · Docker · OpenAI | NestJS · Next.js · Socket.io · TimescaleDB · Kotlin · React Native |
| Button | none | `<PrimaryButton variant="orange">Let's Talk</PrimaryButton>` |

**Education rows** (below the shell, after a 100px gap, full container width):
- A sub-header with the eyebrow "Education", then 2 rows. Rows are separated by gradient dividers (alternating direction) and have 30px padding.

| Left (`lead` white; institution in `body` ink-soft) | Right (`number`) |
|---|---|
| MSc in Advanced Software Engineering · Informatics Institute of Technology (IIT), Colombo · Awarded by University of Westminster, UK · Expected 09/2027 | 2025 – NOW |
| BSc (Hons) in Software Engineering · Java Institute for Advanced Technology, Sri Lanka · Awarded by Birmingham City University, UK | 2020 – 2024 |

**Animation**

| Element | Effect |
|---|---|
| Header | `<RevealText lines>`, delay .2 |
| Timeline | Line scrub + node fills (above) |
| Shell | `<Reveal card>` (scale .8), delay .3 |
| Bullets | Stagger in after the shell: y 12 → 0, autoAlpha, 0.6s `springUI`, stagger .05 |
| Card hover | `<Spotlight>` (8%) plus border → `rgba(255,255,255,.12)` (0.18s) |
| Education rows | `<Reveal text>`; divider scaleX 0 → 1 (1.0s `mask`); hover background → `rgba(35,34,34,.7)` (`springLayout`) with the degree on `<RollText>`; years count up on reveal |

### 3.10 Showreel `#showreel` (portvio Demo, pinned zoom)

**Copy and media:**
- Left label "SHOWREEL", right label "//2026©" (`h2`, `mix-blend-mode: hard-light`, z 2).
- Media: the `showreel` video and its poster. If the video is missing, `<MediaSlot>` renders the placeholder, which zooms exactly the same.

**Layout** [pv: bundle §5.10]
- A wrapper with a canvas background, z 2.
- Inside: a stage (`position: sticky; top: 0; height: 100svh`) followed by a 300svh spacer, so 400svh in total.
- The stage holds:
  - The video frame: absolute inset 0, radius 20, `overflow: hidden`, centred.
  - The video inside it: `object-fit: cover`, `filter: brightness(.7)`, `autoplay muted loop playsinline preload="metadata"`.
  - The two labels, vertically centred.

**Animation:** one scrubbed timeline with `trigger: wrapper, start: "top top", end: "bottom bottom", scrub: 0.7`. Portvio's range is exactly 2,700px (300vh) at a 900px viewport, linear over the whole range [pv: motion §2b, bundle §5.10]. Measured slope: frame scale +0.000296 per px (0.244 / 0.422 / 0.6 / 0.778 / 0.956 at page scrollY 8400 / 9000 / 9600 / 10200 / 10800); labels ±0.444px per px [pv: motion §2b]. Our 0 → 0.85 mapping plus the dwell is a deliberate upgrade; the `portvio` profile maps 0 → 1 linearly.

| Property | Progress 0 → 0.85 |
|---|---|
| Frame `scale` | 0.2 → 1 |
| Video inner `scale` | 1.8 → 1 (counter-zoom; net 0.36 → 1) |
| "SHOWREEL" `x` | −83.33vw → 0 (−1200px at 1440) |
| "//2026©" `x` | +83.33vw → 0 |
| Frame radius (upgrade) | `clip-path: inset(0 round 20px)` → `inset(0 round 12px)` |

- **Upgrade:** the label chars play `<RevealText chars>` once at progress 0.1.
- Progress 0.85 → 1 holds (a dwell), so the labels rest at the centre before the stage releases.
- The video plays only while the stage is in view (IntersectionObserver). The cursor shows `play` over the frame.
- Portvio sets `pointer-events: none` on the whole stage. We keep that on the stage and the labels, but set `pointer-events: auto` on the frame only, so the `play` cursor state can fire. A click on the frame toggles play and pause, and the frame is a `button` with `aria-label="Play showreel"` or "Pause showreel".
- **Phone:** the same effect (portvio keeps it) with a 300svh spacer.
- **Reduced motion:** no pin. The frame is static at full size (radius 20), the labels sit statically above and below it, and the video does not autoplay (poster plus a native-controls play button).

### 3.11 Contact `#contact` (portvio CTA)

**Copy**
- **Glass card:** eyebrow "Contact" · title **"LET'S TALK"** (`statement`) · sub-line (`body`, white at 80%): **"Have a project, a role or a hard engineering problem? Send a message and I'll reply by email."**
- **Form fields** (labels 16/500):
  - First Name / Last Name (two columns), Email Address, Message (textarea, 4 rows).
  - Placeholders: "Vinul", "Gajaman", "you@company.com", "Tell me about it".
  - Submit: **"Send Message"**.
- **Direct links** under the form (a row with gap 24, `<RollText>` 16/400):
  - `puldithvinul@gmail.com`, with `data-cursor="copy"`. A click copies the address and swaps the label to "Copied" via `<SlotSwap>`.
  - `+94 71 033 4443` (`tel:+94710334443`).
  - `LinkedIn` → https://linkedin.com/in/vinul-gajaman-a788a92b8
  - `GitHub` → https://github.com/VinulGajaman

**Layout** [pv: structure §4.10]
- **Section:** padding-bottom 140 (tablet 100, phone 80).
- **Container:** 1440 × about 869 (at least 100svh on desktop), `padding: 380px 20px 50px` (300 top on tablet and phone), with the full-bleed `contact-bg` behind. On phone, `contact-bg-mobile` (4:5) sits on top and the card overlaps its lower half.
- **Glass card:** right-aligned (desktop x 820, width 600; tablet 70%; phone full width), `padding: 40px`, gap 30, radius 20, 1px `rgba(255,255,255,.3)` border.
  - **Contrast upgrade:** the background is `rgba(18,16,16,.38)` with `backdrop-filter: blur(20px) saturate(140%)` and an edge light, instead of portvio's white at 20%. That keeps white text at 4.5:1 or better over any photo region.
- **Inputs:** 54px, padding 16, background `rgba(255,255,255,.10)`, 1px `rgba(255,255,255,.3)` border, radius 6, placeholder `rgba(255,255,255,.65)`. Focus: `#F65802` border plus the ring (§6.1).
- **Submission** (static export, so no Server Actions):
  - POST JSON to `process.env.NEXT_PUBLIC_FORM_ENDPOINT` (Formspree or Web3Forms).
  - If it is unset, build a `mailto:puldithvinul@gmail.com?subject=…&body=…` link and open it.
  - Client-side validation, an `aria-live="polite"` status region, loading/success/error button states (§2.5) and a honeypot field.

**Animation**

| Element | Effect | Params |
|---|---|---|
| Slanted entry (U12) | The background container's clip-path is scrubbed from `polygon(0 0, 100% 12.28vw, 100% 100%, 0 100%)` to `polygon(0 0, 100% 0, 100% 100%, 0 100%)`: a 7° slant (left high, right low, the same direction as the hero curtain) that straightens | `trigger: section, start: "top bottom", end: "top 30%", scrub: 0.7` |
| Background zoom (U11) | `<ScrollZoom>` 1.18 → 1, plus yPercent −6 → 6 | Over the section's time in view |
| Glass card | `<Reveal card>` (y 30, scale .8 → 1) | delay .2. Portvio applies this reveal to the **whole photo container** (`framer-1ttxcj1`, measured 1152px wide = 1440 × 0.8 mid-reveal [pv: motion §2c]). The upgrade replaces the container scale with the U12 slant and moves the reveal to the card. The `portvio` profile restores the container reveal and drops U12 |
| Title | `<RevealText chars>` | stagger .02 |
| Fields | Stagger y 16 → 0, autoAlpha | 0.6s `springUI`, stagger .06 |
| Submit hover | Background → `accent-85` | 0.2s `portvio` |

### 3.12 Footer (global)

**Layout** [pv: structure §3.4]: `<footer>` with `padding: 0 20px`, max 1440, `overflow: hidden`. The orange glow (§1.2) rises from the bottom.
- **Top row, left:**
  - The logo (163×40: orange "V" disc plus the "VINUL GAJAMAN" wordmark), then 40px.
  - "Let's work together" (`body` ink-soft).
  - "Have a project or a role in mind? Let's build it." (`lead`, max 400), then 24px.
  - A copy-email field in portvio's newsletter geometry: 400×60, background `rgba(255,255,255,.1)`, radius 8, 1px `rgba(255,255,255,.3)` border, `padding: 6px 6px 6px 20px`. It shows `puldithvinul@gmail.com` and has an inset orange "Copy" button, 150px wide, whose label swaps to "Copied" via `<SlotSwap>` (`data-cursor="copy"`).
- **Top row, right:** three columns.
  - "Menu": Home, About, Work, Experience.
  - "Social": LinkedIn, GitHub.
  - "Location": "Colombo, Sri Lanka" plus `<LiveClock>`.
  - Labels 16px ink-soft; links 18/400 `<RollText>` at a 36px pitch; columns at x 752 / 966 / 1200 on desktop.
- **Second row:**
  - "Email" → `puldithvinul@gmail.com` and "Phone" → `+94 71 033 4443`.
  - Left side: "© 2026 Vinul Gajaman. Designed and built by Vinul." (`small`) plus a "Back to top" `<RollText>` link that calls `lenis.scrollTo(0)`.
- **Bottom:** the giant **"VINUL GAJAMAN"** (`display-wordmark` at −0.03em, K = 8.80, §1.3.1).
  - Colour `rgba(255,255,255,.10)` with normal blending: portvio's footer SVG is `fill="#fff"` with `opacity=".1"` (`research/portvio/bundle/assets/footer-wordmark.svg`). The orange tint comes from the glow showing through it, so the glow (z 0) must sit **behind** the wordmark (z 2).
  - `pointer-events: none`, `aria-hidden`.
  - The full glyph height shows, with the baseline flush to the page bottom (no bottom padding). In `research/portvio/structure/shots/home-vp-17.png` the letters run from y 706 to the viewport bottom. Use `line-height: .82` and `margin-bottom: -.06em` to remove the descender space under the caps.
- **Tablet:** the columns wrap 2 + 1.
- **Phone:** everything stacks, and the giant name splits into two lines (K = 5.77). The footer is about 1,000px tall.

**Animation**

| Element | Effect |
|---|---|
| Layout | `<Reveal card>` (y 30, scale .8 → 1), delay .2 [pv] |
| Giant name | `<RevealText chars>` from yPercent 100 → 0, stagger .04, 1.4s `expo.out`, at 30% visible |
| Glow | Follows the cursor's x position (§1.6); breathes at idle |
| Links | `<RollText>` |

### 3.13 404 (`app/not-found.tsx`)

A centred stack on the canvas with about 130px of space above, followed by the footer:
- "PAGE NOT FOUND" (`h2`, 34px on phone, `<RevealText chars>`)
- "This page wandered off." (`lead`)
- "The page you're looking for doesn't exist, may have moved, or the URL might be wrong." (`body`, max 360)
- `<PrimaryButton>Back to Home</PrimaryButton>` (`<TransitionLink>` to `/`)

### 3.14 Deferred portvio components (spec kept, not built in v1)

These are measured and ready, but they have no real content yet. Do not build them with placeholder content **[taste: no invented content]**.

**Recommendations slider** (portvio Testimonials [pv: structure §4.9, bundle §5.11, interactions §5]). Build it only with real LinkedIn recommendations (§9 item 6). It would sit between Showreel and Contact.
- Section padding 100 / 20 / 140. Split header: eyebrow "Recommendations" · H2 · counter "N Recommendations".
- **Card:** 1400×560, background `#232222`, radius 16, 1px `#3C3C3C`, padding 20, row gap 60.
  - Image wrapper 524×520, radius 10.
  - Info column: space-between, `padding: 30px 30px 30px 0`.
    - Top: the quote in `statement` (uppercase).
    - Bottom: a 1px `rgba(255,255,255,.3)` top divider, then the name (`lead`) and role (`small` ink-soft) on the left.
- **Slider:** three cards absolutely offset by ±(width + 20px): ±1220 desktop, ±820 tablet, ±400 phone. Inactive cards are opacity 0. Prev/Next slides the active card to x 0 with opacity 1 on `springLayout` (0.8s). Measured: the outgoing card exits to x −1200, and the whole change takes about 650 to 800ms.
- **Prev/Next pills:** 690×74.6 each (gap 20), the same component as the case-study pills (§4.1), with the vertical `<SlotSwap>`.
- Reveals: header `<Reveal text>` at delay .2; slider `<Reveal card>` (y 30, scale .8) at delay .3.
- Drop portvio's 5 orange stars (22px, gap 4) and its "4.9/5.0" rating: they would be an invented statistic.

**Two-state toggle** (portvio Pricing Monthly/Annually [pv: interactions §5, bundle §5.9]). Keep it as a `ui/Toggle` primitive for any future binary switch:
- Track 44×24, 1px `#3C3C3C`, radius 100. Knob 16px orange, from `left: 4px` to `right: 4px` (20px travel) on `springToggle` (k500 c60; 50% at 91ms, 99% at 483ms).
- Labels (`small`) on either side cross-fade between #FFF (active) and #BDBDBD (inactive) over about 650ms (`springUI`).

---

## 4. Project detail pages `/work/[slug]`

- **Static generation:** `generateStaticParams()` returns the 6 slugs from `src/content/projects.ts`, with `export const dynamicParams = false`. Both are required for `output: 'export'`.
- **Params:** the page component receives `params` as a Promise. Check `generate-static-params.md` in the Next 16 docs for the exact signature before coding.
- **Metadata per page:** `title: "<Project> | Vinul Gajaman"`, description = the card description, OG image = `work-<slug>-banner`.

### 4.1 Template (mirrors portvio's case-study page [pv: structure §5, motion §5])

Section `padding: 180px 20px 140px` (tablet 160 top, phone 140 top). The container is a column with gap 50, max 1440. The top nav is the same as on home, over the canvas background.

1. **Title row** (space-between):
   - Left: the title in `h2` uppercase (max 1000).
   - Right: the summary paragraph (`body` ink-soft, max 400).
2. **Meta row:** 4 columns, space-between (2×2 on phone). Each is a label (`body` ink-soft) over a value (`lead` white). Columns: **Company · Role · Stack · Year**.
3. **Banner** (`work-<slug>-banner`): 1400 wide in a 1400×900 wrapper, about 1400×600 visible on load, radius 16.
4. **Article** (940 centred, paragraphs max 68ch):
   - H3s in `statement` (uppercase); body 16–17px / 1.6, ink-soft; about 50px between blocks.
   - Blocks: OVERVIEW · THE CHALLENGE · WHAT I BUILT (bulleted) · RESULTS (stat chips with Counters) · TECH STACK (chips).
5. **Gallery:**
   - A 2-up row: `work-<slug>-gallery-01` and `-02`, each 692 wide, 4:3 visible, radius 20, gap 16.
   - Then a full-width `work-<slug>-gallery-03`: 1400 wide, 2:1 visible, radius 20.
6. **Prev / Next pills** in portvio's Prev/Next geometry:
   - Two 690×75 pills with gap 20: background `#232222`, 1px `#3C3C3C`, radius 10, padding 24, chevron plus label.
   - Vertical `<SlotSwap>` on hover.
   - Labels "Previous Project" / "Next Project"; navigation wraps around.
7. **Next-project block (upgrade):** a full-width link, 60svh tall.
   - "NEXT PROJECT" (`micro`) over the next project's title in a fitted Clash wordmark.
   - **Hover:**
     - The next project's cover reveals behind the title (`clip-path: inset(50% 0 50% 0)` → `inset(0)`, 0.8s `expo.out`).
     - The title switches to `mix-blend-mode: difference`.
     - The cursor shows `view`.
   - Click → `<PageTransition>`.
8. Footer.

### 4.2 Animations

| Element | Effect | Params |
|---|---|---|
| Nav | y −40 → 0 | `springHero`, delay .2 [pv] |
| Title | x −30 → 0 with autoAlpha (portvio), **plus** `<RevealText chars>` (upgrade) | 1.007s `springHero`, delay .2; chars stagger .02 |
| Summary paragraph | `<BlurText>` per word, exactly as portvio does it | blur 10 → 0, x 20 → 0, stagger .05, starts at .48s |
| Meta columns | y 30 → 0, autoAlpha | delays .4 / .6 / .8 / 1.0 (portvio's 0.2s cascade) |
| Banner | `<MaskReveal>` (clip from the bottom, inner scale 1.3 → 1) at delay .8, then `<ScrollZoom>` 1.2 → 1 plus `<ParallaxImage>` while scrolling (U11) | 1.4s `mask` |
| Article blocks | `<Reveal text>` at 50%, once; H3s use `<RevealText lines>` | delay .2 (one block at .4) [pv] |
| Gallery images | `<MaskReveal>` + `<ParallaxImage>` (desktop) | — |
| Result chips | `<Counter>` | 1.4s |
| Prev/Next | `<SlotSwap>` on hover | `springUI` |

On arrival through `<PageTransition>`, this intro starts 0.35s into the reveal.

### 4.3 Case-study copy (from the CV; † = confirm with Vinul)

**`aasl-access-control`: AASL Airport Access Control Platform**
- **Meta:** Company: Coding Legends · Role: Backend & Web Engineer † · Stack: NestJS, Next.js, Socket.io, TimescaleDB · Year: 2026 †
- **Summary:** "A real-time access-control platform for airports, combining UHF RFID tracking and facial recognition to authorize personnel movement."
- **Overview:** Built for Airport and Aviation Sri Lanka (AASL). The platform authorizes personnel movement against an external permit authority, using UHF RFID tracking and facial recognition, and shows every scan on a live monitoring console.
- **The challenge:** UHF readers stream binary frames over persistent TCP connections. Every scan has to be authorized and reach the security console almost instantly. The system must survive restarts without losing state, and access must fail closed.
- **What I built:**
  - the RFID backend in NestJS over persistent TCP to UHF readers (binary protocol)
  - a Socket.io gateway for live updates
  - an in-memory O(1) authorization engine with full restart durability
  - movement detection from antenna pairings (in/out direction)
  - a 3-tier TimescaleDB data lifecycle
  - streaming CSV exports
  - fail-closed RBAC
  - a rebuilt live monitoring console in Next.js
- **Results:** scan-to-display latency cut from **~2s to ~50–200ms**.

**`jova-wallet`: Jova Multi-Chain Crypto Wallet (Android + Backend)**
- **Meta:** Coding Legends · Mobile & Backend Engineer † · Kotlin, Jetpack Compose, Web3j, NestJS · 2026 †
- **Summary:** "A non-custodial wallet for Bitcoin and 7 EVM chains, with keys derived and used only on the device."
- **Overview:** An Android wallet and its NestJS backend. Users hold their own keys: the app derives keys and signs on the device, and the backend serves token data, prices and staking.
- **The challenge:** keep seed phrases and private keys secure on a phone, support many chains from one seed, and keep price and chart data fast without a custodial server.
- **What I built:**
  - BIP39/32/44 key derivation
  - a salted PIN with progressive lockout
  - root detection
  - on-device EVM signing
  - AES-GCM seed encryption via Android Keystore, with biometric/PIN unlock
  - a backend with CoinGecko token-registry sync, cached price and OHLC chart pipelines, and staking APIs built from the contract ABI
  - from the experience section: JWT/Passport auth built from scratch, admin token and market management, a 1inch-powered swap service, and unsigned-transaction building for client-side signing
- **Results:** **Bitcoin + 7 EVM chains** in one non-custodial wallet, with Android (Kotlin) and iOS/Android (React Native) clients.

**`offline-expense-platform`: Offline-First Construction Expense Platform**
- **Meta:** Coding Legends · Full-Stack Engineer † · React Native (Expo), NestJS, PostgreSQL, PowerSync, SQLite · 2026 †
- **Summary:** "Local-first expense and bill tracking for construction teams working without reliable coverage."
- **Overview:** Every write commits instantly to local SQLite and syncs on reconnect via PowerSync. A server-side approval state machine enforces maker-checker controls on every money-moving action.
- **The challenge:** site crews often have no signal, but expenses, bills and photos still need to be recorded and approved safely. Photo uploads were taking far too long.
- **What I built:**
  - instant offline writes on SQLite
  - PowerSync sync on reconnect
  - a maker-checker approval state machine on the server
  - the diagnosis and fix of a head-of-line blocking bug in the photo-upload queue
- **Results:** photo uploads cut from **~20 minutes to seconds**.

**`uhf-rfid-scanner`: Android UHF RFID Handheld Scanner**
- **Meta:** Coding Legends · Android Engineer † · Kotlin, Jetpack Compose, Retrofit, ML Kit · 2026 †
- **Summary:** "A native Android app for handheld UHF RFID devices, built for AASL."
- **Overview:** The app interfaces with the UHFRManager hardware SDK over a serial port to read tag EPC data in real time, uploads scans to a REST API, and verifies tickets and members through ML Kit QR scanning.
- **The challenge:** talk to scanner hardware directly, read tags continuously without dropping scans, and verify people in the field.
- **What I built:**
  - UHFRManager SDK integration over serial
  - real-time EPC reads
  - scan upload to a REST API
  - ML Kit QR ticket and member verification
  - JWT authentication with token refresh
  - configurable backend URLs
- **Results:** real-time ticket and member verification on handheld devices.

**`techsalary-lk`: TechSalary LK (Cloud-Native Salary Transparency Platform)**
- **Meta:** Independent † · Cloud & Backend Engineer † · Docker, Kubernetes (Azure AKS), GitHub Actions, Jest · 2026 †
- **Summary:** "A salary-transparency web app built as 7 containerised microservices on Azure Kubernetes Service."
- **Overview:** A Backend-for-Frontend gateway handles JWT auth and routing in front of 7 services. A community approval workflow publishes submissions after 3 upvotes, and published submissions feed search and aggregate statistics.
- **The challenge:** run many small services reliably and deploy them without downtime.
- **What I built:**
  - 7 containerised microservices
  - a BFF gateway with JWT auth
  - the 3-upvote approval workflow
  - full CI/CD in GitHub Actions: parallel Jest tests, Docker builds to Azure Container Registry, and kubectl rolling updates
- **Results:** **zero-downtime** rolling deploys; **7** services on AKS.

**`ai-chatbot-backend`: AI Chatbot Backend**
- **Meta:** DMS Software Technologies · Software Engineer Intern · Spring AI, OpenAI API, RAG · 2025 †
- **Summary:** "A chatbot backend using Spring AI with retrieval-augmented generation over a product PDF knowledge base."
- **Overview:** REST endpoints expose domain-specific AI support, grounded in the company's own product documentation.
- **The challenge:** answer product questions accurately from internal documents instead of general model knowledge.
- **What I built:**
  - a Spring AI service
  - a RAG pipeline over a PDF knowledge base
  - REST endpoints for domain-specific support
- **Results:** at DMS, the deployed OpenAI + RAG chatbot handled **100+ daily queries** and cut manual support tickets by **50%**. This comes from the experience section; confirm it is the same system †.

---

## 5. Media placeholder inventory

### 5.1 Conventions

- **Flat path convention:** every file lives at `/public/media/<slot-id>.<ext>` and is served as `/media/<slot-id>.<ext>`.
  - Example: `/public/media/hero-portrait.jpg` → `/media/hero-portrait.jpg`.
  - Project slots embed the slug: `/public/media/work-aasl-access-control-cover.webp`.
- **Any common extension works.** The build resolves each slot id by checking extensions in this order:
  - Images: `.avif, .webp, .jpg, .jpeg, .png`
  - Video: `.mp4, .webm`
  - Logos: `.svg`
  - Posters: `<slot-id>-poster.<image ext>`

  So an image generator can drop `hero-portrait.jpg` or `hero-portrait.webp` and both work.
- **Registry:** `src/content/media.ts` lists every slot id with its kind, aspect, recommended pixel size and alt text. `src/lib/media.server.ts` scans `public/media/` once at build time (Server Components run during `next build`) and produces a map from id to resolved file. Rebuild after adding files.
- **Formats:**
  - Prefer `.webp` (quality 80–85) at the listed resolution. Keep masters outside `public/` (for example `media-src/`).
  - Cut-outs need alpha (`.webp` or `.png`).
  - Video: H.264 MP4 encoded with `-crf 23 -preset slow -movflags +faststart -an`, with a poster taken from the clip's **first frame** **[sc: poster = first frame]**.
  - Video budget: ≤ 6MB on desktop and ≤ 2.5MB for the 720p mobile version.
- **`next.config.ts`:** `images: { unoptimized: true }`, because the default image loader is unsupported in static export.
  - Use `<img>` with `width` and `height` set together, or neither plus a CSS aspect ratio **[taste: Text over media, "width and height come in pairs"]**.
  - `loading="lazy"` and `decoding="async"` everywhere except the hero, which uses `fetchpriority="high"` and a `<link rel="preload">` in `<head>`.
- **No text inside any generated image or video [taste: Refuse list]**. Every word on the page is real markup.

### 5.2 Slot table

R = required for a finished look. O = optional upgrade; the layout falls back gracefully without it.

| Slot id | Kind | Aspect | Recommended px | Used in | R/O | Composition brief (for the prompt) |
|---|---|---|---|---|---|---|
| `hero-portrait` | image | 16:9 | 3200×1800 | Hero single layer (desktop, tablet) | R | Side-profile silhouette of Vinul facing right, centre-right; #F65802 → crimson backdrop; strong rim light. Negative space top-left (tagline) and in the bottom 30% (wordmark) |
| `hero-portrait-mobile` | image | 9:16 | 1080×1920 | Hero on phone | R | Same look; head and shoulders in the upper middle; bottom 40% darker for the wordmark and copy |
| `hero-bg-plate` | image | 16:9 | 3200×1800 | Hero depth layer L0 | O | The same scene as `hero-portrait` with Vinul removed: clean gradient backdrop and light falloff |
| `hero-subject` | image, alpha | 16:9 | 3200×1800 | Hero depth layer L2 | O | Transparent cut-out of Vinul, aligned pixel-perfect to the plate |
| `hero-loop` | video | 16:9 | 1920×1080, 6–8s loop | Hero cinemagraph (desktop) | O | Locked camera; only the light breathes and a slight haze drifts. One slow continuous change; nothing enters or leaves the frame [sc] |
| `hero-thumb-01`, `-02`, `-03` | image | 6:5 | 520×440 | Hero carousel (130×110) | R | 01: front portrait on orange. 02: Vinul at a desk with a laptop, orange rim light. 03: Vinul holding a handheld scanner or phone |
| `about-portrait` | image | 2:3 | 1200×1800 | About card (450×550 visible, 120% tall for parallax) | R | Futuristic tech side portrait, orange monochrome, a glowing light strip across the eyes (portvio's visor mood). Subject within the middle 70% vertically |
| `expertise-01` … `-05` | image | 6:7 | 720×840 | Expertise open state + cursor preview | R | Dark still lifes lit by orange. 01: server rack with glowing cables. 02: hands holding a handheld RFID scanner. 03: abstract light-trail grid on glass. 04: a hardware key or phone with a lock glyph made of light. 05: container stacks with orange light beams. No readable text |
| `work-<slug>-cover` ×6 | image | 4:3 | 2400×1800 | Work card image well (about 840×628, 120% tall for parallax) | R | Preferred: real app screenshots composited into device mockups on an orange-lit dark set (real UI text is allowed). Otherwise a generated scene: airport security gate at night (aasl), a phone wallet with orange glow (jova), a construction-site tablet at dusk (offline), a handheld-scanner close-up (uhf), a cloud and container abstract (techsalary), a document-to-chat abstract (chatbot). Subject in the middle 70% |
| `work-<slug>-hover` ×6 | image | 4:3 | 2400×1800 | Work card hover crossfade | O | A UI close-up or alternate angle of the same project |
| `work-<slug>-preview` ×6 | video | 4:3 | 1600×1200, 4–6s loop | Replaces the hover image if present | O | A slow screen-recording pan of the real app |
| `work-<slug>-banner` ×6 | image | 14:9 | 2800×1800 | Case-study banner (scroll zoom) | R | Hero shot of the project; key subject in the middle 66% vertically |
| `work-<slug>-gallery-01`, `-02` ×6 | image | 5:4 | 1600×1280 | Case-study 2-up (4:3 visible plus parallax) | O | Screens, detail shots, hardware |
| `work-<slug>-gallery-03` ×6 | image | 7:4 | 2800×1600 | Case-study full width (2:1 visible) | O | A wide context shot |
| `showreel` | video | 16:9 | 1920×1080, 10–15s loop | Showreel pinned zoom | R | Vinul coding at night in a dark room lit by orange practical lights, plus app-demo B-roll. Slow continuous dolly; seamless loop (first frame = last frame) |
| `showreel-720` | video | 16:9 | 1280×720 | Phone / data-saver version | O | Same clip, re-encoded |
| `contact-bg` | image | 3:2 | 3000×2000 | Contact background (desktop, tablet; with zoom and parallax headroom) | R | Vinul's silhouette looking down, motion-blur double exposure, orange/red halo. Subject in the left 45%; the right 55% darker and calm for the glass form |
| `contact-bg-mobile` | image | 4:5 | 1080×1350 | Contact background (phone) | R | Same; subject in the upper 60% |
| `contact-loop` | video | 3:2 | 1920×1280, 6–8s | Contact cinemagraph | O | The ghosting drifts slowly; locked camera |
| `og-image` | image | 1.91:1 | 1200×630 | Open Graph / Twitter card | R | A crop of the hero portrait. The name is added in code or by hand, never generated |
| `logo-<tech>` ×20 | svg | — | 40px tall, white | Tech Stack marquee | R | Simple Icons or vendor marks, not generated. Ids: `logo-nestjs`, `logo-springboot`, `logo-java`, `logo-mysql`, `logo-nextjs`, `logo-react`, `logo-react-native`, `logo-kotlin`, `logo-jetpack-compose`, `logo-typescript`, `logo-postgresql`, `logo-timescaledb`, `logo-mongodb`, `logo-firebase`, `logo-docker`, `logo-kubernetes`, `logo-azure`, `logo-github-actions`, `logo-openai`, `logo-socketio` |
| `cv-pdf` | pdf | — | — | "Download CV" button (`/media/cv-pdf.pdf`) | O | **A version without the References section** (§9) |
| Brand marks | svg (code) | — | — | Logo, favicon, wordmark | — | Code-drawn orange disc + "V" monogram in `src/components/brand/`; `app/icon.svg`, `app/apple-icon.png` (180) |
| Grain | png | 1:1 | 256×256 | `<Grain>` overlay | R | Generated from `feTurbulence` at `/public/textures/grain.png` (not a media slot) |

**Shared style line for every photographic prompt.** Reuse it word for word and attach Vinul's reference photo every time **[sc: one style description, reused verbatim]**:

> *Cinematic editorial portrait photograph, monochrome orange-to-crimson colour grade (#F65802 fading to deep red #7A1200), subject in near-silhouette with a crisp warm rim light, shadows falling to near-black #0D0D0D, 85mm lens, shallow depth of field, subtle film grain, high contrast, minimal composition, no text, no letters, no logos, no watermark.*

Each prompt also states where the empty space for text goes (taken from the composition brief above) **[sc: say where the negative space goes]**.

### 5.3 `<MediaSlot>` placeholder behaviour

- **Props:** `id` (slot id), `className`, `sizes`, `priority`, `alt` (overrides the registry), `rounded` (radius token), plus the motion wrapper the section passes in.
- **When the file exists:** render `<img>` or `<video>` with the registry's alt text, aspect ratio and radius.
- **When it is missing:** render the placeholder in exactly the same box, so nothing shifts when the real file arrives.
  - **Ground:** `#161515`, the slot's radius, a 1px `#3C3C3C` inset border and grain at .06.
  - **Shimmer:** a pseudo-element with `linear-gradient(100deg, transparent 35%, rgba(246,88,2,.10) 50%, transparent 65%)`, 60% wide, animated `translateX(-100%) → translateX(260%)` over 2.2s `ease-in-out`, infinite, with 0.6s between passes. Transform only.
  - **Ambient:** a soft orange radial (`rgba(246,88,2,.06)`) breathing between scale 1 and 1.15 over 6s.
  - **Corner crop marks:** four 12px L-shapes, 1px `rgba(255,255,255,.18)`, inset 12px.
  - **Label**, centred and stacked:
    - the slot id in `micro` (#BDBDBD)
    - `4:3 · 2400×1800` in 12px `#999`
    - the expected path `/media/<slot-id>.(webp|jpg|png)` in 11px `#8A8A8A` (4.6:1 on the ground)

    Video slots add a 28px outlined play triangle above the label.
  - Labels show unless `NEXT_PUBLIC_SHOW_SLOT_LABELS === 'false'` (default on until launch). With labels off, only the ground, shimmer and grain show.
  - **Reduced motion:** no shimmer and no breathing.
  - **Semantics:** `role="img"` with `aria-label="Image coming soon"`.
- **Swap:** when a real image loads, the slot calls `ScrollTrigger.refresh()` once.

---

## 6. Accessibility, performance and reduced motion

### 6.1 Accessibility

- **Semantics:**
  - One `<h1>` per page: on home, the wordmark plus the sr-only name and role; on detail pages, the project title.
  - Sections are `<section aria-labelledby>`. The nav is `<nav aria-label="Primary">`.
  - The menu is a `dialog` with `aria-modal="true"`, labelled "Menu".
- **Skip link:** "Skip to content" is the first focusable element. It appears on focus as an orange pill at the top left, z 90.
- **Focus-visible:**
  - `outline: 2px solid #F65802; outline-offset: 3px; border-radius: inherit` on every interactive element, including cards and `<RollText>` links **[taste: States]**.
  - Never remove an outline without this replacement.
  - Every hover effect also runs on `:focus-visible` (RollText, button fill, card image swap).
- **Keyboard:**
  - The menu traps focus; Esc closes it and focus returns to the trigger.
  - The accordion uses `button[aria-expanded]`.
  - The carousel arrow is a `button` with `aria-label="Next image"`, and the counter is `aria-live="polite"`.
  - Marquees are not focusable (duplicates are `aria-hidden`). The full stack list is written out as real text in the Skills index (§3.4), which covers every skill in the CV.
- **Split text:** SplitText's `aria: "auto"` keeps an `aria-label` on the parent and hides the pieces. `<RollText>` renders the real label in an sr-only span and marks both visual copies `aria-hidden`.
- **Decorative layers** (cursor, grain, glow, spotlight, curtain, transition panels) are `aria-hidden` and `pointer-events: none`.
- **Contrast** (computed, §1.2):

  | Pair | Ratio |
  |---|---|
  | Body ink-soft on canvas | 10.3:1 |
  | Tertiary text on canvas | 6.8:1 |
  | Accent text on canvas | 5.9:1 |
  | Labels on orange (accent-ink) | 5.9:1 |
  | White on the contact glass card | ≥ 4.5:1 (verify on the real photo) |
  | Placeholder labels | ≥ 4.6:1 |
- **Pausing motion:** auto-moving content (marquees, carousel autoplay, cinemagraphs) stops under reduced motion and when off-screen, and the carousel also pauses on hover and focus. That covers WCAG 2.2.2 for the carousel, the only moving content that is not decorative.
- **Forms:** visible labels, `autocomplete` attributes, inline errors linked through `aria-describedby`, and an `aria-live="polite"` status region.
- **Language and metadata:**
  - `<html lang="en">`.
  - Title: "Vinul Gajaman | Software Engineer, Full-Stack & Mobile". Description: the first sentence of the CV summary.
  - JSON-LD `Person`: name, jobTitle, address Colombo LK, email, `sameAs` LinkedIn and GitHub, `alumniOf` both universities.
  - `app/sitemap.ts` and `app/robots.ts` are static metadata routes.
- **Privacy:** the CV's References section must not appear anywhere: not on the site, not in metadata, not in a downloadable PDF.

### 6.2 Performance budget

| Metric | Budget (mobile, Moto G Power class, 4G) |
|---|---|
| LCP | ≤ 2.5s. The hero image is preloaded: ≤ 220KB on phone, ≤ 380KB on desktop |
| CLS | ≤ 0.05: fixed media aspect ratios, font fallback metrics, counters sized to their final value |
| INP | ≤ 200ms |
| TBT | ≤ 200ms |
| First-load JS (gzip) | ≤ 200KB in total (see the breakdown below) |
| Fonts | 2 Clash files (about 30KB each) and 4 Inter latin weights (about 24KB each). Preload Clash 700 and Inter 400/500 only |
| Lighthouse | Performance ≥ 90 mobile / ≥ 98 desktop · Accessibility 100 · Best Practices 100 · SEO 100 |
| Frame rate | No long frames over 50ms during scroll on a 2019 MacBook Air or a Pixel 6; 60fps in scrubbed sections |

First-load JS breakdown:

| Package | Approx. gzip |
|---|---|
| React + Next | 95KB |
| GSAP core | 27KB |
| ScrollTrigger | 18KB |
| SplitText | 7KB |
| CustomEase | 2KB |
| Lenis | 5KB |
| motion (`LazyMotion` + `domMax` + `m.*`) | 25KB |
| App code | 20KB |

**Rules:**
1. **Compositor only:** animate transform, opacity and clip-path.
   - `filter` is allowed only on `<BlurText>` words (≤ 40 nodes, cleared to `filter: none` after the tween) and on static layers.
   - `backdrop-filter` only on the menu backdrop, the hero glass chips and arrow tab, the compact nav pill and the contact card.
2. **will-change hygiene:**
   - Never set it globally in CSS.
   - GSAP uses `force3D` during tweens.
   - ScrollTrigger-driven elements get `will-change: transform` in `onToggle(self.isActive)` and lose it when inactive.
   - Permanent `will-change` only on the cursor and marquee tracks.
3. **One rAF:** `gsap.ticker` drives Lenis, the marquees, magnetic effects, previews and parallax. `motion` drives only its own hover and layout springs.
4. **Off-screen work stops:** IntersectionObserver pauses marquees, the carousel, videos and glow loops. The hero gets `visibility: hidden` once it is covered (§3.2).
5. **Media:**
   - Only the hero image loads eagerly. Videos use `preload="metadata"` and play or pause with visibility.
   - The 720p showreel is chosen when `(max-width: 809px)` matches or `navigator.connection.saveData` is true. No video autoplays under data-saver.
6. **Split once, refresh rarely:** SplitText `autoSplit` (it debounces resize). Call `ScrollTrigger.refresh()` only on the events in §2.4.
7. **No layout thrash:** read rects on `pointerenter` and resize, never in `pointermove`.
8. **No `content-visibility: auto` on pinned or sticky sections;** it breaks measurement.
9. **Dynamic imports:** load the work deck, impact rail and showreel code with `next/dynamic` (`ssr: true`) so the hero JS stays small.

### 6.3 Reduced motion (`prefers-reduced-motion: reduce`)

Fewer and gentler effects, not none. Keep the opacity that carries meaning and drop position changes **[taste: Motion]**.

| Feature | Reduced-motion behaviour |
|---|---|
| Lenis | Not mounted (native scroll) |
| Preloader | Skipped |
| Hero intro | Opacity fades only, 0.4s, staggered 0.1s; no scale or y. Mouse parallax off |
| Hero shrink, drift, curtain skew | Off. The hero stays sticky and sections still cover it as a plain scroll |
| `<Reveal>`, `<RevealText>`, `<BlurText>` | Opacity 0 → 1 over 0.4s `out`; no split, blur, y or scale |
| `<ScrollFillText>` | Text at full opacity |
| `<Counter>` | Final values rendered immediately |
| `<Marquee>` | A static row (wraps on phone); duplicates removed |
| `<ParallaxImage>`, `<ScrollZoom>`, `<MaskReveal>` | Static image at scale 1; `<MaskReveal>` becomes an opacity fade |
| Process staircase | No pin; a list with opacity reveals |
| Work stack | No sticky or scale; a list |
| Impact rail | A vertical grid of panels |
| Experience timeline | Line and nodes shown complete; no pulse |
| Showreel | No pin; static full-size frame; the video shows its poster and plays only on click |
| Contact slant and zoom | Off (rectangular, static) |
| Cursor, magnetic, spotlight, image preview, card mouse-follow, `<Tilt>` | Off (native cursor) |
| Hero layered scroll depth | Off (layers static) |
| `<RollText>` | A 0.15s opacity crossfade between the two copies; no rotation or translation |
| Buttons | The fill becomes a 0.15s colour crossfade; the arrow does not rotate |
| Menu | Opacity only, 0.2s |
| Page transition | 200ms opacity crossfade |
| Grain | Static (no jitter) |
| Glow fields, placeholder shimmer | Static |

Implement it with `gsap.matchMedia()` (the `reduce` context), `motion`'s `useReducedMotion()`, and CSS keyframes wrapped in `@media (prefers-reduced-motion: no-preference)`.

### 6.4 Verification (adapted from scroll-craft's verify step)

- **Playwright run** at 1440×900, 1024×768 and 390×844, with a screenshot every 300px of scroll. Fail on:
  - horizontal overflow (`document.documentElement.scrollWidth > innerWidth`)
  - dead scroll (two consecutive identical frames inside a pinned section)
  - a frozen showreel video
  - a missing media-slot box
- **Contrast:** measure on the rendered page for the hero paragraph, the contact card and the placeholder labels.
- **Compare against portvio frames:**
  - `research/portvio/motion/scroll-desktop/shots/scroll-00300.png` (curtain)
  - `scroll-03600.png` (staircase)
  - `research/portvio/structure/shots/home-vp-12.png` and `-13.png` (showreel mid-zoom and end)
  - `research/portvio/interactions/sheet_buttons.png` (button fill frames)
- **Timing check:** sample the hero intro per rAF and compare it with `research/portvio/motion/load-desktop/timeline.txt`. Expect nav settled at about 1.4s, wordmark at 1.6s and tagline at 2.0s, measured from intro start + 0.3s. Run it in the `portvio` profile (§2.4), where the wrapper motion must match within ±50ms.
- **Hero depth acceptance** [sc: hero-depth]: screenshot the hero at scroll 0, at mid-shrink (about 315px) and at the end of the shrink. Check that:
  - L0, L2 and the copy visibly move at different rates
  - there are no cut-out halos, no duplicate subject and no hole in the plate
  - the opening headline is readable
  - the phone composition is complete with motion off
- **Fidelity checklist:** walk Appendix A with the portvio frames open and tick each row only after comparing the rendered result.
- **Spring check:** sample the computed transform of one `<Reveal>`, one `<PrimaryButton>` fill and one process card. The 50% and 90% times must match §2.2 within ±1 frame.
- **Lighthouse:** mobile and desktop runs on the static export (`npx serve out`).

---

## 7. Engineering architecture

### 7.1 Dependencies

- **Installed:** `next@16.3.8`, `react@19.2.8`, `gsap@3.15.0`, `lenis@1.3.26`, `motion@14.0.0`, `clsx`, `tailwindcss@4.3`.
- **Add:** `@gsap/react` (for `useGSAP`). Nothing else: no three.js and no other animation libraries.
- **`next.config.ts`:** `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true`.
- **Replace the create-next-app defaults:**
  - Geist fonts in `layout.tsx` → Clash Display and Inter.
  - The light/dark `globals.css` → the dark-only tokens in §7.3.

### 7.2 Folder structure

```
src/
  app/
    layout.tsx            fonts, html.js script, <SmoothScroll>, <PageTransition>, <Cursor>, <Grain>, <Preloader>, Nav, Menu, Footer
    page.tsx              homepage sections in order
    work/[slug]/page.tsx  case study (generateStaticParams, dynamicParams = false)
    not-found.tsx
    icon.svg, apple-icon.png, sitemap.ts, robots.ts
    globals.css           @import "tailwindcss"; @theme tokens; base; keyframes
  fonts/                  ClashDisplay-600.woff2, ClashDisplay-700.woff2
  content/
    site.ts               name, role, contact, socials, nav, hero/about copy, stats
    projects.ts           6 projects (card + case-study fields; tbc flags)
    experience.ts         2 roles, timeline nodes, education
    expertise.ts, process.ts, impact.ts, stack.ts
    media.ts              slot registry (§5.2)
  lib/
    gsap.ts               'use client'; registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP); ease tokens; springEase()
    motion-tokens.ts      springs, durations, staggers (§2)
    media.server.ts       scans public/media at build; id → file map
    useMediaQueries.ts, usePointerFine.ts, useReducedMotion re-export
  components/
    motion/               Reveal, RevealText, BlurText, ScrollFillText, MaskReveal, ScrollZoom, ParallaxImage,
                          RollText, SlotSwap, Magnetic, Tilt, Marquee, Counter, StackCards, HorizontalRail,
                          PinnedZoom, StickyHero, Curtain, Cursor, Preloader, PageTransition, TransitionLink,
                          Grain, AmbientGlow, Spotlight, ScrollProgress
    ui/                   PrimaryButton, SubmitButton, Tag, Chip, Eyebrow, SectionHeader, Divider, Accordion,
                          LiveClock, MediaSlot, Sparkle, ArrowIcon, Wordmark, Timeline, SkillsIndex, Toggle (deferred)
    layout/               Nav, CompactNav, Menu, Footer
    sections/             Hero, About, TechStack, Expertise, Process, Work, Impact, Experience, Showreel, Contact
    work/                 CaseHero, MetaRow, Article, Gallery, PrevNext, NextProject
public/
  media/                  flat: <slot-id>.<ext> (§5)
  textures/grain.png
```

### 7.3 Tailwind v4 theme (paste into `globals.css`)

```css
@import "tailwindcss";

@theme {
  --breakpoint-*: initial;
  --breakpoint-md: 50.625rem;   /* 810px  tablet  */
  --breakpoint-lg: 75rem;       /* 1200px desktop */

  --color-canvas: #0D0D0D;      --color-canvas-deep: #0A0A0A;  --color-placeholder: #161515;
  --color-surface: #232222;     --color-surface-70: rgb(35 34 34 / .7);
  --color-surface-2: #282727;   --color-surface-3: #303030;    --color-surface-btn: #2F2E2D;
  --color-line: #3C3C3C;
  --color-ink: #FFFFFF;         --color-ink-soft: #BDBDBD;     --color-ink-faint: #999999;
  --color-accent: #F65802;      --color-accent-85: rgb(246 88 2 / .85);  --color-accent-ink: #0D0D0D;
  --color-glass: rgb(255 255 255 / .2);  --color-glass-hover: rgb(255 255 255 / .3);
  --color-tag: rgb(255 255 255 / .1);    --color-faint: rgb(255 255 255 / .05);
  --color-backdrop: rgb(0 0 0 / .25);
  --color-error: #FF2244;       --color-error-bg: rgb(255 34 68 / .15);

  --font-display: var(--font-clash), "Clash Display", Arial, sans-serif;
  --font-sans: var(--font-inter), Inter, Arial, sans-serif;

  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 10px;
  --radius-xl: 12px; --radius-2xl: 16px; --radius-3xl: 20px; --radius-pill: 100px;

  --ease-portvio: cubic-bezier(.44,0,.56,1);
  --ease-mask: cubic-bezier(.645,.045,.355,1);
  --ease-roll: cubic-bezier(.42,0,.58,1);
  --ease-out: cubic-bezier(.23,1,.32,1);
  --ease-drawer: cubic-bezier(.32,.72,0,1);
  --ease-expo-in-out: cubic-bezier(.87,0,.13,1);
  --ease-spring-ui: linear(0, .0686, .2069, .3534, .4894, .6058, .704, .7782, .8355, .879, .9127, .9365, .9541, .9669, .9766, .9832, .988, .9915, .994, .9957, .997, .9979, .9985, .9989, 1);
  --ease-spring-layout: linear(0, .0647, .189, .3327, .4685, .5863, .6809, .759, .8198, .8653, .9008, .9274, .9471, .9613, .972, .9799, .9854, .9895, .9925, .9946, .9962, .9973, .9981, .9986, 1);
  --ease-spring-fade: linear(0, .0767, .226, .3777, .5225, .6369, .7328, .8027, .8557, .8971, .9258, .9477, .9626, .9734, .9815, .9869, .9909, .9936, .9956, .9969, .9978, .9985, .9989, .9993, 1);
  /* hero, reveal, snappy, card: copy from §2.1 when needed */
}

:root { --gutter: 16px; color-scheme: dark; }
@media (min-width: 810px) { :root { --gutter: 20px; } }
html { background: var(--color-canvas); }
body { background: var(--color-canvas); color: var(--color-ink); font-family: var(--font-sans);
       -webkit-font-smoothing: antialiased; }
```

The site is dark-only by design, as portvio is. Keep `color-scheme: dark` and do not add a light theme.

### 7.4 Build order (milestones)

1. Tokens, fonts, layout shell, `<MediaSlot>`, and content files with the real copy.
2. Static sections at all three breakpoints (no motion), pixel-checked against the portvio screenshots.
3. Global systems: Lenis + ScrollTrigger wiring, `<RollText>`, `<PrimaryButton>`, `<Cursor>`, Menu.
4. Signature scroll: sticky hero, shrink, curtain, process staircase, showreel.
5. Upgrades: preloader, hero layers and intro, SplitText reveals, stack deck, impact rail, timeline, contact slant, page transitions, background system.
6. Case-study template and the 6 pages.
7. Passes for reduced motion, accessibility and performance, then Playwright verification (§6.4).

---

## 8. scroll-craft rules: adopted and overridden

The user asked for scroll-craft's design file to become ours. The repo has no DESIGN.md; its design system is `references/taste.md`, copied verbatim to `research/scroll-craft/DESIGN.source.md`, and its engine values are summarised in `research/scroll-craft/analysis.md`. Where taste.md and the portvio brief conflict, **portvio's look wins (it is the brief), and taste.md is the quality floor for everything else**.

**Adopted (and where):**

| Rule | Applied in |
|---|---|
| Transform/opacity only (clip-path for wipes); no `transition: all` | §0.3, §6.2 |
| No ease-in on UI; strong ease-out `cubic-bezier(.23,1,.32,1)` | §2.1 `out` |
| Hover 120–180ms; press `scale(.97)` | §2.3, §2.4 |
| Stagger 30–80ms | §2.3 (`s.lines` .08, `s.words` .05, `s.menu` .05) |
| Never `scale(0)`; enter from near full size | Cursor scales from 0.159 of a real size; reveals from .8 (portvio) |
| Hover gated to fine pointers | §2.4 |
| Reduced motion = fewer and gentler, not none | §6.3 |
| Tracking tightens as size grows; `balance` / `pretty`; 45–75ch measure; hero steps down on phone | §1.3, §1.3.1, §3.2 |
| Six colour roles + one accent; no pure black; tinted secondary text; contrast measured on the render | §1.2 (canvas #0D0D0D, accent-ink, computed contrast) |
| More space above headings than below; 4px-based spacing | §1.4 |
| Depth: edge light, tinted shadows, overlap, grain at 4–5% | §1.5, §1.6 |
| Every state: hover, focus-visible, active, disabled | §2.5, §6.1 |
| One label per intent; button text on one line | §3.0 |
| No invented statistics; real copy only; no em dashes | §0.1, §1.3, all copy |
| No text in generated images; one reusable style line; first frame as poster; say where negative space goes | §5 |
| Scrims as siblings, corner and band shapes, measured | §3.2, §3.11 |
| Browser surfaces themed | §1.2.2 |
| `width`/`height` attributes in pairs | §5.1 |
| Engine techniques: pinned progress, ≥ 1.2 screens per pin, smoothstep, masked line reveal with `.14em` padding and re-split after fonts, count-up 1400ms cubic (`power2.out`), magnet 0.2–0.35, spotlight 28rem, grain .045, 2px progress bar | §2.5, §2.7, §1.6 |
| Dwell remap `(1-L)x + L(4c³+.5)`, L ≤ .6 | §2.1 `dwell`, used by `<ScrollZoom>` at L .4 |
| Pointer tilt 5–9° (we use 6°), `perspective(1100px)`, lerp .09 per frame | `<Tilt>` §2.5 on the Impact panels |
| Layered parallax hero (background 31%, middle 17%, subject 20%, foreground 100%) | §3.2, layered scroll depth |
| Hero depth: plate plus alpha cut-out, load the layers together, depth must not depend on the pointer, mobile art-directed separately, acceptance screenshots | §3.2 layer gating, §5.2 `hero-bg-plate` / `hero-subject`, §6.4 |
| Verification with a screenshot per scroll step | §6.4 |

**Considered and not adopted (portvio's measured language wins):**

| scroll-craft technique | Decision | Why |
|---|---|---|
| Fade windows (in over the first 30%, hold, out over the last 30%, rising 2.4vh) | Not used | Portvio's reveals fire once and never reverse [pv: motion §2c]. Fading copy out on scroll would contradict that |
| Line reveal stagger "0.62 spread" (each line runs over 38% of the window) | Replaced by a fixed `s.lines` .08 | Ours are time-based tweens, not scrubbed windows. .08 sits within taste's 30–80ms |
| Fade-up on entry: 14px over 620ms, `cubic-bezier(.23,1,.32,1)`, stagger 30–80ms | Replaced by portvio's y 30, spring d1.2 with delays .2 / .3 / .4 | Measured portvio values are the brief |
| Scroll-scrubbed video (lerp .18, `-g 8 -keyint_min 8 -sc_threshold 0 -crf 20`) | Not used | Portvio's showreel loops while it zooms. If a scrubbed clip is added later, use these encoder flags (720p with `-g 4` on mobile) |
| Background colour drift between sections | Not used | Portvio keeps #0D0D0D on every section [pv: motion §2e] |
| Fluid section padding | Stepped per breakpoint instead (100/40 · 80/20 · 60/20) | Portvio's measured values. They already step down for phone, which meets the rule's intent |

**Overridden by the brief (deliberately):**

| taste.md says | We do | Why |
|---|---|---|
| Custom cursors are refused | Difference-dot cursor with context states | Portvio has one; the user asked for mouse effects |
| An eyebrow at most once per three sections | An eyebrow on every section | Portvio's signature split-header pattern |
| Section numbers are refused | "01." on expertise rows, "//01" on process cards | Portvio pattern; the sequence is real information |
| Locale/time strips are refused | Nav shows "Colombo, Sri Lanka" + live clock | Portvio's nav pattern, with Vinul's real location |
| Decoration strips across the hero bottom are refused | Tech-chip marquee in the hero | Portvio pattern, filled with real skills rather than decoration |
| Split header (headline + floating explainer) is refused | Portvio's split header | The brief is portvio's layout |
| More than four text elements in the hero is refused | Tagline, paragraph, wordmark, chips, carousel counter | Portvio's hero; total copy stays under 30 words |
| Inter is discouraged as a default | Inter for body text | Portvio's actual face |
| Glass only as a specific effect | Glass only on photos (hero chips, contact card) and the compact nav pill | Matches the rule's intent |
| Rail: one screen of scroll per item, plus one | 1:1 travel plus a 15% dwell | Narrow panels; avoids long dead scroll |
| More than two consecutive zig-zags is refused | Work cards alternate image sides, but stack in place instead of flowing as a list | Portvio's zig-zag DNA; stacking prevents a monotonous list |
| Pills and tags overlaid on photos are refused | Glass skill chips over the hero photo | Portvio's hero pattern; the chips carry real skills and sit in the masked bottom band |
| Never nest cards | Process card with an inner `#303030` panel; experience shell holding two cards | Portvio's process card and pricing shell, kept for fidelity. No third level anywhere |
| Display type max about 6rem outside a hero moment | Preloader counter up to 160px, footer and next-project wordmarks fitted to the width | These are hero-grade moments (load, page end, route end). Impact numbers are capped at 96px (§1.3) |
| Hero CTA visible without scrolling | No CTA in the hero | Portvio's hero has none. "Let's Talk" is the first element of About, inside the first scroll, and in the menu |
| Light text on dark: more line height, tracking and weight | Portvio's exact metrics (e.g. body 16/400/1.6/−0.02em) | Measured fidelity. Contrast is still ≥ 10:1 for body text |
| Display line height 0.94 to 1.06 | H2 at 1.2 (portvio); new display sizes at 0.82 to 0.94 | Portvio's preset `pyqs7i` is 120% |

---

## 9. Open items for Vinul

1. **Project years and roles:** confirm each project's year and Vinul's exact role title (everything marked † in §3.7 and §4.3), and whether TechSalary LK is personal, freelance or academic.
2. **AI chatbot:** confirm that the "AI Chatbot Backend" project is the same system as the DMS chatbot that handled 100+ daily queries. If not, drop that result from the case study.
3. **CV download:** a "Download CV" button needs a PDF **without the References section**. The current CV must not be published.
4. **Contact form endpoint:** a Formspree or Web3Forms key for `NEXT_PUBLIC_FORM_ENDPOINT`. Without it, the form falls back to `mailto:`.
5. **Button label colour:** the accessible default is dark labels on orange (§1.2.1). Say if you want portvio's white labels anyway.
6. **Recommendations:** with real LinkedIn recommendations, we can add a Recommendations section built on portvio's testimonial slider spec [pv: bundle §5.11].
7. **Real screenshots:** real app screenshots (with sensitive data blurred) look more credible than generated UI on project covers. Confirm what can be shown for AASL and Jova (client confidentiality).
8. **Page length:** the home page is about 19,000px at 1440×900 (§2.7). Decide after the first review whether to keep 6 pinned work cards or switch to 4 pinned plus 2 compact.

---

## Appendix A: Fidelity checklist

Every effect measured on portvio, with the section that implements it. Tick a box only after comparing the rendered build with the portvio frame or recording cited in `research/portvio/*.md` (§6.4).

**Status key:**
- **Exact:** portvio's values, unchanged.
- **Upgraded:** portvio's values plus an extension. The `portvio` profile (§2.4) falls back to the exact values.
- **Adapted:** the same mechanism on different content or layout.
- **Deferred:** spec kept (§3.14) but not built in v1.
- **Dropped:** intentionally not reproduced.

### A.1 Global systems and tokens

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Lenis smooth scroll | duration 1.8, `t => min(1, 1.001 - 2^(-10t))`, anchors via `lenis.scrollTo` | §2.4 | Exact |
| [ ] | Lenis feel | 100px tick: 44px at 200ms, 95px at 814ms, 100px at 1.6s | §2.4 | Exact |
| [ ] | `data-lenis-prevent` on inner scroll areas | — | §2.4 | Exact |
| [ ] | Scroll-transform smoothing | spring k500 c60 → `scrub: 0.7` | §2.3 | Exact (approx.) |
| [ ] | Default appear fade-up | opacity .001 → 1, y 30 → 0, spring d1.2 b0, 50% visible, once | §2.3, §2.5 `<Reveal>` | Exact |
| [ ] | Card appear | + scale .8 → 1 | §2.5 `<Reveal card>` | Exact |
| [ ] | Sibling cadence | hand-set delays .2 / .3 / .4, no `staggerChildren` | §2.3 `s.siblings` | Exact |
| [ ] | No replay on scroll-up; skipped elements still fire once | — | §2.3 trigger rule | Exact |
| [ ] | Parallax speed 90 | +0.1px per px, images 125% / 280% tall, off on phone | §2.5 `<ParallaxImage>` | Adapted (element-relative) |
| [ ] | Hero parallax speed 110 | −0.1px per px | §3.2 drift | Exact |
| [ ] | Custom cursor | 14px #FFF, radius 100, `mix-blend-mode: difference`, spring k400 c60, offset +16/+16, `translate(-50%,0)`, native cursor visible, opacity 0 until moved, above the menu | §2.5 `<Cursor>`, §1.7 | Upgraded (U13) |
| [ ] | Page transitions | none; URL changes at about 370ms, swap at about 970ms, instant scroll to top | §2.5 `<PageTransition>` | Upgraded (U15) |
| [ ] | Back restores the previous scroll position | 4934px measured | §2.4 scroll restoration | Exact |
| [ ] | No preloader | appear script starts at about 300ms | §2.5 `<Preloader>` | Upgraded (U1) |
| [ ] | Constant canvas, no section colour changes | #0D0D0D | §1.2 | Exact |
| [ ] | Breakpoints | 1200 / 810 (Framer variants) | §1.4, §7.3 | Exact |
| [ ] | Fonts | Clash Display 600/700 + Inter 400–700, fallback metric overrides | §1.3 | Exact |
| [ ] | Text presets | `pyqs7i`, `12cv170`, `1268ber`, `zm2hix`, `1t1q47u`, `1p07c7a`, `15yfpro`, `75gyxi` | §1.3 type scale | Exact |
| [ ] | Colour tokens | 25 tokens incl. #F65802, #232222, #3C3C3C, #BDBDBD, glass .2 / .3 / .1 | §1.2 | Exact (labels on orange: §1.2.1) |
| [ ] | Radii scale | 4 / 6 / 8 / 10 / 12 / 16 / 20 / 100 | §1.5 | Exact |
| [ ] | Borders as `::after` overlays | 1px #3C3C3C; glass 1px rgba(255,255,255,.3) | §1.5 | Exact |
| [ ] | No shadows | — | §1.5 | Upgraded (edge light, stack shadow) |
| [ ] | Glass | white .2 + `blur(10px)` on photos | §1.2, §3.2, §3.11 | Exact (hero); Upgraded (contact contrast) |
| [ ] | Marquee edge masks | 10.36 / 88.29% and 7.21 / 92.79% | §1.2, §2.5 `<Marquee>` | Exact |
| [ ] | Divider gradient | 90deg rgba(255,255,255,.3) → #0D0D0D, mirrored on alternate rows | §1.2, §3.9 | Exact |
| [ ] | Section spacing | 100/40 · 80/20 · 60/20; heavy bottom 140/100/80; heading gap 50/40/30; gutters 20/20/16 | §1.4 | Exact |

### A.2 Navigation and menu

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Nav position | `absolute`, 86px, padding 20, z 10, scrolls away | §3.1 | Exact |
| [ ] | Nav left group | logo 143×32 · location + clock · 6px dot + email; gap 100 (tablet 80) | §3.1 | Adapted (Vinul's content) |
| [ ] | Live clock | ticks every 1s, "11:38:34 PM" format | §2.5 `<LiveClock>` | Exact (Asia/Colombo) |
| [ ] | Phone nav | 72px, padding 20/16, logo + Menu only | §3.1 | Exact |
| [ ] | Nav load | y −40 → 0, spring d1.0, delay .2 | §3.2 intro | Exact |
| [ ] | Menu trigger | 87×24; 3 bars 24×2 at y 4 / 11 / 18 | §3.1 | Exact |
| [ ] | Hamburger → X | spring d.4 b.2; middle bar fades and shrinks; done at about 410ms (back at about 490ms) | §3.1 | Exact |
| [ ] | "Menu" → "Close" label roll | 0.2 / 0.025 | §3.1 | Exact |
| [ ] | Backdrop | rgba(0,0,0,.25) + `blur(5px)`, spring d.4, click closes | §3.1 | Exact |
| [ ] | Panel | 45% / 64% / 100%, #0D0D0D, padding 0 40, x 560 → 0 + opacity, spring d.6, from the right at every width | §3.1 | Exact |
| [ ] | Links reveal | Clash 54/700 at every width, masked y 100 → 0, 0.8s `cubic-bezier(.645,.045,.355,1)`, delays 0 / .05 / .10 / .15 / .15 | §3.1 | Exact (6 links, delays capped at .15) |
| [ ] | Link hover | roll 0.3 / 0.03 | §3.1 | Exact |
| [ ] | Contact / Socials block | 2 × 272px columns, gap 24, labels 16 #BDBDBD + 16 below, items 12 apart, roll 0.2 / 0.025 | §3.1 | Adapted |
| [ ] | Close sequence | panel out (d.6), backdrop out (about 390ms), links back to y 100, unmount at about 1s | §3.1 | Exact |
| [ ] | Esc closes; page scroll not locked | — | §3.1 | Exact (Esc); Upgraded (we lock scroll) |
| [ ] | No sibling dimming on hover | — | §3.1 U18 | Upgraded |

### A.3 Text, button and hover language

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Per-letter 3D roll | two copies; y ∓100%, rotateX ±90, opacity; 0.2s easeInOut, stagger .025; perspective 1000; `preserve-3d`; line-height 1; padding-bottom 2px | §2.5 `<RollText>` | Exact |
| [ ] | Large roll (menu links) | 0.3s / .03 | §2.5 `<RollText size="lg">` | Exact |
| [ ] | Roll reverses with letters in forward order | — | §2.5 | Exact |
| [ ] | Primary button square-fill | 48×48 box → `inset: 2px` (183.7×56), arrow 0 → −45°, label colour, spring d.6 | §2.5 `<PrimaryButton>` | Exact (clip-path implementation; label colour per §1.2.1) |
| [ ] | Inverted (white) button | dark box fills, label → #FFF | §2.5 | Exact |
| [ ] | Form submit hover | #F65802 → rgba(246,88,2,.85), 0.2s `cubic-bezier(.44,0,.56,1)` | §2.5 submit variant, §3.11 | Exact |
| [ ] | Submit states | loading spinner (20px, 360° per 1s, linear), success, error (rgba(255,34,68,.15) / #F24), disabled .5 | §2.5 | Exact |
| [ ] | Subscribe button in the field | 150w, inset right 6 | §3.12 (Copy button) | Adapted |
| [ ] | Glass arrow tab conveyor | arrow out +24px, copy in from −24px; bg .2 → .3; spring d.6 | §2.5 `<SlotSwap>`, §3.2 | Exact |
| [ ] | Prev/Next vertical label swap | ∓30px, spring d.6, chevron static | §2.5 `<SlotSwap>`, §4.1, §3.14 | Exact |
| [ ] | Project card hover | overlay image opacity 0 → 1, scale 1 → 1.1, spring d.6 | §3.7 hover | Exact (+ cover follow, View cursor) |
| [ ] | Service row hover | transparent → rgba(35,34,34,.7), about 500ms | §3.5 | Exact (+ title roll) |
| [ ] | Inputs: no hover or focus change | — | §3.11, §6.1 | Upgraded (accessible focus ring) |
| [ ] | No magnetic, tilt, image-follow or cursor labels | — | U14, U20, U8, U13 | Upgraded |
| [ ] | Logo and credits: no hover | — | §3.1 | Exact |

### A.4 Hero

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Sticky stage | `sticky; top 0; 100vh; padding 0 20 50; justify-content: flex-end; overflow hidden; z 1` | §3.2 | Exact |
| [ ] | Background intro | opacity .001 → 1, scale 1.2 → 1, 1.0s `cubic-bezier(.44,0,.56,1)` | §3.2 intro | Exact |
| [ ] | Wordmark intro | y 52 → 0, spring d1, delay .4 | §3.2 intro (wrapper) | Upgraded (+ chars) |
| [ ] | Tagline block | left 240 / top 260, 280 wide, 24px icon + 18/500 H1, gap 20; x −40 → 0, delay .8 | §3.2 | Upgraded (+ blur words) |
| [ ] | Paragraph | 20/500, max 540; y 40 → 0, delay .8 | §3.2 | Upgraded (+ masked lines) |
| [ ] | Carousel | right 240 / top 260; 130×110 window r8; "01/03"; 32×110 glass tab, gap 6; x 40 → 0, delay 1.2 | §3.2 | Exact |
| [ ] | Carousel click | strip −130px, spring d.6 (about 500ms), counter changes instantly | §3.2 | Upgraded (SlotSwap counter) |
| [ ] | Carousel has no autoplay | — | §3.2 | Upgraded (5s autoplay, pausable) |
| [ ] | Chips marquee | 40px/s, gap 8, 45.6px glass chips, mask, no hover slow-down; intro y 40, spring d.8, delay 1.2 | §3.2, §2.5 `<Marquee>` | Upgraded (velocity, U7) |
| [ ] | Tablet offsets | tagline left 100, carousel right 100 | §3.2 | Exact |
| [ ] | Phone flow | tagline → thumbnail → wordmark → paragraph → chips, gap 80, padding 0 16 50 | §3.2 | Exact |
| [ ] | Shrink on scroll | scale 1 → .7, y 0 → −80 over About's height (about 630px; phone about 1130) | §3.2 | Upgraded (+ radius, dim, layered depth) |
| [ ] | Hero stays sticky under every later section (z 2, opaque) | — | §3.2 | Exact |

### A.5 About and the curtain

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Curtain ("Overlap Detailing" Filler) | #0D0D0D 100% × 834, skewY 0 → 7°, y 0 → −220 over scroll 0 → 833, linear + smoothing | §3.3 `<Curtain>` | Exact |
| [ ] | Layout | row gap 100; image 450×550 r16; right column about 850 | §3.3 | Exact |
| [ ] | Portrait reveal | x −50 → 0, delay .2 | §3.3 | Exact |
| [ ] | Portrait parallax | speed 90, image 125% tall, off on phone | §3.3 | Adapted (120%, element-relative) |
| [ ] | Eyebrow | 24px orange sparkle + 20/500 label, gap 10; y 30, delay .2 | §3.3, §1.4 | Upgraded (word reveal + sparkle spin) |
| [ ] | Statement | Inter 32/700 uppercase, accent span #F65802 (weight 700); delay .3 | §3.3 | Upgraded (U5 scroll fill) |
| [ ] | Stat rows | box #232222 r10, padding 10/12 (118×63); Clash 36/600; label 18/500; arrow rotated 90°; 134px apart; gradient divider about 400 wide; delays .3 / .4 | §3.3 | Upgraded (U6 counters) |
| [ ] | Paragraph + CTA | 20/500 #BDBDBD + orange button (188×60); delay .3 | §3.3 | Exact |
| [ ] | Tablet and phone | column gap 50; image 400 tall (tablet); text first on phone | §3.3 | Exact |

### A.6 Partners → Tech Stack

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Header row | eyebrow · centred 16/400 line · hooked arrow; 32px gap below; y 30, delay .2 | §3.4 | Exact |
| [ ] | Tiles | 280×200, #232222, r10, centred 40px white logo | §3.4 | Exact (+ name label) |
| [ ] | Logo ticker | 50px/s, gap 6, mask 7.21 / 92.79%, no hover slow-down | §3.4 | Upgraded (velocity) |
| [ ] | Ticker disabled on phone | — | §2.5 `<Marquee>` | Adapted (kept running; it is the only stack overview) |

### A.7 Services → Expertise

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Split header | eyebrow / H2 at about x 477 / counter; y 30, delay .2 | §1.4, §3.5 | Upgraded (H2 line mask) |
| [ ] | List reveal | whole panel y 30, scale .8 → 1, delay .3 | §3.5 | Exact |
| [ ] | Closed row | 1400×160, padding 50, r16, 1px #3C3C3C, transparent, gap 24 | §3.5 | Exact |
| [ ] | Number + title | 54px number column, gap 60, Inter 32/700 uppercase | §3.5 | Exact |
| [ ] | Round button | 60×60; closed #F65802 "+"; open #2F2E2D, icon rotated 135° (×); spring d.4 b.2 | §2.5 `<Accordion>` | Exact (verified on `accordion_open_1200.png`) |
| [ ] | Open row | #232222, 348 tall; left block (title top, description bottom, gap 130); right block (image 240×280 r12 · bullets · button) | §3.5 | Exact |
| [ ] | Bullets | 10px orange dots, gap 10, 20/500 text | §3.5 | Exact |
| [ ] | Open / close | layout spring d.8 (about 810ms); content fades in; rows below pushed | §2.5 `<Accordion>` | Exact (FLIP) |
| [ ] | Phone variant | #232222 at rest, padding 24, gap 40, image 230 tall | §3.5 | Exact |

### A.8 Work Process (sticky staircase)

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Sticky centred header | `top: 100px`; y 30, delay .2 | §3.6 | Upgraded (line mask) |
| [ ] | Sticky rows | 4 rows `sticky; top: 240px`, 4 columns at 350px pitch, row gap 50, cards 2 and 3 lowered 25px | §3.6 | Exact |
| [ ] | Card pop | y 60, scale .8 → 1, opacity; spring k300 c100; threshold 0 | §3.6 | Exact |
| [ ] | Release together; pinned cards never scaled or dimmed | wrapper about 1880px | §3.6 | Exact |
| [ ] | Card styling | #232222 r12 1px #3C3C3C; orange tab 50×5 at left 26; header 90 tall (padding 32 26, bottom border); inner #303030 panel inset 6, r10, padding 26/20, gap 150, three 8px dots | §3.6 | Exact (+ glyph, tab draw) |
| [ ] | Phone: plain list, nothing sticky | — | §3.6 | Exact |

### A.9 Projects → Selected Work

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Split header + 1px divider | — | §3.7 | Upgraded (divider draws) |
| [ ] | Zig-zag rows | card 980 + year (Clash 36/600) at the outer edge, sides alternate | §3.7 | Adapted (stacking deck U9; image side alternates) |
| [ ] | Row reveal | y 30, scale .8 → 1, delay .2 | §3.7 entry | Exact |
| [ ] | Card | #232222, r16, 1px #3C3C3C, overflow hidden | §3.7 | Exact |
| [ ] | Tags | 16/600 uppercase, padding 8 10, rgba(255,255,255,.1), r4, gap 6 | §3.7 | Exact |
| [ ] | Cover parallax | speed 90, image 280% of the window; off on phone | §3.7 | Adapted (`<ParallaxImage>`) |
| [ ] | Hover image swap | see A.3 | §3.7 | Exact |
| [ ] | Gradient dividers between rows | alternating direction | §3.9 education rows | Adapted (the deck has no rows) |
| [ ] | Card links to the detail page; no route animation | — | §3.7, §2.5 `<TransitionLink>` | Upgraded (U15) |

### A.10 Pricing → Experience

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Centred header | eyebrow above H2, gap 20; y 30, delay .2 | §3.9 | Upgraded (line mask) |
| [ ] | Shell | max 960, #232222, r10, padding 12, 1px #3C3C3C; y 30, scale .8, delay .3 | §3.9 | Exact |
| [ ] | Left plan | transparent, padding 38 | §3.9 | Adapted (DMS card) |
| [ ] | Highlighted plan | `linear-gradient(180deg,#282727,#303030)`, 1px #3C3C3C | §3.9 | Adapted (Coding Legends card) |
| [ ] | "WHAT'S INCLUDED:" list | 16/600 uppercase #BDBDBD label; white dots, gap 12 | §3.9 ("WHAT I DID:") | Adapted |
| [ ] | Section padding | 100 / 20 / 140 | §1.4 heavy bottom | Exact |
| [ ] | Monthly/Annually toggle | 44×24 track, 16px knob, 20px travel, spring k500 c60, labels cross-fade about 650ms | §3.14 `Toggle` | Deferred |

### A.11 Showreel (Demo)

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Pin structure | 100vh sticky stage + 300vh spacer (3600px with a 900px viewport) | §3.10 | Exact |
| [ ] | Frame | scale .2 → 1 (288×180 → full), r20, overflow hidden | §3.10 | Upgraded (radius 20 → 12, dwell) |
| [ ] | Counter-zoom | inner video 1.8 → 1 (net .36 → 1) | §3.10 | Exact |
| [ ] | Video | autoplay, muted, loop, cover, `brightness(.7)` | §3.10 | Exact (+ play only in view) |
| [ ] | Labels | "SHOWREEL" x −1200 → 0, "//2026©" x +1200 → 0; Clash 48/700; `mix-blend-mode: hard-light`; z 2 | §3.10 | Exact (−83.33vw) + chars reveal |
| [ ] | Progress | linear over 2700px | §3.10 | Upgraded (0 → .85 + hold; `portvio` profile linear) |
| [ ] | Phone | same effect, about 2530px range | §3.10 | Exact |

### A.12 Testimonials

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Split header + "845 Clients" | y 30, delay .2 | §3.14 | Deferred |
| [ ] | Card | 1400×560, r16, padding 20, gap 60; image 524×520 r10; quote 32/700 uppercase; divider; name + role; stars + 4.9/5.0 | §3.14 | Deferred (stars and rating dropped) |
| [ ] | Slider | ±1220 offsets, inactive opacity 0, layout spring d.8, about 650–800ms | §3.14 | Deferred |
| [ ] | Prev/Next pills | 690×74.6, gap 20 | §3.14, §4.1 | Adapted (used on case studies) |

### A.13 CTA → Contact

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Container | full-bleed photo, padding 380 / 20 / 50 (300 top on tablet and phone); section padding-bottom 140 | §3.11 | Exact |
| [ ] | Glass card | x 820, 600 wide, padding 40, gap 30, white .2 + blur 10, 1px white .3, r20 | §3.11 | Upgraded (darker glass for 4.5:1) |
| [ ] | Title + fields | "Contact Us" 20/500, "LET'S TALK" 32/700; fields 54px, padding 16, r6, labels 16/500, 2-column names | §3.11 | Exact (+ message field) |
| [ ] | Submit | full width, orange, 54px | §3.11 | Exact |
| [ ] | Reveal | whole container y 30, scale .8 → 1, delay .2 | §3.11 | Upgraded (U12 slant + zoom; reveal moved to the card) |

### A.14 Footer

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Glow | radial #F65802 → #0D0D0D, blur 50, opacity .6, 600px at bottom −300 (400 / −200 tablet, 300 / −150 phone) | §1.2, §3.12 | Upgraded (follows cursor x, breathes) |
| [ ] | Left block | logo 163×40; label; 20/500 line; 400×60 field (white .1, r8, 1px white .3) with inset orange button | §3.12 | Adapted (copy-email) |
| [ ] | Link columns | x 752 / 966 / 1200; 18/400 roll links at a 36px pitch; labels 16 #BDBDBD | §3.12 | Exact |
| [ ] | Second row + copyright | contacts at x 750 / 1073; © line 14px | §3.12 | Adapted |
| [ ] | Giant wordmark | 1400×194, white at 10%, glow behind, full glyphs flush to the page bottom | §3.12 | Exact (+ chars rise) |
| [ ] | Layout reveal | y 30, scale .8 → 1, delay .2 | §3.12 | Exact |

### A.15 Project detail page

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Section | padding 180 / 20 / 140 (160 tablet, 140 phone top); column gap 50 | §4.1 | Exact |
| [ ] | Title | Clash 48/700 uppercase; x −30 → 0, spring d1, delay .2 | §4.2 | Upgraded (+ chars) |
| [ ] | Summary per-word blur | blur 10 → 0, opacity .001 → 1, x 20 → 0, spring d1, .05s per word, on mount | §2.5 `<BlurText>`, §4.2 | Exact |
| [ ] | Meta columns | label 16 #BDBDBD over 20/500 value; y 30, delays .4 / .6 / .8 / 1.0 | §4.1, §4.2 | Exact |
| [ ] | Banner | 1400 wide in a 1400×900 wrapper, r16; y 30, delay .8; parallax speed 90 | §4.2 | Upgraded (MaskReveal + ScrollZoom) |
| [ ] | Article | 940 centred; H3 32/700 uppercase; 16–17px / 1.6 #BDBDBD; about 50px between blocks; reveals y 30 at 50%, delay .2 (one at .4) | §4.1, §4.2 | Exact (+ H3 line mask) |
| [ ] | Gallery | 2-up 692 wide, gap 16, r20; then full width 1400, r20; parallax 90 | §4.1, §4.2 | Exact (+ MaskReveal) |
| [ ] | No project-specific hovers | — | §4.1 items 6–7 | Upgraded (Prev/Next, next-project block) |

### A.16 404

| ✓ | Portvio effect | Measured value | DESIGN.md | Status |
|---|---|---|---|---|
| [ ] | Centred stack | about 130px top; "PAGE NOT FOUND" Clash 48 (34 phone); 20/500 line; 16/400 #BDBDBD (360 wide); orange "Back to Home" 212×60; then the footer | §3.13 | Exact (copy adapted) |

### A.17 Dropped on purpose

- "Made in Framer" badge: not part of the design [pv: structure §1].
- Pricing plans, the "$990 / $690" prices and the testimonial content: there is no real equivalent in the CV (§3.0). The mechanisms are kept in §3.14.

### A.18 Research gaps (not captured or conflicting; resolved as noted)

| Gap | Resolution in this file |
|---|---|
| Hero `transform-origin` during the shrink was not captured | 50% 50% (Framer default; it fits the measured y values) §3.2 |
| Cursor fade-in duration was not captured | `springFade`, marked New §2.5 |
| Menu link size on tablet was not measured (desktop and 390 phone are both 54px) | 54px at every width §1.3 |
| Phone menu direction: `structure.md` says from the left, `interactions.md` measured x 560 → 0 | From the right, verified on `mobile_menu/sheet_open.png` §3.1 |
| Accordion button colours: `bundle.md` maps open = orange, closed = #2F2E2D, but the screenshots show the reverse | Closed orange "+", open #2F2E2D "×" (screenshot wins) §2.5 |
| Spring d1.0 constants: `motion.md` says k100 c20, `bundle.md` says k85.26 c18.47 | Bundle (`findSpring`) values; timings re-integrated §2.2 |
| Card spring timing: `motion.md` says 95% at about 0.45s | Integrated: 95% at 0.98s, settle 2.24s §2.1, §2.2 |
| Showreel frame radius: 16 (`motion.md`) vs 20 (`structure.md`, `bundle.md`) | 20 §3.10 |
| Footer glow count: `motion.md` says 3 blobs, `bundle.md` / `structure.md` describe one | One glow §1.2 |
| Hero background "y −90 → 0 visual" (`motion.md` §1, row 1) is unexplained; the appear map has only scale and opacity | Ignored; scale 1.2 → 1 only |
| Testimonial transition: two descriptions (x 1440 → 20 with scaleX .86 → 1, vs layout variants with scaleX .74–1.35) | Simplified to a layout slide on `springLayout` (deferred) §3.14 |
| Showreel scroll start: 8108 (`bundle.md`) vs about 8250 (`motion.md`) | `start: "top top"` of the wrapper (= the bundle's definition) §3.10 |
| Detail-page layouts on tablet and phone (meta row, gallery) were not captured | 2×2 meta on phone and stacked gallery (assumption) §4.1 |
| Accordion: whether several rows can be open at once was not tested | One row open at a time (New) §2.5 |
