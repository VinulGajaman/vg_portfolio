# Portvio (portvio.framer.website): source and bundle analysis

Role: SOURCE/BUNDLE ANALYST. Every value here comes from the shipped HTML, the inline CSS and the framer-motion / Framer runtime JS modules. Each was cross-checked by sampling the live page with Playwright (`bundle/scroll-samples.json`).

- Site id: `3HKCVDNvSeF4jBHL4V1f33`. Runtime: Framer (`framer.Cx8CLIER.mjs`) + Motion (`motion.BQ7b2TwE.mjs`) + React 18. The smooth scroll is **Lenis 1.1.9**, bundled in `shared-lib`.
- Page component: `Home` (`HLVJ-...mjs`, displayName `Home`, page root class `framer-72rtr7`, scope `framer-951uk`). The layout template is `Main Template` (`script_main...mjs`, scope `framer-1du1Z`), which holds the nav, menu overlay, custom cursor and footer.
- Breakpoints (`__framer__breakpoints`):
  - Desktop `(min-width:1200px)` (`72rtr7` / template `1gojdd0`)
  - Tablet `(810px – 1199.98px)` (`1n6xclu` / `igxfa4`)
  - Phone `(max-width:809.98px)` (`sf5kwd` / `1wz9gp1`)
- Design canvas: width 1200, Home height 14206px (desktop). The live page height at 1440x900 is 14463px.

---

## 0. TL;DR: the "feel" in 12 rules

1. **Everything is spring-based with zero bounce.** Framer `{type:"spring", bounce:0, duration:D}` resolves to a critically damped spring (ζ=1). In CSS that is roughly `cubic-bezier(0.28,0.55,0.1,1.05)`; exact `linear()` curves are in §7.
2. **Hero intro sequence** (page load, "appear" animations, opacity starts at **0.001**, not 0):

   | Delay | Element | Motion | Timing |
   |---|---|---|---|
   | 0s | background photo | scale 1.2 → 1 | tween 1s `cubic-bezier(.44,0,.56,1)` |
   | 0.2s | nav | from y -40 | spring 1s |
   | 0.4s | giant wordmark | from y 52 | spring 1s |
   | 0.8s | headline block | from x -40 | spring 1s |
   | 0.8s | paragraph | from y 40 | spring 1s |
   | 1.2s | ticker | from y 40 | spring 0.8s |
   | 1.2s | image carousel | from x 40 | spring 1s |

3. **Sticky hero + curtain.** The hero is `position:sticky; top:0; height:100vh; z-index:1`. Every later section has `z-index:2` and a solid `#0d0d0d` background, so content slides **over** the hero. As the About section enters, the hero scales 1 → 0.7 and moves y 0 → -80px, plus a constant parallax of -0.1 × scrollY.
4. **Skewed "Overlap Detailing" wedge.** A #0d0d0d block (834px tall) at the top of About scroll-links to `skewY 0 → 7deg` and `y 0 → -220px`. That gives the curtain a slanted leading edge.
5. **Section reveals.** Content blocks start at `opacity 0, y 30` (cards also start at `scale .8`). They spring to rest (1.2s, bounce 0) once 50% of the element is visible, and only once. The stagger comes from delays .2 / .3 / .4s.
6. **Showreel pin.**
   - A 100vh sticky stage is followed by a 300vh spacer.
   - Video frame scales 0.2 → 1; the video inside it scales 1.8 → 1 (a counter-zoom).
   - "SHOWREEL" slides in from x -1200 and "//2026©" from x +1200. Both texts use `mix-blend-mode: hard-light`.
   - Progress is linear in scroll and runs over exactly 300vh.
7. **Parallax.** The About portrait and the project cover images move at speed 90, i.e. y = +0.1 × scrollY. The images are oversized (125% / 280%) so the motion never shows an edge.
8. **Text-roll hover** on every nav/menu/footer link and on the Menu button: a per-character 3D flip. Each character rises to y -100% with rotateX 90 and fades out, while a duplicate rises from y 100% with rotateX -90. Stagger is 25–30ms per character, duration 0.2–0.3s easeInOut, with perspective 1000.
9. **Main CTA button hover.** A 48px white square behind the arrow grows into a full-button white fill (layout spring 0.6s). The arrow rotates -45° and the text turns white → #0d0d0d.
10. **Custom cursor.**
    - 14px white dot with `mix-blend-mode:difference`.
    - Follows the pointer through a spring (stiffness 400, damping 60), offset +16px/+16px.
    - Placement "bottom center", i.e. `translate(-50%, 0%)`.
    - The native cursor stays visible.
11. **Smooth scroll.** Lenis with `duration: 1.8s` (intensity 18 ÷ 10) and easing `t => Math.min(1, 1.001 - 2**(-10*t))`, i.e. expo-out. Anchor links scroll through Lenis.
12. **Palette and type.**
    - Colors: near-black `#0d0d0d`, cards `#232222`, borders `#3c3c3c`, muted text `#bdbdbd`, accent "Willpower Orange" `#f65802`.
    - Display font: **Clash Display** 600/700 (Fontshare). Body and UI font: **Inter** 400/500/600/700/900.

---

## 1. Files written

| Path | What |
|---|---|
| `bundle/html/raw.html` | non-rendered HTML (plain fetch, 692 KB) |
| `bundle/html/rendered.html` | DOM after load + full scroll (469 KB) |
| `bundle/src/*.mjs|js` | every JS module, original filenames (site modules + Framer editor-bar chunks) |
| `bundle/pretty/*.js` | js-beautified site modules (`HLVJ…` = Home, `script_main…` = template, `framer…` = runtime, `motion…`) |
| `bundle/pretty/raw-styles.pretty.css` | beautified inline `<style>` CSS from raw HTML |
| `bundle/inline-styles.css` | all `<style>` blocks from rendered DOM (incl. runtime-injected component CSS) |
| `bundle/extracted/script_*.txt` | every inline `<script>` (appear map, breakpoints, handover data, etc.) |
| `bundle/appear-animations.json` | pretty `__framer__appearAnimationsContent` |
| `bundle/breakpoints.json` | `__framer__breakpoints` |
| `bundle/css-vars.json` | every CSS custom property + where defined |
| `bundle/framer-names.json` | every `[data-framer-name]` node with page position/size |
| `bundle/media.json` | every img/video/bg-image: natural + rendered size, page position, layer path |
| `bundle/network.json` | all 66 network responses |
| `bundle/springs.json` | spring → stiffness/damping/settle + CSS `linear()` and cubic-bezier fits |
| `bundle/scroll-samples.json` | live sampled transforms at scroll positions (verification) |
| `bundle/assets/*` | key images/SVGs downloaded for reference |
| `tools/bundle_capture.cjs`, `bundle_extract.cjs`, `bundle_assets.cjs`, `bundle_verify.cjs`, `bundle_springs.cjs` | scripts |

