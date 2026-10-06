# Portvio (portvio.framer.website): scroll and load motion spec

Role: SCROLL + LOAD MOTION scraper. Captured 2026-10-05 with Playwright 1.63 / Chromium. Desktop is 1440x900 and mobile is 390x844.
Raw evidence is under `research/portvio/motion/`. The folder holds videos, about 190 screenshots, JSON samples and analysis text. The JS bundles are in `motion/raw/`.

Two kinds of source back every number below:
- **[code]**: read straight out of the Framer page bundle (`raw/js-HLVJ-*.mjs`, `raw/js-script_main.*.mjs`, `raw/detail/js-M0Wsi4*.mjs`) or out of the `__framer__appearAnimationsContent` JSON (`raw/appear.json`).
- **[measured]**: computed styles sampled every rAF or every 45 to 50 ms, plus scroll stepping.

---

## 0. Global motion system

| Item | Value | Source |
|---|---|---|
| Smooth scroll | **Lenis** (the `<html class="lenis">` class is added). Framer University "Smooth Scroll" component, `intensity: 18`, giving `new Lenis({ duration: 18/10 = 1.8 })` with the default Lenis easing `t => Math.min(1, 1.001 - 2**(-10*t))` (expo-out). It also intercepts same-page `#anchor` links and calls `lenis.scrollTo(target, {offset: -scrollMarginTop})`. Any element with `overflow:auto` gets `data-lenis-prevent`. | [code] shared-lib @40802, page @264501 |
| Lenis feel | A single 100 px wheel tick moves 44 px @200 ms, 82 @512, 95 @814, 99 @1.2 s and 100 @1.6 s. A 500 px tick moves 443 @300 ms, 551 @612, 593 @1.1 s and 600 @1.8 s. This is a long inertial glide. | [measured] `videos/lenis-inertia.json` |
| Page background | `#0d0d0d` (rgb 13,13,13), token `--token-eb657201…`. It is constant across the whole page, so **no section background-colour transitions** happen. Cards use `rgb(35,34,34)`. The accent orange is around `#ff5a1f` (see the colour role for the exact value). | [measured] |
| Appear "fade-up" (default for almost every block) | `initial {opacity:0, y:30}` (some add `scale:0.8`), `animate {opacity:1, y:0, scale:1}`. Transition: spring `{bounce:0, duration:1.2, delay:0.2 / 0.3 / 0.4}`. Trigger: **50 % of the element visible** (`threshold:.5`), **once** (`animateOnce:true`). It does not replay when you scroll back up (verified in the up-scroll pass). | [code] + [measured] |
| Framer duration-spring conversion | `{type:spring, bounce:0, duration:1}` fits a critically damped spring with ω about 10 rad/s, i.e. **stiffness 100, damping 20, mass 1**. 50 % at about 170 ms, 90 % at about 390 ms, 99 % at about 660 ms. Rule of thumb: ω = 10/duration. That gives d 1.2 → k 69 / c 16.7, d 0.8 → k 156 / c 25 and d 0.6 → k 278 / c 33.3. bounce 0.2 / d 0.4 is about k 625 / c 40. The nearest CSS curve is `cubic-bezier(0.22,1,0.36,1)` over the duration. | [measured] fit of the hero tagline curve |
| Scroll-linked transform smoothing | Every scroll-driven transform passes through a spring `{stiffness:500, damping:60, mass:1}` (ζ 1.34), so the values trail the scroll position by a few frames. | [code] `__framer__spring` |
| Parallax | Framer `speed` parallax. `translateY = (1 - speed/100) * scrollY` relative to the page top (`adjustPosition:false, offset:0`). speed 90 gives **+0.10 px per px scrolled** (the element lags). speed 110 gives **-0.10 px/px** (the element leads). This is disabled on phone for the image parallaxes. | [code] + [measured] |
| Custom cursor | A fixed 14x14 white dot (`Variant 1`, `framer-8xt4lf`), opacity 0 until the pointer moves. It follows the pointer with a spring `{stiffness:400, damping:60, mass:1}` and a cursor `offset {x:16,y:16}` (it settles in about 1.2 s). | [code] script_main `Or`, [measured] menu frames |
| Page transitions | **None.** Framer client-side routing: the URL changes about 370 ms after the click, and the new page swaps in at about 970 ms with an instant scroll-to-top. There is no fade, slide or overlay on `main` (opacity 1, transform none all the way through). The new page's own appear animations play when it mounts. Browser Back restores the previous scroll position (4934 px). | [measured] `transition/transition.json`, `video/project-click-transition.webm` |