---

## 2. Color tokens (CSS custom properties on `body`)

| Token | Value | Name / usage |
|---|---|---|
| `--token-eb657201-…` | `#0d0d0d` rgb(13,13,13) | **"Black"**: page bg, section bg, Main Button hover text / icon |
| `--token-cf52203c-…` | `#0d0d0d` | (dup black) |
| `--token-e53dc5d9-…` | `#0a0a0a` | deeper black |
| `--token-3d7ec0c8-…` | `#101010` | |
| `--token-afff48cc-…` | `#1d1d1d` | |
| `--token-a4c69bb0-…` | `#232222` rgb(35,34,34) | **card background** (process, services, projects, pricing, testimonial tabs) |
| `--token-51f47353-…` | `#232222b3` rgba(35,34,34,.7) | services card hover bg (closed state) |
| `--token-5c3d7de4-…` | `#282727` | |
| `--token-de352dd7-…` | `#2f2e2d` rgb(47,46,45) | services arrow button, closed state |
| `--token-8397b426-…` | `#303030` | process card inner gradient end |
| `--token-ec034d5b-…` | `#3c3c3c` rgb(60,60,60) | **1px borders**, dividers |
| `--token-1000dd73-…` | `gray` | |
| `--token-bbe6604c-…` | `#999` | |
| `--token-f03c8a2a-…` | `#bdbdbd` rgb(189,189,189) | **muted body text** (preset `1p07c7a` default color), placeholders |
| `--token-54748734-…` | `#fff` | **"White"**: headings, primary text |
| `--token-78c7249a…`, `--token-a83649a1…`, `--token-d794ee9b…` | `#fff` | dup whites |
| `--token-0c119089-…` | `#000` | |
| `--token-fc2c27e2-…` | `#ffffff0d` (5%) | |
| `--token-e6cd3767-…` | `#ffffff1a` (10%) | input bg, project category tag bg |
| `--token-64953fcf-…` | `#fff3` (20%) | glass chips (hero ticker pills, carousel arrow), CTA glass card |
| `--token-d82c70ee-…` | `#ffffff4d` (30%) | input borders, glass hover, CTA border, divider gradient |
| `--token-5c6889b7-…` | `#00000040` (25%) | menu overlay backdrop |
| `--token-557c218c-…` | `#0000` | transparent |
| `--token-f9fa1ea9-…` | `#f65802` rgb(246,88,2) | **"Willpower Orange"**: accent: buttons, highlight words, bullets, badge star |
| `--token-c765869f-…` | `#f65802d9` (85%) | orange button hover |
| `--token-57441415-…` | `#f24` | error text |
| `--token-a5ad9f2c-…` | `#ff224426` | error bg |
| `--token-f974e3bc-…` | `#4cf` | spinner default (unused visually) |

Body backgrounds:
- The template sets `:root body { background: #0d0d0d }`.
- The Home page sets `html body { background: #fff }`, but the template's dark root wins visually, because every section is #0d0d0d.

Gradients and effects found:
- Footer glow:
  - background `radial-gradient(50% 50% at 50% 50%, #f65802 0%, #0d0d0d 100%)`
  - `filter: blur(50px)`, opacity .6
  - size 600px tall, full width, `bottom:-300px`, z 0
  - Tablet: 400px tall at bottom -200. Phone: 300px tall at bottom -150.
- Project-row dividers: 1px lines, `linear-gradient(90deg, rgba(255,255,255,.3) 0%, #0d0d0d 100%)`. Alternate rows use the mirrored direction.
- Process card inner panel: `linear-gradient(180deg, rgb(48,48,48) 0%, #303030 100%)`, radius 10.
- Ticker edge masks:
  - Hero ticker: `mask: linear-gradient(90deg, transparent 0%, rgba(0,0,0,.9) 10.36%, rgba(0,0,0,.9) 88.29%, transparent 100%)`
  - Partners ticker: same with stops 7.21% / 92.79%
- Glass: `backdrop-filter: blur(10px)` + `rgba(255,255,255,.2)`. Used on the hero ticker pills ("Service Point"), the carousel arrow and the CTA form card (radius 20, 1px border rgba(255,255,255,.3)).
- Menu overlay backdrop: `backdrop-filter: blur(5px)` + rgba(0,0,0,.25).
- Showreel video: `filter: brightness(0.7)`.

---

## 3. Typography

### Fonts

- **Clash Display** (Fontshare), two weights:
  - 600: `…/fontshare/wf/FPDAZ2S6SW4QMSRIIKNNGTPM6VIXYMKO/5HNPQ453FRLIQWV2FNOBUU3FKTDZQVSG/Z3MGHFHX6DCTLQ55LJYRJ5MDCZPMFZU6.woff2`
  - 700: `…/BFBSY7LX5W2U2EROCLVVTQP4VS7S4PC3/IIUX4FGTMD2LK2VWD3RVTAS4SSMUN7B5/53RZKGODFYDW3QHTIL7IPOWTBCSUEZK7.woff2`
  - Fallback face "Clash Display Placeholder": `local(Arial)`, ascent 83.42%, descent 23.43%, line-gap 8.44%, size-adjust 106.69%.
  - Free alternative: load from `api.fontshare.com/v2/css?f[]=clash-display@600,700`.