---

## 1. Page load and hero intro (home)

There is no preloader. DOMContentLoaded fires at about 290 ms, and Framer's optimized appear script starts at **about 300 ms** (`framer-appear-start`, a WAAPI animator that runs before hydration). Hydration finishes at about 925 ms.
In the table, t is measured from navigation commit. "Start" is the first visible movement and "Settled" is opacity ≥ 0.999.

| # | Element (appear-id) | What it is | From → To | Transition [code] | Start [measured] | Settled [measured] |
|---|---|---|---|---|---|---|
| 1 | `2h1i6h` hero background image (7676 px portrait, full-bleed, y -90 → 0 visual) | Full-bleed photo | opacity 0.001 → 1, **scale 1.2 → 1** | tween **1.0 s**, ease `cubic-bezier(0.44,0,0.56,1)`, delay 0 | 250 ms | 1190 ms |
| 2 | `1abknys` Navbar (logo, "Sydney, Australia" + live clock, `hello@portvio.com`, Menu) | Top bar, absolute, `translateX(-50%)` template | y **-40 → 0**, opacity 0 → 1 | spring d 1.0 bounce 0, **delay 0.2** | 420 ms | 1390 ms |
| 3 | `1e7prn6` giant "PORTVIO®" wordmark (SVG 1400x185 at y 586) | Display wordmark | y **52 → 0**, opacity | spring d 1.0, **delay 0.4** | 620 ms | 1610 ms |
| 4 | `i0ax6h` tagline "We Helping Brands Build Better Digital Experiences Through Design." (top-left, x 240, y 260, with an icon) | Short H1 block | x **-40 → 0**, opacity | spring d 1.0, **delay 0.8** | 1000 ms | 1990 ms |
| 5 | `hjrwck` paragraph "We partner with brands…" (bottom-left) | Body text | y **40 → 0**, opacity | spring d 1.0, **delay 0.8** | 1000 ms | 1990 ms |
| 6 | `lnbv0c` thumbnail slider card + "01/03" counter (right, x 1032, y 260) | Mini slider | x **40 → 0**, opacity | spring d 1.0, **delay 1.2** | 1390 ms | 2420 ms |
| 7 | `1lxdaqv` "Product Design" pill ticker (bottom-right, max-width 550, edge mask) | Marquee | y **40 → 0**, opacity | spring **d 0.8**, delay 1.2, run after hydration (React, not the appear script) | 1990 ms | 2810 ms |

**How the hero text animates.** Each text block moves as one piece. There is no per-letter, per-word, per-line, mask, blur or rotation effect on the home hero. Blocks slide 40 to 52 px along x or y and fade in, with a critically damped spring. The choreography goes background → nav → wordmark → (tagline + paragraph together) → slider → ticker. The gaps are 0.2 / 0.4 / 0.8 / 1.2 s.
Mobile (390x844) runs the same configs and the same order (`load-mobile/`).

Hero idle behaviour [measured, 12 s idle]:
- The background is a still image. There is no video and no autoplay.
- The "01/03" slider does **not** autoplay. Clicking the arrow (1184, 315) sets the counter instantly, and the thumbnail strip slides **-130 px** (one thumb width). That slide is an ease-out spring of about 500 ms with no overshoot: 50 % at about 120 ms, 95 % at about 300 ms (`transition/hero-slider.json`).
- The pill ticker is linear: **40 px/s** leftward (`tickerEffectVelocity:40`, gap 8 px). It loops about every 700 px (17.5 s). **Hover does not slow it** (`hoverModifier:100`; measured 39.97 vs 39.93 px/s). Edge fade mask: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,.9) 10.36%, rgba(0,0,0,.9) 88.29%, transparent 100%)`.
- The navbar clock ticks every second.

---

## 2. Scroll timeline (desktop 1440x900, document height 14463, max scrollY 13563)

### 2a. Section map (document top / height)
Hero 0 / 900 (**sticky top:0**, pinned for the whole page under later sections) → About 900 / 630 (plus the "Overlap Detailing" absolute layer at 900 / 834) → Partners 1530 / 358 → Services 1888 / 875 → Work Process 2763 / 2174 → Projects 4937 / 2043 → Pricing 6980 / 1128 → Demo/Showreel 8108 / 3600 (sticky 900 px container + 2700 px spacer) → Testimonials 11708 / 1060 → CTA 12899 / 807 → Footer 13876 / 549.

### 2b. Scroll-linked (scrubbed) animations [code + measured, settled values]

| Section | Element | Mapping | Scroll range (scrollY) | Rate |
|---|---|---|---|---|
| **Hero → About** (signature transition) | `Hero` section `framer-xh78z6` (sticky top 0) | **scale 1 → 0.70** and **y 0 → -80** (`onScrollTarget`, target = About section). Also parallax speed 110, an extra **-0.1 px/px** for the whole page. | 0 → **630** (progress runs while About moves from entering the viewport bottom until its bottom reaches the viewport bottom, i.e. About's height of 630) | scale -0.000476/px, y -0.127/px (+ -0.1 parallax). Measured: sy 300 → scale .857, ty -68; sy 600 → .714, -136; sy 650+ → .70 and ty = -80 - 0.1·sy |
| Hero → About | `Filler` `framer-1a3i3ex` (a 1440x845 `#0d0d0d` panel in the "Overlap Detailing" layer that rises over the shrinking hero) | **skewY 0 → 7°** plus **y 0 → -220** (`onInView`), linear | 0 → **833** | 0.0084 °/px, -0.264 px/px. Gives the **slanted top-edge wipe**: the dark panel's top edge tilts (left high, right low) as it climbs over the hero. See `scroll-desktop/shots/scroll-00300.png` and `-00600.png` |
| About | image wrapper `framer-1xm7h94` (450x688 holding a 450x550 portrait) | parallax speed 90 | whole page | **+0.10 px/px** |
| Projects | card images `framer-1wccaif` (784x806 inside 288 px-tall windows) | parallax speed 90 (image drifts inside its card mask) | whole page | +0.10 px/px |
| **Demo / Showreel** (pinned) | `Container framer-1fa7yl` sticky top 0, 900 tall; spacer `framer-7hdzat` 2700 tall | pin | about 8109 → 10809 | n/a |
| Demo | `video - holder framer-m4jcb4` (1440x900 natively, radius about 16 px) | **scale 0.2 → 1** | **≈ 8250 → 10950** (2700 px; target = spacer) | +0.000296/px (0.244 @8400, 0.422 @9000, 0.6 @9600, 0.778 @10200, 0.956 @10800) |
| Demo | inner video container `framer-1s1k84e` (looping muted mp4, `object-fit: cover`) | **scale 1.8 → 1** (counter-zoom, so the footage "zooms out" while the frame grows; net scale 0.36 → 1) | same | -0.000296/px |
| Demo | "SHOWREEL" text `framer-1iksf9s` | **x -1200 → 0** | same | +0.444 px/px |
| Demo | "//2026©" text `framer-kyru95` | **x +1200 → 0** | same | -0.444 px/px. The two labels converge onto the centre of the full-screen video (`scroll-10800.png`) |

Ticker-style motion (time-based, not scroll-based):
- Hero pills: 40 px/s.
- **Partners logo ticker**: `framer-zycb2v`, **50 px/s** leftward, gap 6 px, 6 logos, desktop and tablet only (disabled on phone), hover has no effect.

### 2c. Viewport-triggered appear animations (once, threshold 0.5 unless noted)

Spring "1.2/δ" below means `{type:spring, bounce:0, duration:1.2, delay:δ}`. The trigger is the scrollY at which ≥ 50 % of the element is inside the viewport. Ranges are (last scrollY with opacity 0, first scrollY with opacity > 0.01) from the settled 50 px and 300 px passes. "calc" means derived from geometry, because the element had already fired at the first sample.