- **Inter** (Framer-hosted; weights 400/500/600/700/900, normal + italic, 7 unicode-range subsets each). The Latin subset files are:
  - 400 `GrgcKwrN6d3Uz8EwcLHZxwEfC4.woff2`
  - 500 `UjlFhCnUjxhNfep4oYBPqnEssyo.woff2`
  - 600 `yDtI2UI8XcEg1W2je9XPN3Noo.woff2`
  - 700 `syRNPWzAMIrcJ3wIlPIP43KjQs.woff2`
  - 900 `rZ5DdENNqIdFTIyQQiP5isO7M.woff2`
  - Google Fonts Inter is equivalent.

### Text style presets (class `framer-styles-preset-*`)

Sizes are Desktop / Tablet / Phone.

| Preset (class) | Used for | Family | Size D / T / P | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|---|
| `pyqs7i` (pjLo7VMyF) | **Section H2s** ("Strategic creative Services", "From Vision to Reality", "Trusted by Clients Worldwide", "Collaboration Options"), "SHOWREEL", "//2026©" | Clash Display | 48 / 42 / 34px | 700 | 120% | 0 | #fff |
| `12cv170` (G3O9TxB73) | Big numbers ("100%", "130+"), prices "$990", project year "2026" | Clash Display | 36 / 32 / 26px | 600 | 120% | 0 | #fff |
| `1268ber` (B7H9C7F7D) | About statement H2, service titles "01." / "Brand Identity", CTA "Let's Talk" | Inter | 32 / 28 / 24px | 700 (bold 900) | 130% | 0 | #fff |
| `zm2hix` (UXaKkFnQD) | Hero H1 "We Helping Brands…", stat labels, button labels | Inter | 18px | 500 | 148% | 0 | #fff |
| `1t1q47u` (CWwcz7y20) | Lead paragraphs, badge text, card titles, bullet items | Inter | 20 / 17 / 16px | 500 | 132% | -0.02em | #fff |
| `1p07c7a` (t96mmdGJe) | Body copy, labels, "4 Services" counters, footer headings | Inter | 16px | 400 | 1.6em | -0.02em | **#bdbdbd** |
| `15yfpro` (I9wJfkPdK) | Small UI ("01/03", Monthly/Annually) | Inter | 14px | 400 | 128% | 0 | #fff |
| `75gyxi` (ZfaPI2ipr) | Project category tags | Inter | 16px | 600 | 132% | -0.02em | #fff, **uppercase** |

Code-component fonts:
- Menu overlay links: Clash Display 54px/700/150%.
- Menu button, footer links, nav email: Inter 16–18px/400–500/150%.
- Live clock: Inter 16px/400/1em, 12h format with seconds.

---

## 4. Section map (desktop 1440 viewport, live page positions)

| # | Section (data-framer-name) | Page top | Notes |
|---|---|---|---|
| — | **Navber** (template, `framer-1abknys`) | 0 | `position:absolute` (NOT fixed; scrolls away), padding 20px, z 10, max-width 1440, row space-between, left group gap 100px |
| 1 | **Hero** (`framer-xh78z6`) | 0 | `sticky; top:0; height:100vh; padding: 0 20px 50px; justify-content:flex-end; overflow:hidden; z 1` |
| 2 | **About** (`framer-1wdx214`) | 900 | bg #0d0d0d, z 2, padding 40px 20px; contains absolute **Overlap Detailing** (834px) |
| 3 | **Parthers** (`framer-wjx915`) | ~1530 | padding 60 20 40; badge + "Who Trust Us!" + logo ticker |
| 4 | **Services** (`framer-1dbwxvu`) | ~1988 | padding 100 20 40; heading row + 4 accordion cards (gap 24) |
| 5 | **Work Process** (`framer-1rvp0z6`) | ~2948 | 4 sticky rows (`top:240px`) forming a staircase of cards |
| 6 | **Projects** (`framer-4s4kie`) | ~5173 | 3 project rows (980px cards) separated by gradient lines |
| 7 | **Pricing** (`framer-s95v9r`) | ~7158 | padding 100 20 140; pricing component 960px |
| 8 | **Demo / Showreel** (`framer-13y5ny3`) | 8108 | sticky 100vh stage (`framer-1fa7yl`) + 300vh spacer (`framer-7hdzat`), total 3600px |
| 9 | **Testimonials** (`framer-1q1e0mn`) | ~11712 | 3-card slider + Previous/Next tabs |
| 10 | **CTA** (`framer-1ttxcj1`) | ~12911 | full-bleed bg photo + glass contact form; padding-top 380px |
| — | **Footer** (template) | ~13876 | newsletter, menu, socials, contacts, giant wordmark SVG, orange glow |
| — | **Smooth Scroll** (code component) | — | Lenis intensity 18 |

---

## 5. ANIMATION PARAMETER CATALOG

Abbreviations:
- **S(d, b)** = Framer spring `{type:"spring", duration:d, bounce:b}`. Bounce 0 means critically damped; resolved values are in §7.
- **SK(k, c, m)** = spring with stiffness k, damping c, mass m.
- **T(d, ease)** = tween.
- "Appear": runs on page load. Framer's optimized appear writes the initial inline style into the SSR HTML, then animates by WAAPI handoff.
- "InView": Framer `styleAppearEffect`. It triggers when the visible fraction ≥ threshold, where fraction = intersectionHeight / min(elementHeight, viewportHeight). `animateOnce: true` everywhere.
- "ScrollTarget": `styleTransformEffect` with trigger `onScrollTarget`. It interpolates linearly between targets over a scroll range and is smoothed by SK(500,60,1).
- "ScrollInView": trigger `onInView`. Progress runs from `start end` to `end end` of the element.
- "Parallax": y = −scrollY × (speed/100 − 1), using page scrollY (adjustPosition false), so it is not relative to the element.

### 5.1 Hero intro (appear animations: `__framer__appearAnimationsContent`)