| Section | Element | From → To | Transition | Trigger (scrollY) | Notes |
|---|---|---|---|---|---|
| About | portrait card `framer-18f7ypm` (450x550, left) | **x -50 → 0**, opacity 0 → 1 | spring 1.2/0.2 | 300–600 (calc ≈ 315) | slides in from the left |
| About | "✦ About Us" badge `framer-1um04sy` | y 30 → 0, op | 1.2/0.2 | ≈ 110 (calc) | |
| About | headline "AT OUR INNOVATIVE AGENCY…" `framer-j8wzdi` (850x125, uppercase, orange highlight words) | y 30 → 0, op | 1.2/0.3 | ≈ 190 (calc) | |
| About | stat "100% Success Score" `framer-1mc23ji` | y 30 → 0, op | 1.2/0.3 | 350–400 | the numbers are **static** (no counter animation; measured) |
| About | stat "130+ Project Launched" `framer-hcrhzd` | y 30 → 0, op | **1.2/0.4** | 450–500 | |
| About | paragraph + CTA `framer-kv3tsk` | y 30 → 0, op | 1.2/0.3 | 550–600 | |
| Partners | "Valuable Partners / Who Trust Us!" `framer-vbe49e` | y 30 → 0, op | 1.2/0.2 | 700–750 | |
| Services | heading block `framer-vjsi5j` | y 30 → 0, op | 1.2/0.2 | 1150–1200 | |
| Services | services panel `framer-b9zxv4` (1120x456) | **y 30 → 0, scale 0.8 → 1**, op | 1.2/0.3 | 1550–1600 | |
| Work Process | heading `framer-9es47i` (**sticky top:100px**) | y 30 → 0, op | 1.2/0.2 | 2100–2400 | it stays pinned while the cards stack |
| Work Process | 4 x `Process-card` (280-ish x 338 to 390) | **y 60 → 0, scale 0.8 → 1**, op 0 → 1 | spring **{stiffness 300, damping 100, mass 1}** (overdamped, about 0.45 s to 95 %), **threshold 0** (fires on the first visible pixel) | ≈ 2250 (calc) / 2800–2850 / 3350–3400 / 3800–3850 | see 2d (sticky staircase) |
| Projects | heading `framer-6k4tlh` | y 30 → 0, op | 1.2/0.2 | 4350–4400 | |
| Projects | cards 01/02/03 (1120x423) | **y 30 → 0, scale 0.8 → 1**, op | 1.2/0.2 | 4750–4800 / 5100–5400 / 5700–6000 | the card's "2026" year label sits to the right |
| Pricing | info block `framer-1jyr7a9` | y 30 → 0, op | 1.2/0.2 | 6300–6600 | |
| Pricing | plan card `framer-7ijtvt` (768x541) | y 30 → 0, scale 0.8 → 1, op | 1.2/0.3 | 6900–7200 | Monthly/Yearly toggle spring `{stiffness 500, damping 60}` |
| Testimonials | heading `framer-akz0j0` | y 30 → 0, op | 1.2/0.2 | 11100–11150 | |
| Testimonials | slider `framer-1xcb530` (1120x524) | y 30 → 0, scale 0.8 → 1, op | 1.2/0.3 | 11550–11600 | |
| CTA | form card `framer-1ttxcj1` (1152x807) | y 30 → 0, scale 0.8 → 1, op | 1.2/0.2 | 12500–12550 | |
| Footer | `Layout framer-1k1kl9a` | y 30 → 0, scale 0.8 → 1, op | 1.2/0.2 | 13350–13400 | footer has 3 ambient glow blobs: `framer-1lkr7m1` 1440x600, **filter blur(50px), opacity 0.6**, static |

Stagger pattern: there is no `staggerChildren` on the page. Sibling order comes from hand-set delays of **0.2 / 0.3 / 0.4 s** plus the geometry (lower elements cross 50 % later).
Phone: the same appear configs apply.

### 2d. Sticky and pinned structures
1. **Hero**: sticky `top:0` for the whole page (it releases only near the footer). Every later section is opaque `#0d0d0d` and slides over the shrunken (scale 0.7) hero, which keeps parallaxing up at 0.1 px/px underneath.
2. **Work Process staircase**: the heading is sticky at `top:100px`. Four `Process-cards` wrappers (1400 wide, heights 423 / 487 / 397 / 423, about 50 px apart) are each `position:sticky; top:240px`. Inside each wrapper the card sits in a different column, x = 20 / 370 / 720 / 1070 (350 px pitch). Cards 2 and 3 sit 25 px lower than cards 1 and 4. As you scroll, each card pops in (spring above) and pins, filling the row **left to right like stairs**. When the 1880 px `Cards-wrapper` ends, all four release together as one row (`scroll-03600.png` shows 3 cards mid-fill; `scroll-04500.png` shows the complete row). The pinned cards are never scaled or dimmed.
3. **Demo/Showreel**: a 900 px sticky container plus a 2700 px spacer, with the scrubbed effects in 2b. On phone the effect is the same; the range is about 2530 px.
4. Phone (390): the Process cards are **not** sticky (a plain vertical list with appear only). Hero sticky + scale (range about 0 → 1130, because About is taller), Filler skew (0 → 833) and the Demo pin all remain.

### 2e. Other scroll checks
- Word-by-word colour or opacity fill on scroll: **none** on the home page.
- Number counters: **none** (100% and 130+ are static).
- Section background colour transitions: **none** (all `#0d0d0d`).
- Card-stack overlap: only the Process staircase and the hero being covered by later sections.
- Horizontal scroll sections: none, other than the Demo labels sliding in on x.