| Element (appear-id / class) | Content | Trigger | From | To | Transition |
|---|---|---|---|---|---|
| `2h1i6h` hero bg image | full-bleed portrait photo (7676×3684), `position:absolute; inset:0; z 0` | Appear | opacity .001, **scale 1.2** | opacity 1, scale 1 | **T(1s, [.44,0,.56,1])** delay 0 |
| `1abknys` Navber | logo + location/clock + email + Menu button | Appear | opacity .001, **y -40** (with `translateX(-50%)` template) | 1, y 0 | **S(1, 0)** delay **0.2s** |
| `1e7prn6` giant wordmark SVG | "PORTVIO" 1426×185 (aspect 7.708), white, width 100% (max 1440) | Appear | opacity .001, **y 52** | 1, 0 | **S(1, 0)** delay **0.4s** |
| `i0ax6h` headline block | 24px plus-icon + H1 "We Helping Brands Build Better Digital Experiences Through Design." (Inter 18/500); abs `left:240px; top:260px; width:280px`, gap 20 | Appear | opacity .001, **x -40** | 1, 0 | **S(1, 0)** delay **0.8s** |
| `hjrwck` hero paragraph | "We partner with brands…" (preset 1t1q47u), max-width 540 | Appear | opacity .001, **y 40** | 1, 0 | **S(1, 0)** delay **0.8s** |
| `1lxdaqv` hero ticker | 5 glass pills "Product Design" | Appear (React, not optimized) | opacity .001, y 40 | 1, 0 | **S(0.8, 0)** delay **1.2s** |
| `lnbv0c` hero image carousel | "Hero Image carousels" 168×134; abs `right:240px; top:260px` | Appear | opacity .001, **x 40** | 1, 0 | **S(1, 0)** delay **1.2s** |
| `n0ccwk` "Made in Framer" badge | Framer badge (ignore) | Appear | opacity .001, y 10 | — | — |

Tablet: headline `left:100px`, carousel `right:100px`. Phone: both become relative and stack above the wordmark, hero gap 80px, padding 0 16 50.

### 5.2 Hero scroll behaviour (Hero section `framer-xh78z6`)

| Component | Trigger | From | To | Params |
|---|---|---|---|---|
| Hero section (whole sticky stage) | **ScrollTarget**, ref = About section, `transformViewportThreshold: 1` | scale 1, y 0 | **scale 0.7, y -80** | Range = [About.top − vh − 1, that + About.height]. At 1440×900 that is **scroll 0 → ~630px**, linear, smoothed by SK(500,60,1). |
| Hero section | **Parallax** speed **110** | — | y = **−0.1 × scrollY**, added on top | Verified live: at scroll 700, `translateY(-150px) scale(0.7)` = -80 + (-70) |
| Hero ticker (`1lxdaqv`) | Ticker | — | continuous | velocity **40 px/s**, direction left, gap **8px**, hoverModifier 100% (no slow-down on hover), not draggable, align center, overflow hidden + edge-fade mask |
| Ticker pill ("Service Point") | static | — | — | padding 10px, radius 10, bg rgba(255,255,255,.2), backdrop blur(10px), text preset 1p07c7a in white, 132×46 |

### 5.3 Section transition: "Overlap Detailing" (curtain wedge)

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| `framer-1a3i3ex` "Filler": #0d0d0d block, 100% × 834px, inside `framer-1u94ioe` (absolute top:0 of About) | **ScrollInView** (offset `start end` → `end end`) | skewY 0, y 0 | **skewY 7deg, y -220px** | Linear in progress, smoothed. Live: scroll 0 gives none, 100 gives -26.4px / 0.84deg, 834 gives -220 / 7deg. |

Combined effect: while the hero shrinks behind, the dark About sheet rises with a 7° slanted top edge.

### 5.4 About section