---

## 3. Smooth vs fast scroll videos
- `motion/videos/smooth-full-scroll-25s.webm`: 30 px wheel ticks every 50 ms over 25 s. Lenis glides; the hero shrink and slanted wipe, the staircase and the showreel zoom are all visible.
- `motion/videos/fast-scroll.webm`: 400 px ticks every 40 ms down, then up. Lenis keeps it smooth. Appear animations that were skipped over still fire once and are never undone on the way up.
- `motion/videos/mobile-smooth-scroll.webm`: the same at 390x844.
- `motion/videos/lenis-inertia-test.webm` plus `lenis-inertia.json`: the inertia curve data.

---

## 4. Interaction-driven motion seen during the pass (details belong to the hover/interaction role)
| Element | Motion | Values [code + measured] |
|---|---|---|
| Nav links, email, "Menu", footer links (18 instances) | **Per-letter 3D roll** (code component). Two stacked copies of the text. On hover each letter of copy A goes `y 0 → -100%`, `rotateX 0 → 90°`, `opacity 1 → 0`, while copy B goes `y 100% → 0`, `rotateX -90° → 0`, `opacity 0 → 1`. The parent has `perspective:1000px`, the spans use `transform-style:preserve-3d`, and the text is `line-height:1`. | `animDuration: 0.2 s`, `staggerChildren: 0.025 s`, ease `easeInOut`. Measured: the first letter runs 174 → 362 ms after hover, and 17 letters finish by about 800 ms. It reverses on mouse leave. |
| Menu open (click "Menu") | The overlay panel (648 px wide, `#0d0d0d`, right side) goes `x +560 → 0`, `opacity 0 → 1`. The backdrop `rgba(0,0,0,.25)` plus **`backdrop-filter: blur(5px)`** fades 0 → 1. The menu links (Home / About / Services / Projects / Contact, about 52 px display font) rise from `y 100 → 0` behind a mask, staggered. | Panel: spring d 0.6 bounce 0 (measured: 50 % at about 130 ms, 99 % at about 550 ms). Backdrop: spring d 0.4. Links: tween **0.8 s `cubic-bezier(0.645,0.045,0.355,1)`**, delays **0 / 0.05 / 0.10 / 0.15 s**. The button label changes to "Close" with an X icon (`transition/menu-*.png`, `video/menu-open-close.webm`). |
| Testimonials Prev/Next | The old card exits to `x -1200`. The new card enters from `x 1440 → 20` with `opacity 0 → 1` and a layout-animation scaleX distortion of 0.86 → 1. | About 650 ms, ease-out spring (50 % at about 190 ms) |
| Pricing Monthly/Yearly toggle | Variant swap | spring `{stiffness 500, damping 60, mass 1}` |
| Hero "01/03" arrow | Strip shift of -130 px | about 500 ms ease-out spring |

---

## 5. Project detail page (`/projects/vertex-studio`, document height 3899)