| Element | Trigger | From | To | Transition |
|---|---|---|---|---|
| Portrait card `framer-18f7ypm` (450×550, radius 16, overflow hidden) | InView th .5 | opacity 0, **x -50** | opacity 1, x 0 | S(1.2, 0) delay **.2** |
| Portrait image `framer-1xm7h94` (height 125%) | Parallax speed **90** | — | y = **+0.1 × scrollY** | (Phone: disabled) |
| Badge "About Us" | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| H2 statement "At our *innovative agency*, we design…" ("innovative agency" in #f65802) | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay **.3** |
| Stat card 1 "100% / Success Score" + arrow icon (rotate 90°) | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay **.3** |
| Stat card 2 "130+ / Project Launched" | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay **.4** |
| Paragraph + "Contact Us" Main Button | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay **.3** |

Layout: row gap 100px, max-width 1440. Tablet: column, gap 50, image 400px tall.

### 5.5 Partners

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Heading group (badge "Valuable Partners", "Who Trust Us!", arrow) | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| Logo ticker `framer-zycb2v` (6 SVG logos, 40px tall) | Ticker | — | — | **50 px/s**, gap **6px**, hover 100%, edge mask 7.2% / 92.8%. Phone: ticker disabled. |

### 5.6 Services (accordion)

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Heading row ("Services" badge / H2 left / "4 Services") | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| Services wrapper (4 cards, gap 24) | InView .5 | **opacity 0, scale .8, y 30** | 1, 1, 0 | S(1.2,0) delay **.3** |
| Service card (`Services`, scope `framer-H1RmS`) | **click** toggles Open ↔ Closed. **All 4 start Closed.** | Closed: bg transparent, height min-content, image + bullet list collapsed to 1px and opacity 0 | Open: bg #232222, height 348px, padding 50, image 240×280 (radius 12) and bullets fade to opacity 1 | layout spring **S(0.8, 0)** |
| Service card hover (Closed only) | hover | bg transparent | **bg rgba(35,34,34,.7)** | S(0.8,0) |
| "Services Arrow Button" (60×60 circle) | variant follows card | Open: bg #f65802, plus icon rotate 0 | Closed: bg #2f2e2d, icon **rotate 135°** | S(0.4, 0.2) |
| Bullets | — | 10px orange dots + preset 1t1q47u text, gap 10 | — | — |

Card content: number "01." (54px column) + title (Inter 32/700) + description (#bdbdbd), gap 60/130.

### 5.7 Work Process (sticky staircase)

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Heading ("Work Process" badge + H2 centered) | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| 4 rows `framer-touzc3 / rlebok / 4gh3fv / w7szbz` | CSS | — | — | each row `position: sticky; top: 240px`, gap 50 between rows. Each row has 4 equal columns, and the card sits in column 1/2/3/4 respectively (Blank divs elsewhere), giving a **diagonal staircase that stacks while scrolling**. |
| Process card wrapper (`Process-card`) | InView **threshold 0** | **opacity 0, scale .8, y 60** | 1, 1, 0 | **SK(300, 100, 1)**, heavily overdamped (ζ≈2.9, settles in ~2.2s) |
| Process Card (360×423) | static | — | — | bg #232222, border 1px #3c3c3c, radius 12; orange 50×5 pill tab at top-left (left 26); header row "//01" + title, padding 32 26, bottom border; inner panel gradient #303030, radius 10, padding 26 20, gap 150; three 8px dots (rgba(255,255,255,.2)) + paragraph |

### 5.8 Projects

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Heading row | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| Project rows 01 / 02 / 03 (row = card + "2026" year, alternating sides) | InView .5 | **opacity 0, scale .8, y 30** | 1,1,0 | S(1.2,0) delay .2 |
| Project card (`Projects`, 980w, scope `framer-Mlf2t`) | — | — | — | bg #232222, border #3c3c3c, radius 16, overflow hidden. Tags row (3 category tags, gap 6, padding 20). Image window **360px** tall (Phone 260). Footer row: name (preset 1t1q47u) + description (max 400). |
| Cover image `framer-1wccaif` (height **280%** of window) | Parallax speed **90** | — | y = +0.1 × scrollY | Phone: disabled, height 100% |
| Hover overlay image `framer-1ophb55` (absolute inset 0, z 1) | **hover** | opacity 0, scale 1 | **opacity 1, scale 1.1** | **S(0.6, 0)** |
| Divider lines | — | — | — | 1px gradient lines between rows (direction alternates) |

Projects come from a CMS. Card names: Vertex Studio, Elysian, Velora. Tags: Website, Branding, App, Digital, Agency, Marketing, Social Media, Brand. Link goes to a project detail page.

### 5.9 Pricing

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Info heading | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| Pricing component (960w) | InView .5 | opacity 0, scale .8, y 30 | 1,1,0 | S(1.2,0) delay .3 |
| Monthly/Annually toggle | click | knob (16px orange pill inside a 44×24 track, 1px #3c3c3c border, radius 100) `left:4px` | `right:4px`; active label white, inactive #bdbdbd; price "$990" → "$690" | layout **SK(500, 60, 1)** |

### 5.10 Showreel (Demo): the pinned zoom

Structure:
- `framer-13y5ny3` (bg #0d0d0d, z 2) contains `framer-1fa7yl` (`height:100vh; position:sticky; top:0; pointer-events:none`).
- It is followed by spacer `framer-7hdzat` (**height 300vh**).
- All of the following use ScrollTarget with ref = spacer, threshold 1. Range = [spacer.top − vh, spacer.top − vh + 300vh], linear.

| Element | From | To | Notes |
|---|---|---|---|
| Video holder `framer-m4jcb4` (abs inset 0, radius 20, overflow hidden) | **scale 0.2** | **scale 1** | live: scroll 8108 → 10808 at 1440×900 |
| Video `framer-1s1k84e-container` (brightness .7) | **scale 1.8** | **scale 1** | counter-zoom, so the image stays roughly the same apparent size while the frame opens |
| "SHOWREEL" text (Clash 48/700, `mix-blend-mode: hard-light`, z 2) | **x -1200** | x 0 | slides in from left |
| "//2026©" text (same style) | **x +1200** | x 0 | slides in from right |

Video: `f0iBHpitdyP4fA1dIsh57nlwCI.mp4` (854×480), autoplay, muted, loop, object-fit cover, no controls, no poster.

### 5.11 Testimonials

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Heading row ("845 Clients") | InView .5 | opacity 0, y 30 | 1, 0 | S(1.2,0) delay .2 |
| Testimonials component | InView .5 | opacity 0, scale .8, y 30 | 1,1,0 | S(1.2,0) delay .3 |
| Card slider | click Prev/Next | 3 cards absolutely offset by ±(width+20px) (desktop **-1220 / +1220**, tablet ±820, phone ±400); inactive cards opacity 0 | active card slides to x 0, opacity 1 | layout **S(0.8, 0)** |
| Testimonials Card (1200w) | static | — | — | padding 20, gap 60; image 524×520 (radius); quote text; name/role; 5 stars (22px orange SVG); "4.9/5.0" pill (white bg) |
| "Testimonials Tab" button (300w, padding 24, bg #232222, border #3c3c3c, radius 10) | **hover** | label at rest, duplicate label parked 30px below (abs) | label moves to top:-30px (out), duplicate slides into place: a **vertical slot-roll** | **S(0.6, 0)**; chevron icon 20px |

### 5.12 CTA

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| CTA section | InView .5 | opacity 0, scale .8, y 30 | 1,1,0 | S(1.2,0) delay .2 |
| Background photo (7676×4144, abs inset 0) | static | — | — | full-bleed; form card sits over it with padding-top 380 |
| Glass form card | static | — | — | bg rgba(255,255,255,.2), backdrop blur 10, 1px border rgba(255,255,255,.3), radius 20. Fields: First/Last name, Email. Submit = "Button 2". |

### 5.13 Buttons and micro-interactions

| Component | Trigger | From | To | Params |
|---|---|---|---|---|
| **Main Button** (`xP_GbhLFW`, "Contact Us", 188×60) | hover | bg #f65802 radius 6, padding 6 24 6 6, gap 14. White 48px square (radius 4) at left 6/top 6/bottom 6 behind the 24px arrow. Text white. | square **expands to inset 2px (fills button)** (live: 48×48 → 183.7×56); arrow **rotate -45°**; text **#0d0d0d** | layout spring **S(0.6, 0)** |
| **Button 2** ("Start a Project" / submit, 240w, padding 16) | hover / press | bg #f65802, radius 6 | hover bg rgba(246,88,2,.85) | **T(0.2s, [.44,0,.56,1])**. States: Loading (20px conic spinner, rotate 360, loop **T(1s, linear)**), Success "Thank you", Error (bg rgba(255,34,68,.15), text #f24), Disabled opacity .5. |
| **Button** (footer Subscribe, 150w inside input) | same as Button 2 | | | |
| **Right Arrow** (hero carousel, 32×134, glass bg .2, blur 10, radius 6) | hover | arrow A at center, arrow B parked at left -24px | A exits to right (-24px), B slides to center | **S(0.6, 0)**; hover bg rgba(255,255,255,.3) |
| **Hero Image carousels** | click arrow | image window 130×110 (radius 8); 3 images in a row, next image parked at right -130px | slides to next (layout); counter "01/03" → "02/03" → "03/03" | **S(0.6, 0)** |
| **Menu Button** (87×24) | click | 3 bars 24×2 white at top 4 / 11 / bottom 4; label "Menu" | open: top bar to top 11 + **rotate -45**; middle bar width 1 + **opacity 0**; bottom bar to bottom 11 + **rotate 45**; label "Close" (text-roll) | **S(0.4, 0.2)** |
| **Email Link** (nav) | hover | 6px white dot + "hello@portvio.com" | text-roll | — |

### 5.14 Text-roll hover (code component used for all links)

Implemented in `script_main` as function `J` (Framer University style "text roll"). Exact deminified code:

```js
// wrapper: hover state on mouseenter/leave
<div onMouseEnter={()=>set(true)} onMouseLeave={()=>set(false)}
     style={{display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:'pointer',perspective:1000}}>
  <motion.div initial="initial" animate={hover?'hover':'initial'}
     style={{position:'relative',whiteSpace:'pre',lineHeight:1,padding:'0 0 2px 0',...font}}>
    <Line text={t} isSecondary={false}/>   {/* position:relative */}
    <Line text={t} isSecondary={true}/>    {/* position:absolute; top:0; left:0 */}
  </motion.div>
</div>
// Line: motion.div variants {initial:{transition:{staggerChildren:stagger}}, hover:{transition:{staggerChildren:stagger}}}
// each char = motion.span {display:'inline-block', transformStyle:'preserve-3d'}
primary   = { initial:{ y:0,      rotateX:0,   opacity:1, transition:{duration:d, ease:'easeInOut'} },
              hover:  { y:'-100%',rotateX:90,  opacity:0, transition:{duration:d, ease:'easeInOut'} } }
secondary = { initial:{ y:'100%', rotateX:-90, opacity:0, transition:{duration:d, ease:'easeInOut'} },
              hover:  { y:0,      rotateX:0,   opacity:1, transition:{duration:d, ease:'easeInOut'} } }
```

`easeInOut` in motion = `cubic-bezier(0.42, 0, 0.58, 1)`. Instances:

| Where | Text | Font | stagger | duration |
|---|---|---|---|---|
| Menu Button label | Menu / Close | Inter 18px 500, lh 132% | 0.025 | 0.2 |
| Nav Email Link | hello@portvio.com | Inter 16 400 lh 150% | 0.025 | 0.2 |
| **Menu overlay links** | Home / About / Services / Projects / Contact | **Clash Display 54px 700, lh 150%** | 0.03 | **0.3** |
| Menu overlay contacts/socials | email, phone, Youtube, Instagram, Twitter / X | Inter 16 400 | 0.025 | 0.2 |
| Footer menu / socials / contacts | Home, About, Services, Projects, Facebook…, contact@…, phone, info@… | Inter 18 400 lh 150% | 0.025 | 0.2 |
| Defaults (component) | — | Inter 48/700 | 0.03 | 0.4 |

### 5.15 Menu overlay (template, opened by Menu Button)

| Layer | initial | animate | exit | Transition |
|---|---|---|---|---|
| Click-catcher `framer-n8f2ku` (fixed inset 0, z 9) | opacity 0 | 1 | 0 | T(0) |
| Backdrop `framer-3j9n8p` (fixed, blur 5px, rgba(0,0,0,.25)) | opacity 0 | 1 | 0 | **S(0.4, 0)** |
| Panel `framer-1ijdcjf` (fixed right 0, **width 45%** (tablet 64%, phone full width), bg #0d0d0d, padding 0 40) | **x 560, opacity 0** | x 0, opacity 1 | x 560, opacity 0 | **S(0.6, 0)** |
| Link 1 "Home" | y 100 | y 0 | y 100 | **T(0.8s, [.645,.045,.355,1])** delay **0** |
| Link 2 "About" | y 100 | 0 | 100 | same, delay **.05** |
| Link 3 "Services" | y 100 | 0 | 100 | delay **.10** |
| Link 4 "Projects" | y 100 | 0 | 100 | delay **.15** |
| Link 5 "Contact" | y 100 | 0 | 100 | delay **.15** |

Each link wrapper has `overflow:hidden`, so the y:100 → 0 reads as a **masked line reveal** (`easeInOutCubic`). Esc dismisses the overlay and page scroll is not blocked. Below the links: a "Contact" column (email, phone) and a "Socials" column, gap 24.

### 5.16 Custom cursor (template)

```js
cursor "8xaevz" = { component: Curser /* 14×14, bg #fff, radius 100, mix-blend-mode:difference */,
  offset:{x:16,y:16}, placement:'bottom', alignment:'center',
  transition:{type:'spring', stiffness:400, damping:60, mass:1} }
// applied: transform = translate(-50%, 0%) + x/y springs following pointer (+16px each)
// native cursor NOT hidden (placement is set)
```

### 5.17 Footer

| Element | Trigger | From | To | Params |
|---|---|---|---|---|
| Footer layout `framer-1k1kl9a` | InView .5 | opacity 0, scale .8, y 30 | 1,1,0 | S(1.2,0) delay .2 |
| Orange glow blob | static | — | — | see §2 |
| Giant footer wordmark SVG (1138×158) | static | — | — | full width (max 1440), `pointer-events:none` |

Footer content:
- Logo (163×40).
- "Newsletter" heading + "Stay updated with our latest projects and insights." + email input: 60px tall, padding 20, bg rgba(255,255,255,.1), 1px border rgba(255,255,255,.3), radius 8. A Subscribe button (150w) sits inside the input at right 6.
- Menu column, Social column, Location ("4517 Washington Ave. …").
- "© Portvio.", "Created by Olynex in Framer".
- Contacts: "For New Project" and "For General Inquiries".

### 5.18 Smooth scroll

```js
new Lenis({ duration: intensity/10 /* =1.8 */ })   // Lenis 1.1.9 defaults otherwise:
// easing = t => Math.min(1, 1.001 - Math.pow(2, -10 * t)); smoothWheel:true; wheelMultiplier:1; lerp:.1 (unused since duration set)
// raf loop; all same-page a[href*="#"] intercepted -> lenis.scrollTo(hash, {offset: -scrollMarginTop})
// CSS: html.lenis{height:auto} .lenis.lenis-smooth{scroll-behavior:auto!important} .lenis.lenis-stopped{overflow:hidden}
```

Scroll sections (anchors): hero `AiiJBsf5K`, about `hql5E_o85`, services `uxJvxnCaj`, process `MgxaEkdAO`, projects `ECOsTSyTs`, pricing `AFgLB3Whq`, text-trigger `HRSoJCQ13` (the showreel spacer), testimonials `s1ByeBWfD`, cta `CrX8Q5Q6j`.

---

## 6. Shared section-reveal presets (from `HLVJ` module constants)

```js
// enter states
Ts = {opacity:0, x:0, y:30, scale:1}            // headings, text, badges
js = {opacity:0, x:0, y:30, scale:.8}           // cards / components / project rows / CTA
Ns = {opacity:0, x:0, y:60, scale:.8}           // process cards
Cs = {opacity:0, x:-50, y:0, scale:1}           // about portrait
// transitions
$  = {type:'spring', bounce:0, delay:.2, duration:1.2}
Ds = {type:'spring', bounce:0, delay:.3, duration:1.2}
ks = {type:'spring', bounce:0, delay:.4, duration:1.2}
Ps = {type:'spring', stiffness:300, damping:100, mass:1, delay:0}
// effect wiring (all): __framer__styleAppearEffectEnabled, __framer__animateOnce:true, __framer__threshold:.5 (process: 0)
// scroll transforms: __framer__spring = {type:'spring', stiffness:500, damping:60, mass:1}  (duration/ease fields ignored when stiffness present)
```

---

## 7. Springs resolved (motion `findSpring` port)

Settle time is the time until |x−1| < 0.001. Use `cssLinear` from `bundle/springs.json` for exact CSS `linear()` easing with `transition-duration = settle`.

| Config | stiffness | damping | ζ | settle | cubic-bezier approx |
|---|---|---|---|---|---|
| S(1, 0) hero appear | 85.26 | 18.47 | 1.0 | 1.01s | `cubic-bezier(0.28,0.55,0.1,1.05)` |
| S(1.2, 0) section reveal | 59.21 | 15.39 | 1.0 | 1.21s | `cubic-bezier(0.28,0.55,0.1,1.05)` |
| S(0.8, 0) accordion / slider | 133.21 | 23.08 | 1.0 | 0.81s | `cubic-bezier(0.28,0.55,0.1,1.05)` |
| S(0.6, 0) button / card hover / menu panel | 236.82 | 30.78 | 1.0 | 0.63s | `cubic-bezier(0.28,0.6,0.1,1.05)` |
| S(0.4, 0) backdrop | 532.85 | 46.17 | 1.0 | 0.44s | `cubic-bezier(0.28,0.65,0.1,1.05)` |
| S(0.4, 0.2) component default | 505.61 | 35.98 | 0.8 | 0.42s (~1.3% overshoot) | `cubic-bezier(0.36,1,0.1,1.05)` |
| SK(500,60,1) scroll smoothing / toggle | 500 | 60 | 1.34 | 0.72s | `cubic-bezier(0.22,0.85,0.15,1)` |
| SK(400,60,1) cursor | 400 | 60 | 1.5 | 0.93s | `cubic-bezier(0.2,0.9,0.2,1)` |
| SK(300,100,1) process card | 300 | 100 | 2.89 | 2.24s | `cubic-bezier(0.16,0.95,0.25,1)` |

S(1,0) as CSS: `linear(0, 0.0624, 0.1884, 0.3303, 0.4648, 0.582, 0.679, 0.7567, 0.8175, 0.8643, 0.8997, 0.9264, 0.9458, 0.9606, 0.9714, 0.9794, 0.9851, 0.9893, 0.9923, 0.9945, 0.9961, 0.9972, 0.998, 0.9986, 1)` over 1.007s.

To match in GSAP:
- S(·,0) ≈ `power3.out` / `expo.out` at the same duration.
- Tween `[.44,0,.56,1]` = `CustomEase "0.44,0,0.56,1"` (a symmetric ease-in-out).
- Menu links `[.645,.045,.355,1]` = easeInOutCubic.
- Scroll-linked transforms: GSAP ScrollTrigger `scrub: ~0.7` reproduces the SK(500,60) smoothing.

---

## 8. Media asset inventory → placeholders needed for the personal portfolio

All images use `object-fit: cover` (Framer `fit:"fill"` = cover in a box).

| # | Slot (where) | Original asset | Native px | Rendered @1440 | Placeholder to generate for Vinul |
|---|---|---|---|---|---|
| 1 | **Hero background** (full-bleed, behind wordmark, scale 1.2→1 intro) | `AHPnc6YiMuMXhiBySyjw0qgHoA.png`: male profile silhouette, side view facing right, deep orange→red gradient studio backdrop, rim light | 7676×3684 (≈2.08:1) | 1440×900 cover | **Hero portrait**: Vinul side-profile silhouette on orange (#f65802) → deep red gradient, cinematic rim light, wide 21:10, subject right of centre |
| 2 | **Hero wordmark** (SVG, white) | `Wc48IIs6LdkkLjH1XVty5GvEaM.svg` "PORTVIO" | 1426×185 | 1400×182 | Typeset "VINUL" / "GAJAMAN" as SVG or live Clash Display 700 text (no image needed) |
| 3 | Hero headline icon | `NRF0tW7yTOJIEo3rKGkoh8nKlQ.svg`, 4-square "plus" glyph, white | 26×26 | 24×24 | inline SVG |
| 4-6 | **Hero image carousel** (3 thumbs, 130×110, radius 8) | `Qz7ecoArbb…png` (528×448), `VRhe2sNM…png` (960×1200), `gOFtUjKT…png` (1200×1200) | — | 130×110 | 3 small work/self thumbnails (e.g. app screenshots, Vinul at desk, mobile mockup); 6:5 crop |
| 7 | **About portrait** (450×550 card, radius 16, image 125% tall, parallax) | `AUs32OMpRIL0FTRvZCVrQNSlo.png`: male profile with glowing orange VR visor, orange bg | 1804×2192 (≈0.82) | 450×688 | **Vinul portrait #2**: futuristic/tech side portrait, orange monochrome, 4:5 |
| 8 | Badge star icon | `EuBNwgYlZ9zdPU3q11pQSlRv7g.svg`: 4-point sparkle, #F65802 | 18×20 | 18×20 | inline SVG |
| 9-14 | Partner logos (ticker, 40px tall, white SVG) | 6 SVGs: 140, 131, 91, 78, 100, 123 × 40 | — | — | tech-stack logos (React, Flutter, Node, AWS, Firebase, etc.) as white SVG |
| 15-18 | **Services accordion images** (240×280, radius 12) | `jflgvl1F…` 1182×1200, `WWpItbNy…` 1200×679, `9wLOGnTU…` 965×1200, `LCHDTMLO…` 904×1200 | — | 240×280 | 4 service visuals (Web dev, Mobile dev, Backend/Cloud, UI/UX) in orange-dark style, 6:7 |
| 19-21 | **Project covers** (980×360 window, image 280% tall = ~1008px, parallax) | `h8wWS2MvyQGfW4SBYh7XMv5vg.png` 960×1200, `IC9dMb9n…` 904×977, `C32BknvL…` 673×1200 | — | 980×1008 | 3 project cover images (portrait ≈4:5 tall; only a 360px band visible) |
| 22-24 | **Project hover images** (overlay, fade + scale 1.1) | `nIs9xyBB…` 904×1200, `T6zUCcpW…` 904×1200, `pdXtsCBp…` 904×1200 | — | 980×360 | 3 alternate project shots (UI close-ups) |
| 25 | **Showreel video** (sticky zoom 0.2→1, brightness .7) | `f0iBHpitdyP4fA1dIsh57nlwCI.mp4` (854×480, 2.0 MB, loop, muted) | 854×480 | full viewport | **Showreel video**: 16:9 loop of Vinul coding / app demos / orange abstract, 8–15s, ≥1920×1080 |
| 26-28 | **Testimonial portraits** (524×520) | `k6DKu3WI…` 2596×3892, `GHtPElWr…` 800×1200, `BbtjHcg7…` 606×904 | — | 524×520 | 3 client/colleague portraits (or abstract avatars), ~1:1 |
| 29 | Star rating icon | `qkIOOcD3…svg` (22×22) | — | 22×22 | inline SVG |
| 30 | **CTA background** (full-bleed behind glass form) | `25D5KEITGsRMOPekQf2Swwgbhak.png`: male silhouette, looking down, motion-blur ghost, orange/red radial glow | 7676×4144 (≈1.85:1) | 1440×869 | **Vinul silhouette #3** with motion-blur double exposure, orange halo, wide 16:9 |
| 31 | Nav logo (SVG) | `6IFOP90um4f0aFgVOXGiGBToko.svg` | 161×36 | 143×32 | "VG" monogram / name logotype SVG |
| 32 | Footer logo (SVG) | `yo7S8ua6enac5olitkmeuyARLjc.svg` | 163×40 | 163×40 | same logotype |
| 33 | Footer giant wordmark (SVG) | `mgHCHEZBYVnHML8zA2ikTOHsM8.svg` | 1138×158 | 1400×194 | giant name SVG/text |
| 34 | Footer credit avatar | `kVN1t8qE…jpg` | 2048² | 18×18 | (drop) |
| 35 | Spinner mask | `pGiXYozQ…svg` 20×20 | — | — | inline |

The art direction is consistent: dark (#0d0d0d) UI, a single orange accent, and photographic portraits that are **monochrome orange/red, silhouetted, rim-lit, side-profile**. Image-generation prompts for Vinul's reference photo should keep that look: "cinematic side-profile silhouette, deep orange #f65802 to crimson gradient backdrop, strong rim light, high contrast, minimal, editorial".

---

## 9. Implementation notes for the rebuild (React + Framer Motion or GSAP)

- **Hero:** `section { position: sticky; top: 0; height: 100vh }`. Map `useScroll` progress over [0, aboutHeight] to scale [1, .7] and y [0, -80]. Add `y += scrollY * -0.1`. Smooth everything through `useSpring({stiffness:500, damping:60})`.
- **Curtain:**
  - Later sections get `position: relative; z-index: 2; background: #0d0d0d`.
  - Inside About, add an absolute 100% × 834px dark block.
  - Use `useScroll({target, offset: ['start end','end end']})` and map progress to skewY 0 → 7deg and y 0 → -220.
- **Reveals:** `whileInView={{opacity:1,y:0,scale:1}} initial={{opacity:0,y:30,scale:.8}} viewport={{once:true, amount:.5}} transition={{type:'spring', bounce:0, duration:1.2, delay:.2}}`.
- **Showreel:**
  - Wrapper with a sticky 100vh stage, then a 300vh spacer.
  - Progress = scroll from spacer.top − vh to spacer.bottom − vh.
  - Map progress: frame scale .2 → 1, video scale 1.8 → 1, texts x ∓1200 → 0.
  - Texts: `mix-blend-mode: hard-light`.
- **Tickers:** CSS marquee. Hero: 40 px/s, gap 8, masked edges 10/88%. Logos: 50 px/s, gap 6, mask 7/93%. No hover slow-down.
- **Text-roll:** split characters, two stacked layers, 3D flip (see §5.14).
- **Lenis:** `duration: 1.8, easing: t => Math.min(1, 1.001 - 2 ** (-10 * t))`.
- **Cursor:** 14px white dot, `mix-blend-mode:difference`, spring 400/60, offset (16,16), `translate(-50%,0)`.
- **"More premium than Portvio" ideas, consistent with the source vocabulary:**
  - Masked line-reveal (y 100% → 0, easeInOutCubic 0.8s) on the section H2s, which currently only fade up.
  - Cursor grows and shows "View" on project cards.
  - Magnetic pull on the Main Button.
  - Subtle grain overlay.
  - Orange radial glow following the cursor on dark sections.
  - The source already uses the masked line-reveal in the menu links, so it fits the style.