| Element | Animation | Transition | Timing [measured, from nav commit] |
|---|---|---|---|
| Navbar | same as home (y -40 → 0) | spring 1.0/0.2 | 410 → 1410 ms |
| Title "VERTEX STUDIO" `14qmmhe` (huge, extended display font) | x **-30 → 0**, opacity | spring 1.0/**0.2** | 410 → 1350 ms |
| **Description paragraph (top-right)** | **Per-word blur-in text effect.** Each word goes `filter: blur(10px) → 0`, `opacity 0.001 → 1`, `x 20 → 0` | Framer text effect `{type:'appear', tokenization:'word', trigger:'onMount', transition:{type:spring, bounce:0, duration:1, delay:0.05}}`, i.e. a **50 ms stagger per word** | word 1 starts at about 480 ms, each word about 700 ms to 98 % |
| Meta columns: Company Type `l3m1gm`, Timeline `1xf2no4`, Year `eztz35`, Location `61guq4` | y **30 → 0**, opacity | spring 1.0 with delays **0.4 / 0.6 / 0.8 / 1.0** (a 0.2 s cascade) | 620 / 820 / 1020 / 1220 ms start |
| Hero banner image `1ruj539` | y 30 → 0, opacity | spring 1.0/0.8 | 1020 ms |
| Banners (1400x900, 692x720 x 2, 1400x1080) | parallax speed 90 (+0.1 px/px) | n/a | scroll |
| "PROJECT OVERVIEW" block, image pair, full-width image | y 30 → 0, opacity at threshold 0.5, once | spring 1.2/0.2 (one at 0.4) | scroll triggers about 600 / 1200 / 1800 |

Clicking a card from home goes through an SPA route change with no transition animation (see §0). The detail page appear sequence above then plays. It was captured in `transition/click-*.png` (`click-1195ms.png` shows the per-word blur mid-reveal and the title sliding in) and in `transition/video/project-click-transition.webm`.

---

## 6. Rebuild cheat-sheet (to match, then exceed)

```js
// Lenis
new Lenis({ duration: 1.8, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

// Default reveal (Framer Motion)
const reveal = { initial:{opacity:0,y:30}, whileInView:{opacity:1,y:0},
  viewport:{once:true, amount:0.5},
  transition:{type:'spring', stiffness:69, damping:16.7, mass:1, delay:0.2} }; // = Framer spring d1.2 b0
const revealScale = { ...reveal, initial:{opacity:0,y:30,scale:0.8}, whileInView:{opacity:1,y:0,scale:1} };

// Hero intro (spring d1.0 b0 ≈ stiffness 100 / damping 20)
bg:        {scale:[1.2,1], opacity:[0,1]}, tween 1s cubic-bezier(.44,0,.56,1), delay 0
nav:       {y:[-40,0]}, delay .2
wordmark:  {y:[52,0]},  delay .4
tagline:   {x:[-40,0]}, delay .8
paragraph: {y:[40,0]},  delay .8
slider:    {x:[40,0]},  delay 1.2
ticker:    {y:[40,0]},  delay 1.2, spring d0.8   // marquee at 40 px/s

// Hero→About (useScroll target=About, offset ['start end','end end'])
hero: scale [1,0.7], y [0,-80]  + parallax y = -0.1*scrollY ; position:sticky top:0
filler (#0d0d0d, 1440 x ~845): skewY [0,7deg], y [0,-220] over scrollY 0→833
// all scroll transforms smoothed by useSpring({stiffness:500, damping:60})

// Showreel (sticky 100vh + 300vh spacer, useScroll target=spacer)
frame scale [0.2,1]; inner video scale [1.8,1]; 'SHOWREEL' x [-1200,0]; '//2026©' x [1200,0]

// Process staircase: wrappers sticky top 240, cards in 4 columns, card pop spring {k300,c100} from y60 s0.8
// Per-letter roll: 0.2s easeInOut, 0.025s stagger, rotateX 90°, y ±100%, perspective 1000
// Per-word blur-in: blur(10px)→0, x20→0, spring d1, 0.05s/word
```

Ideas for going beyond the reference (the reference does not do these):
- Per-line or per-char mask reveals on the section headings. Portvio only uses block fade-ups.
- Blur-in on the home hero tagline. Portvio uses it only on detail pages.
- A real page-transition overlay. Portvio has none.
- A magnetic cursor that grows over cards. Portvio only has a trailing dot.
- Scroll-velocity skew on the tickers.
- Number counters on the stats. Portvio's are static.
- A word-by-word opacity fill on the About headline.
- Progressive image zoom-out inside the project cards. Portvio only uses parallax there.

---

## 7. Files (research/portvio/motion/)
- `raw/appear.json`: Framer appear-animation map (home). `raw/anim-extract.txt` and `raw/jsgrep.txt`: every animation constant and `__framer__*` prop pulled from the bundles. `raw/js-*.mjs`: the bundles themselves. `raw/detail/`: detail-page bundles and HTML.
- `load-desktop/`, `load-mobile/`, `load-detail/`: `load-XXXXms.png` frames (about every 100 to 200 ms for 3 s), `samples.json` (rAF samples), `timeline.txt` (derived per-element timelines), `video/load-first-5s.webm`.
- `scroll-desktop/`, `scroll-mobile/`, `scroll-detail/`: `shots/scroll-NNNNN.png` (every 300 px) plus idle shots, `scroll-data.json` (pass1 50 px/60 ms, pass2 300 px/800 ms, back-scroll, fine 50 px/450 ms), `analysis-*.txt` (per-element value-vs-scrollY tables).
- `videos/`: smooth, fast and mobile scroll recordings plus the Lenis inertia data.
- `transition/`: project-click frames and video, menu open frames and video, `transition.json` (per-letter hover samples, transition samples), `detail-menu.json`, `menu-analysis.txt`, `hero-slider.json`, `misc.json` (ticker speeds, counters, testimonial transition), `blurtext-detail.json`.
- Scripts: `research/tools/motion-01…17-*.cjs`.

