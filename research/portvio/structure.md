# Portvio (portvio.framer.website): Structure and Design Tokens

Scraped on 2026-10-05 with Playwright (Chromium) at 1440x900 (desktop), 1024x900 (tablet) and 390x844 (mobile).
Everything lives under `research/portvio/structure/`:

| Folder | Contents |
|---|---|
| `shots/` | `<slug>-desktop.png` / `<slug>-mobile.png` (full page), `<slug>-vp-NN.png` (desktop, one per 900px), `home-mobile-vp-NN.png` and `projects__vertex-studio-mobile-vp-NN.png` (mobile, one per 844px), nav and menu state shots (`home-{desktop,mobile}-menu-open-{150,400,900,1600}ms.png`, `home-*-nav-at-<scrollY>.png`) |
| `html/` | Rendered DOM after a slow scroll: `<slug>.html`, `<slug>-mobile.html`, `home-{desktop,mobile}-menu-open.html`, `projects__vertex-studio-*-menu-open.html` |
| `css/` | `home-inline.css` (all Framer `<style>` tags: font faces, tokens, breakpoints, component classes) plus the same for the other pages |
| `fonts/` | Downloaded woff2 files: Clash Display 600 and 700, and the Inter Latin subset in 400/500/600/700/900, normal and italic |
| `data/` | `<slug>-tokens.json` (computed text styles, colors, radii, shadows, filters, gradients, layout tree, media) at 3 widths. `<slug>-probe.json` (every named component with its computed style, sticky and fixed elements at 5 scroll positions, menu-open DOM). `home-extra.json` (pseudo-element borders, `--border-*` vars, glass surfaces, inputs, menu text styles). `home-detail.json`, `home-misc.json` |
| `text/` | Full visible copy per page in DOM order, tagged with the Framer layer path |

Scripts: `research/tools/struct-*.cjs` (crawl, tokens, probe, extra, detail, text, fonttest, dump).

---

## 1. Site map

| Slug | URL | Status | Desktop height | Mobile height | Screenshots |
|---|---|---|---|---|---|
| home | `/` | 200 | 14,606px | 15,203px | `home-desktop.png`, `home-vp-01..17.png`, `home-mobile.png`, `home-mobile-vp-01..19.png` |
| projects__vertex-studio | `/projects/vertex-studio` | 200 | 3,899px | 4,358px | `projects__vertex-studio-desktop.png`, `-vp-01..05`, `-mobile.png`, `-mobile-vp-01..06` |
| projects__elysian | `/projects/elysian` | 200 | 3,976px | n/a | `projects__elysian-desktop.png`, `-vp-01..05`, `-mobile.png` |
| projects__velora | `/projects/velora` | 200 | 3,976px | n/a | `projects__velora-desktop.png`, `-vp-01..05`, `-mobile.png` |
| 404 | `/404` and any unknown path | 404 | 1,386px | n/a | `404-desktop.png`, `404-vp-01..02`, `404-mobile.png` |

There are no other pages: no about, contact or blog route. Navigation links are anchors on the home page: `./#hero`, `./#about`, `./#services`, `./#projects`, `./#cta`. Detail pages link back with `../#…`.

Meta tags: the title is "Portvio - Minimal & Bold Portfolio Framer Template" and `lang="en"`. The favicon is the orange "P" PNG. Ignore the "Made in Framer" badge (fixed, bottom right, 140x38) because it is not part of the design.

---

## 2. Design tokens

### 2.1 Fonts

| Family | Weights loaded | Source | Local file |
|---|---|---|---|
| **Clash Display** (Indian Type Foundry, via Fontshare) | 600 (Semibold), 700 (Bold) | `framerusercontent.com/third-party-assets/fontshare/wf/.../53RZKGOD...woff2` (700) and `.../Z3MGHFHX...woff2` (600) | `fonts/ClashDisplay-700.woff2`, `fonts/ClashDisplay-600.woff2` |
| **Inter** (Framer-hosted) | 400, 500, 600, 700, 900, each normal and italic, split by unicode range (latin, latin-ext, cyrillic, greek, vietnamese) | `framerusercontent.com/assets/<hash>.woff2` | `fonts/Inter-{400,500,600,700,900}-latin.woff2`, `fonts/Inter-*-italic-latin.woff2` |

- The `@font-face` rules use `font-display: swap`. The Inter Latin range is `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2070, U+2074-207E, U+2080-208E, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`.
- Fallback metric fonts are defined as `local("Arial")`:
  - "Clash Display Placeholder": ascent-override 83.42%, descent-override 23.43%, line-gap-override 8.44%, size-adjust 106.69%.
  - "Inter Placeholder": ascent-override 89.79%, descent-override 22.36%, line-gap-override 0%, size-adjust 107.89%.
- The downloaded Clash Display 700 file renders "STRATEGIC" at 48px as 291.2px wide, which matches the live site (291px). It is the correct file.
- The giant **PORTVIO®** wordmarks (hero, footer) and the nav logo are **SVG images**, not live text. The wordmark has a wide, heavy grotesk look.

### 2.2 Type scale (computed; desktop ≥1200 / tablet 810–1199 / mobile <810)

| Role | Family | Size D / T / M | Weight | Line-height | Letter-spacing | Transform | Color | Where |
|---|---|---|---|---|---|---|---|---|
| Section title (H2) | Clash Display | **48 / 42 / 34px** | 700 | 1.2 (57.6/50.4/40.8px) | normal | UPPERCASE | #FFFFFF | "Strategic creative Services", "From Vision to Reality", "Trusted by Clients Worldwide", "Collaboration Options", "SHOWREEL", "//2026©", project page title, "Page Not Found" |
| Menu overlay links | Clash Display | 54px (desktop) | 700 | 54px (1.0) | normal | none (Title case) | #FFFFFF | Home / About / Services / Projects / Contact |
| Big numbers | Clash Display | 36 / 32 / 26px | 600 | 1.2 | normal | UPPERCASE | #FFFFFF | "100%", "130+", project year "2026", "$990", "CUSTOM" |
| Statement / H3 | Inter | 32 / 28 / 24px | 700 | 1.3 (41.6/36.4/31.2) | normal | UPPERCASE | #FFFFFF (accent span #F65802) | About statement, service names "01. BRAND IDENTITY", testimonial quotes, "LET'S TALK", project-page H3s (Project Overview, Challenge…) |
| Lead / subtitle | Inter | 20 / 17 / 16px | 500 | 1.32 (26.4/22.44/21.12) | −0.4 / −0.34 / −0.32px (−0.02em) | none | #FFFFFF, or #BDBDBD for muted | Section eyebrow labels ("About Us", "Services"…), hero sub-paragraph, About paragraph (muted), service sub-items, process card titles, project names, testimonial names, project meta values, footer "Stay updated…" |
| UI label / button | Inter | 18px at every width | 500 | 1.48 (26.64px) | normal | none | #FFFFFF; #0D0D0D on the white button | Buttons ("Contact Us", "Start a Project", "Back to Home", "Subscribe"), hero tagline H1 "We Helping Brands Build…", stat labels, Prev/Next |
| Nav "Menu" (roll text) | Inter | 18px | 500 | 18px (1.0) | normal | none | #FFFFFF | Split into per-character spans, two stacked copies |
| Footer links (roll text) | Inter | 18px | 400 | 18px | normal | none | #FFFFFF | Footer Menu, Social and contact links (per-character spans, two copies) |
| Body | Inter | 16px | 400 | 1.6 (25.6px) | −0.32px | none | #FFFFFF or #BDBDBD | Process card copy, project page paragraphs (#BDBDBD), counters ("4 Services", "3 Projects", "845 Clients" in #BDBDBD), process numbers "//01", nav location, footer column labels (#BDBDBD), marquee chips |
| Nav email / clock / menu contacts | Inter | 16px | 400 | 16px | normal | none | #FFFFFF | Per-character roll text |
| Tag chip | Inter | 16px | 600 | 1.32 (21.12px) | −0.32px | UPPERCASE | #FFFFFF; "WHAT'S INCLUDED:" in #BDBDBD | Project tags (WEBSITE, BRANDING…) |
| Small | Inter | 14px | 400 | 1.28 (17.92px) | normal | none | #FFFFFF / #BDBDBD | Hero "01/03", pricing toggle "Monthly / Annually", testimonial role, footer copyright |
| Inputs | Inter | 16px | 400 | 19.2px | normal | none | #FFFFFF; placeholder #FFFFFF (CTA) or #BDBDBD (newsletter) | Forms |

Framer's text default line-height is 1.2em. All headings use uppercase plus tight Clash Display. The 20px → 17px → 16px lead size steps down by breakpoint.

### 2.3 Color palette (Framer tokens defined on `body`)

| Hex | Token use | Usage |
|---|---|---|
| **#0D0D0D** | `--token-cf52…`, `--token-eb65…` | Page and section background (`body` bg = rgb(13,13,13)), menu panel, dark icon color, end color of the radial gradient |
| #0A0A0A | `--token-e53d…` | Alternative near-black |
| #101010 / #1D1D1D | `--token-3d7e…` / `--token-afff…` | Spare dark surfaces |
| **#232222** | `--token-a4c6…` | **Card surface**: project cards, process cards, pricing shell, testimonial cards, partner logo tiles, Prev/Next buttons, stat number boxes |
| #232222B3 | `--token-51f4…` | Card surface at 70% |
| #282727 → #303030 | `--token-5c3d…` → `--token-8397…` | Highlighted pricing card gradient (180deg) |
| **#303030** | `--token-8397…` | Process card inner mockup panel (gradient 180deg #303030 → #303030) |
| #2F2E2D | `--token-de35…` | Alternative surface |
| **#3C3C3C** | `--token-ec03…` | **Default 1px border** on cards, accordions, pricing, testimonials and buttons |
| **#F65802** | `--token-f9fa…` | **Brand accent orange**: primary buttons, "+" accordion buttons, accent words, star icon, process bar, toggle knob, footer glow |
| #F65802D9 | `--token-c765…` | Orange at 85% (hover) |
| **#FFFFFF** | several | Primary text, white button, cursor dot |
| **#BDBDBD** | `--token-f03c…` | Secondary or muted text |
| #999999 / gray | `--token-bbe6…` / `--token-1000…` | Tertiary text |
| #FFFFFF33 (20%) | `--token-6495…` | Glass fill (hero chips, hero arrow button, CTA form card, CTA inputs), process dots |
| #FFFFFF1A (10%) | `--token-e6cd…` | Tag chips, newsletter input field |
| #FFFFFF0D (5%) | `--token-fc2c…` | Faint fill |
| #FFFFFF4D (30%) | `--token-d82c…` | Light border on glass (CTA card, CTA inputs, newsletter field), testimonial divider |
| #00000040 (25%) | `--token-5c68…` | Menu backdrop overlay |
| #FF2244 / #FF224426 | `--token-5744…` / `--token-a5ad…` | Error red (form validation) |
| #44CCFF | `--token-f974…` | Spare cyan (unused) |

Gradients:
- Divider lines in About: `linear-gradient(90deg, rgba(255,255,255,.3) 0%, #0D0D0D 100%)`, 1px tall, about 400px wide. The reversed version (`90deg, #0D0D0D → rgba(255,255,255,.3)`) also appears.
- Footer glow: `radial-gradient(50% 50% at 50% 50%, #F65802 0%, #0D0D0D 100%)` on a 1440x600 layer sitting at the bottom of the footer, with `filter: blur(50px); opacity: .6`.
- The photo backgrounds in the hero and CTA carry the warm orange/red mood: a red→orange studio backdrop with a silhouetted portrait.

### 2.4 Radii, borders, shadows, blur

- **Radii:**
  - 4px: tag chips, icon box inside buttons.
  - 6px: buttons, inputs, hero arrow pill.
  - 8px: hero thumbnail, newsletter field.
  - 10px: process card, pricing shell, Prev/Next, partner tiles, testimonial image, hero chips, mockup panel.
  - 12px: process card inner.
  - 16px: service accordions, project cards, testimonial card, about image, project images.
  - 20px: CTA glass card, showreel video holder, project detail gallery images.
  - 100px: circles and pills (accordion "+", toggle, cursor, process bar).
- **Borders:** Framer draws them with a `::after` overlay using `--border-*` vars. The default is `1px solid #3C3C3C`. Glass elements use `1px solid rgba(255,255,255,.3)`. The process card header has a bottom border only (1px #3C3C3C). The testimonial info has a top divider only (1px rgba(255,255,255,.3)).
- **Shadows:** effectively none in the design. The only shadow belongs to the Framer badge.
- **Blur:**
  - `backdrop-filter: blur(10px)`: hero chips, hero arrow button, CTA form card.
  - `backdrop-filter: blur(5px)` plus `#00000040`: full-screen menu backdrop.
  - `filter: blur(50px)`: footer glow.
  - `filter: brightness(.7)`: showreel video container.
- **Masks:**
  - Hero chips marquee: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,.9) 10.36%, rgba(0,0,0,.9) 88.29%, transparent 100%)`.
  - Partners marquee: the same pattern with stops at 7.21% / 92.79%.

### 2.5 Spacing and layout scale

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Side gutter (section padding-x) | 20px | 20px | 16px (CTA keeps 20px) |
| Container | max-width 1440px, so content is 1400px wide at 1440 | 984px | 358px |
| Standard section padding | 100px top / 40px bottom | 80 / 20 | 60 / 20 |
| Pricing and Testimonials bottom padding | 140px | 100px | 80px |
| Gap between heading and content | 50px | 40px | 30px |
| Narrow containers | Pricing 960px; header info 530px | 960px | 600px |

- Card-internal gaps follow a 4/6/8/10/12/14/16/20/24/30/50/60/80/100px scale.
- Button padding is `6px 24px 6px 6px` with a 14px gap.
- Accordion padding is 50px.
- Testimonial card padding is 20px with a 60px gap.
- CTA glass card padding is 40px with a 30px gap.

### 2.6 Breakpoints (from the CSS media queries)

- Desktop: `min-width: 1200px` (base styles, designed at 1440).
- Tablet: `@media (min-width: 810px) and (max-width: 1199.98px)`, also written as `(max-width:1199px) and (min-width:810px)`.
- Phone: `@media (max-width: 809.98px)`, also written as `(max-width:809px) and (min-width:0)`.

Framer swaps whole variant trees per breakpoint. The footer layer is named Desktop / Tablet / Phone, and the cards have Desktop and Phone variants.

---

## 3. Global components

### 3.1 Navigation (`Navber`)
- Uses `position:absolute` at the top, not sticky. It scrolls away with the page (confirmed at scrollY 600/1500/3000/6000; see `home-desktop-nav-at-*.png`). It is centered with `left:50%; transform:translateX(-50%)`, 1440x86, `padding:20px`, `z-index:10`, transparent background over the hero photo.
- Desktop row (inner max-width 1440, space-between):
  - Left group (gap 100px): logo (SVG 143x32 at 20,20, white "P" disc plus "PORTVIO" wordmark), then location and clock ("Sydney, Australia" 16/400, with a live clock "11:38:34 PM" below it, ticking every second), then an email link (a 6px white dot plus "hello@portvio.com", 16px roll-text).
  - Right: "Menu" trigger, 87x24, with a hamburger icon (2 lines) and the "Menu" text (18/500, roll text).
- Tablet: same layout, with a left-group gap of 80px.
- Mobile: `padding:20px 16px`, height 72px. Only the logo and Menu remain; location and email are hidden.
- **Menu overlay, desktop** (`home-desktop-menu-open-1600ms.png`):
  - A full-screen `Background` (fixed, `#00000040`, `backdrop-filter: blur(5px)`, z 9, click closes).
  - The panel `Menu / Menu Overlay` is fixed on the **right half**: x=792, 648x900, bg #0D0D0D, `padding:0 40px`, content vertically centered.
  - `Wrapper` is a column with an 80px gap. It holds `Nav Menu`, five links in a column with a 4px gap, each 56px tall, Clash Display 54px/700 in white, roll text with two copies, each link clipped by `overflow:hidden`.
  - Below that, `Contact Links`: a row with a 24px gap. The left column, "Contact" (16px #BDBDBD), holds hello@portvio.com and (123) 456 7890. The right column, "Socials", holds Youtube, Instagram and Twitter / X. Both columns are 272px wide, with 16px under the label and 12px between items.
  - The trigger becomes "Close" with an X icon.
- **Menu overlay, mobile** (`home-mobile-menu-open-*.png`): the panel covers the full screen, enters from the left, and the links reveal upward with a mask and stagger (see the 400ms frame).
- **Custom cursor:** a fixed 14x14 white circle with border-radius 100px and `mix-blend-mode: difference`, z-index 13. It follows the mouse via transform, starts at opacity 0, and is visible over the menu. The animation report holds the follow details.

### 3.2 Section header pattern
- **Split row** (Services, Projects, Testimonials): a row with `justify-content: space-between; align-items:flex-start`, about 115px tall.
  - Left: an eyebrow, an orange 4-point sparkle icon (24px, gap 10) plus the label in 20/500 white.
  - Center: the H2, Clash 48/700 uppercase on 2 lines, starting at about x=477 (roughly a third of the width).
  - Right: a counter in 16/400 #BDBDBD ("4 Services").
- **Centered stack** (Work Process, Pricing): the eyebrow sits above the H2 with a 20px gap, center-aligned.

### 3.3 Buttons
- **Primary (orange) "Contact Us" / "Start a Project" / "Back to Home":** 60px tall, `padding:6px 24px 6px 6px`, gap 14px, radius 6px, bg #F65802. Inside, on the left, sits a 48x48 white box (radius 4px) holding a dark right arrow (stroke 1.5, #0D0D0D). The label is 18/500 white.
- **Secondary (white):** the same shape with bg #FFFFFF, a black 48x48 icon box with a white arrow, and a #0D0D0D label.
- **Form submit:** a full-width orange button, 54px tall, padding 16px, radius 6px, centered 18/500 white text. The Subscribe button is 150x47.6.
- **Accordion toggle:** a 60x60 orange circle with a white "+" (stroke 3).
- **Prev/Next:** 690x74.6 each with a 20px gap between them, bg #232222, 1px #3C3C3C border, radius 10px, padding 24px, a chevron plus 18/500 label, roll text.

### 3.4 Footer (present on every page)
- Uses `<footer>` with `padding:0 20px`, layout max-width 1440, 686px tall on desktop (598 tablet, 1017 mobile), transparent over #0D0D0D. The orange radial glow (1440x600, blur 50, opacity .6) rises from the bottom.
- Top row:
  - **Left:** the logo (163x40, orange "P" disc plus white wordmark). Below it, "Newsletter" (16px #BDBDBD), "Stay updated with our latest projects and insights." (20/500), "Email Address" label (16px), then the input group: 400x60 with bg rgba(255,255,255,.1), radius 8, 1px rgba(255,255,255,.3) border, padding 20, placeholder "hello@portvio.com" in #BDBDBD, and an orange "Subscribe" button inset on the right.
  - **Right columns:** "Menu" at x=752 (Home, About, Services, Projects; 18px roll links, 36px pitch). "Social Media" at x=966 (Facebook, Instagram, Linkedin, Twitter / X). "Location" at x=1200 ("4517 Washington Ave. Manchester, Kentucky 39495", 16/400).
- Second row: "For New Project" at x=750 (contact@portvio.com, (123) 456 7890) and "For General Inquiries" at x=1073 (info@portvio.com). The left side holds "© Portvio. Created by [Olynex logo] Olynex in Framer" (14px).
- Bottom: a **giant PORTVIO® SVG**, 1400x194, in a translucent white that tints with the orange glow behind it (`home-vp-17.png`). It is clipped at the bottom of the page.

---

## 4. Home page, section by section (desktop y-offsets; `home-vp-NN.png` is viewport N)

`<main>` is 1440 wide, a flex column, `overflow:clip`. Every section after the hero has bg #0D0D0D and `z-index:2`, so they **slide over the sticky hero**.

### 4.1 Hero (`#hero`, `<section>` sticky top:0, 1440x900; `home-vp-01.png`, `home-mobile-vp-01.png`)
- The hero is `position:sticky; top:0`, `justify-content:flex-end`, `padding:0 20px 50px`, `overflow:hidden`. On scroll it shrinks to `scale(0.7)` and moves up while the About section slides over it. That makes a "card shrinks into background" transition.
- Background: a full-bleed photo (1440x900, cover, source 7676x3684). It shows a male profile silhouette against a saturated red-orange gradient backdrop.
- Tagline block at (240,260), 280 wide, gap 20: a 24px white pixel-cross icon plus the H1 "We Helping Brands Build Better Digital Experiences Through Design." (Inter 18/500 white, 236px wide, 3 lines).
- Thumbnail carousel at (1032,260): a 130x110 image (radius 8) holding 3 portrait images that cycle. Under it, "01/03" in 14px. To the right, a 32x110 glass pill (rgba(255,255,255,.2), blur 10, radius 6) with a curved-arrow icon. Gap 6px.
- Wordmark: a PORTVIO® SVG at (20,586), 1400x181.6, white.
- Bottom row (y≈797, 30px below the wordmark):
  - Left: a paragraph, Inter 20/500 white, 540px wide: "We  partner with brands to create digital design that drives conversion and commands attention."
  - Right: a 550px marquee of chips (each 131.7x45.6, padding 10, glass rgba(255,255,255,.2) with blur 10, radius 10, 16/400 "Product Design", gap 8). The edges fade via the mask.
- Mobile hero (390x844): the tagline (18px) sits at the top-left. Below it are the thumbnail (130x110), the wordmark (358 wide), the 16px paragraph and the chips. The gap is 80px.

### 4.2 About (`#about`, y 900, 1440x630; `home-vp-02.png`)
- **Overlap Detailing:** an absolute layer at the top of About holds a #0D0D0D "Filler" (1440x834) with `skewY(≈7°)` (matrix(1, 0.1228, 0, 1, 0, −220)). It creates a **diagonal edge** that sweeps over the hero when the section enters.
- Container: a row, gap 100, centered.
  - Left: the image, 450x550, radius 16. It is a portrait of a man wearing a glowing orange visor against an orange backdrop.
  - Right column, about 850 wide:
    - Eyebrow "About Us".
    - Statement in Inter 32/700 uppercase: "AT OUR **INNOVATIVE AGENCY** (#F65802), WE DESIGN BRANDS AND DIGITAL EXPERIENCES, MERGING STRATEGY, IDENTITY & INTERACTION TO LEAVE IMPRESSION."
    - Two stat rows. Each has a number box (bg #232222, radius 10, padding 10px 12px, 118x63) with Clash 36/600 "100%" or "130+", a label (18/500) "Success Score" or "Project Launched", and a hooked-arrow icon at about x=940. Under each row is a 1px gradient divider about 390–400 wide, and the rows are spaced 134px apart.
    - Bottom row: a muted paragraph (20/500 #BDBDBD) "We  partner with brands…" on the left and the orange "Contact Us" button (188x60) on the right.
- Tablet and mobile: the layout becomes a column with gap 50. On mobile the image comes after the text (`home-mobile-vp-02.png`).

### 4.3 Partners (y 1530, h 358; padding 60/20/40; `home-vp-02/03`)
- Header row: "Valuable Partners" eyebrow on the left, "Who Trust Us!" (16/400) in the center, a hooked arrow on the right. Gap 32 below it.
- Marquee: a horizontal infinite list (`<ul>` with gap 6). Each tile is 280x200, bg #232222, radius 10, with a centered grey/white logo SVG about 40px tall (IPSUM, "∞∞", "////", "LOGO"…). Edge mask 7%/93%.

### 4.4 Services (`#services`, y 1888, h 1017; `home-vp-03/04`)
- Split header: "Services" / "STRATEGIC CREATIVE SERVICES" / "4 Services".
- An accordion list, column with gap 24. Each item, `Desktop Closed`, is 1400x160 with padding 50, radius 16, 1px #3C3C3C border, transparent background.
  - Left: the number "01." and name "BRAND IDENTITY", both Inter 32/700 uppercase, about 114px apart (max-width 520).
  - Right: the 60x60 orange "+" circle.
- Items: 01 Brand Identity (Logo design, Brand guidelines, Motion Identity, Art Direction). 02 UI/UX Design (UI Design, UX Research, Wireframing, Design Systems). 03 Development (Web Development, App Development, CMS Development, API Integration). 04 Product Design (Product Strategy, User Research, Prototyping, Product Optimization). The sub-items are hidden until the item opens and use 20/500 text.
- Mobile cards have bg #232222, the number sits above the name, and the gap is 30 (`home-mobile-vp-04/05`).

### 4.5 Work Process (y 2906, h 2174; `home-vp-04..06`)
- The centered header ("Work Process" / "FROM VISION TO REALITY") is **sticky at top:100px**.
- `Cards-wrapper`: four `Process-cards` rows, each `position:sticky; top:240px`, laid out as a 4-column row (350px each) with "Blank" spacers. Each successive card sits in the next column and they stack into a staircase. The y offsets alternate (cards 2 and 3 have a 90px top pad / 25px lower), which gives the uneven skyline in `home-vp-06.png`.
- Card (350 wide, about 397–423 tall): bg #232222, radius 12, 1px #3C3C3C border.
  - Header (90px tall, bottom border): an orange bar (≈50x5, radius 100) on the top edge at left 26, then "//01" (16/400 #BDBDBD) plus the title (20/500 white).
  - Inner panel: inset 6px, gradient #303030, radius 10, padding 26/20. It has three 8px dots (rgba(255,255,255,.2)) at the top like a window chrome, and body copy (16/400 white) at the bottom.
- Steps: //01 Ideation& Strategy, //02 Wireframe & Prototype, //03 Execution & Deployment, //04 Release & Support (copy in `text/home.txt`).
- Mobile: the cards stack vertically and full-width, and nothing is sticky.

### 4.6 Projects (`#projects`, y 5080, h 2043; `home-vp-06..08`)
- Split header: "Projects" / "TRUSTED BY CLIENTS WORLDWIDE" / "3 Projects". It is followed by a 1px divider line.
- Three rows (gap 30, each separated by a 1px gradient divider). Each row is 1400x528 with space-between, and the **zig-zag alternates**: card left plus year right, then year left plus card right, then card left plus year right. The year "2026" is Clash 36/600 and aligned to the outer edge.
- Project card (`<a>`, 980x528, bg #232222, radius 16, 1px #3C3C3C border, `overflow:hidden`):
  - Top: tag chips, padding 20, gap 6. Each chip is 16/600 uppercase with padding 8px 10px, bg rgba(255,255,255,.1) and radius 4.
  - Middle: the image, 980x360 cover.
  - Bottom: the project name (20/500) on the left and a description (16/400 #BDBDBD, about 400 wide) on the right, with about 30px padding.
  - Each card contains a **second image** (980x1008) parked below the visible area. It is most likely a hover image swap or reveal; the animation report covers it.
- Data:
  - Vertex Studio [WEBSITE, BRANDING, APP]: "The project established a modern identity reflecting the agency's strength in digital solutions."
  - Elysian [DIGITAL, AGENCY, BRANDING]: "A modern brand identity for Nexora Digital, showcasing innovation and digital expertise."
  - Velora [MARKETING, SOCIAL MEDIA, BRAND]: "Velora helps businesses grow through branding, social media, and audience engagement."

### 4.7 Pricing (y 7123, h 1128; padding 100/20/140; container 960; `home-vp-09`)
- Centered header: "Pricing" / "COLLABORATION OPTIONS" (2 lines).
- Shell: 960x676, bg #232222, radius 10, padding 12, 1px #3C3C3C border. It holds two plans side by side.
  - **Subscription:** transparent, padding about 38px. Title "Subscription" (20/500), description (16 #BDBDBD), "$990" (Clash 36/600) plus a toggle on the right: "Monthly" (14 white) + a 44x24 pill (1px #3C3C3C, orange knob) + "Annually" (14 #BDBDBD). A divider follows, then "WHAT'S INCLUDED:" (16/600 #BDBDBD uppercase) and 6 bullet items (16px, white dot, 12px gap, 37.6px pitch). Ends with the white "Start a Project" button.
  - **Project Base (highlighted):** 468x652, gradient #282727 → #303030, 1px #3C3C3C border. Shows "CUSTOM" (Clash) and the orange "Start a Project" button.

### 4.8 Showreel / Demo (y 8251, a 3600px tall scroll track; `home-vp-10..13`)
- `Demo` is 3600px tall: a sticky 1440x900 `Container` plus a 2700px spacer.
- Inside the container, a `video - holder` (radius 20, `overflow:hidden`) starts at `scale(0.2)` (288x180, centered). It grows with scroll to fill the full viewport (inset about 32px, radius 20).
- The video is an autoplaying, muted, looping MP4 (`f0iBHpitdyP4fA1dIsh57nlwCI.mp4`, a woman typing on a laptop at night), shown at `brightness(.7)`.
- "SHOWREEL" and "//2026©" (Clash 48/700) start at the far left and far right edges and slide inward to flank the center as the video grows (`home-vp-12` → `home-vp-13`).

### 4.9 Testimonials (y 11851, h 1060; padding 100/20/140; `home-vp-14/15`)
- Split header: "Testimonials" / "TRUSTED BY CLIENTS WORLDWIDE" / "845 Clients".
- Slider: one card at a time, 1400x560. The other slides sit off-canvas to the right at x=1440.
  - Card: bg #232222, radius 16, 1px #3C3C3C border, padding 20, gap 60, row layout.
  - Image wrapper: 524x520, radius 10, holding a person photo.
  - Info column: space-between, padding 30px 30px 30px 0. At the top, the quote in Inter 32/700 uppercase. At the bottom, a top-border divider (rgba(255,255,255,.3)), the name (20/500) plus role (14 #BDBDBD), and on the right 5 orange stars (22px, gap 4), a dash and "4.9/5.0".
- Slides:
  - Esther Howard (Marketer)
  - Samantha Green (Creative Strategist)
  - Alex Morgan (Innovative Thinker)
- Prev/Next buttons sit below with a 20px gap.

### 4.10 CTA / Contact (`#cta`, y 12911, h 1009; `home-vp-15/16`)
- Section padding-bottom is 140. The Container is 1440x869 with padding 380/20/50 and a full-bleed background photo (source 7676x4144): a man's silhouette in profile against a red/orange/yellow sunset glow, with motion-blurred ghosting.
- Glass form card, right-aligned at x=820: 600 wide, padding 40, gap 30, bg rgba(255,255,255,.2), `backdrop-filter: blur(10px)`, 1px rgba(255,255,255,.3) border, radius 20.
  - Content: "Contact Us" (20/500), "LET'S TALK" (Inter 32/700), then a form with gap 16. Fields: First Name + Last Name in two columns (labels 16/500), Email Address in full width. Each input is 54px tall with padding 16, bg rgba(255,255,255,.2), 1px rgba(255,255,255,.3) border, radius 6 and white placeholders "Jane", "Smith", "jane@framer.com".
  - The form ends with a full-width orange "Start a Project" button (54px).
- Tablet padding-top is 300; mobile padding-top is 300 with 20px sides.

### 4.11 Footer
See §3.4. Screenshots: `home-vp-16/17.png`.

---

## 5. Project detail pages (`/projects/<slug>`, all one template; `projects__vertex-studio-vp-01..05.png`)

- The nav is identical, absolute over a #0D0D0D background (no hero photo).
- `Project Details` section: padding 180/20/140 (tablet 160 top, mobile 140 top). The container is a column with gap 50 and max-width 1440.
  1. **Title row:** the title (Clash 48/700 uppercase, e.g. "VERTEX STUDIO", 1000 wide) on the left. A short paragraph (16/400 #BDBDBD, max 400, right-aligned at x=1020) on the right. That paragraph is split **word by word** in the DOM, which points to a word-stagger reveal.
  2. **Meta row:** 4 columns with space-between, each a label (16 #BDBDBD) over a value (20/500 white). Columns: Company Type, Timeline, Year, Location.
  3. **Banner image:** 1400 wide, radius 16. It is visually about 1400x600 in screenshots, but the DOM wrapper is 1400x900 with `will-change:transform`, which suggests a scroll parallax or clip.
  4. **Paragraph 1:** an article column 940 wide, centered (x=250). H3s in Inter 32/700 uppercase (Project Overview, Challenge, Solution, Deliverables) are followed by 16–17px #BDBDBD paragraphs (line-height 1.6), and Deliverables is a bulleted list. There are about 50px between blocks.
  5. **Gallery:** a 2-up row (692 wide each, about 400 tall visually, gap 16, radius 20), then a full-width image (1400 wide, about 600 tall visually, radius 20).
  6. **Paragraph 2:** "Result(s)" H3 plus paragraph.
- Then the footer.
- Per-page data:

| Page | Company Type | Timeline | Year | Location |
|---|---|---|---|---|
| Vertex Studio | Creative Digital Agency | 2 Months | 2026 | Vietnam |
| Elysian | Growth Agency | 10 Weeks | 2026 | Switzerland |
| Velora | Marketing & Branding | 10 Weeks | 2026 | Nigeria |

Full copy is in `text/projects__*.txt`.

## 6. 404 page (`404-vp-01.png`)
- Centered stack on #0D0D0D with about 130px top space:
  - "PAGE NOT FOUND" in Clash 48/700 (34 on mobile).
  - "Oops! This page seems to have wandered off." in Inter 20/500 white (16 on mobile).
  - "The page you're looking for doesn't exist, may have been moved, or the URL might be incorrect." in 16/400 #BDBDBD, about 360px wide, 2 lines.
  - An orange "Back to Home" primary button (212x60).
- Then the footer.

---

## 7. Media inventory: slots for our own generated images and videos

| Slot | Rendered size (desktop) | Aspect | Radius | Notes |
|---|---|---|---|---|
| Hero background | 1440x900 full-bleed (cover) | ≈16:9 to 2:1 (source 7676x3684) | 0 | Moody portrait silhouette on a saturated orange/red backdrop; leave negative space top-left and bottom for text |
| Hero thumbnail carousel | 130x110 ×3 | 1.18 | 8 | Small portraits, cycling, "01/03" counter |
| About image | 450x550 | 0.82 (portrait) | 16 | Hero-grade portrait, orange rim light |
| Partner logos | about 80–140x40 SVG | n/a | n/a | White/grey monochrome logos on #232222 tiles |
| Project cover images | 980x360 (plus a hidden 980x1008 hover image) | 2.72 (cropped from portrait sources) | 16 | ×3 |
| Showreel video | 1440x900 (scales from 288x180) | 16:10 | 20 | Autoplay, muted, loop, brightness .7 |
| Testimonial portraits | 524x520 | ≈1:1 | 10 | ×3 |
| CTA background | 1440x869 full-bleed | ≈1.85 | 0 | Silhouette plus orange glow; the right half carries the glass form |
| Project detail banner | 1400x600 visible (wrapper 1400x900) | ≈2.33 | 16 | Per project |
| Project gallery | 692x400 ×2, then 1400x600 | 1.73 / 2.33 | 20 | Per project |
| Wordmarks | 1400x182 (hero), 1400x194 (footer) | ≈7.7 / 7.2 | n/a | SVG; for us, a "VINUL" or "GAJAMAN" wordmark |

## 8. Key structural takeaways for our build
1. Use a dark #0D0D0D canvas with one accent, orange #F65802, and #232222 cards with 1px #3C3C3C borders. Use glass (white 20% plus blur 10) only on top of photos.
2. Pair Clash Display Bold uppercase for headings (48/42/34) with Inter (20/500 leads, 16/400 body, 18/500 UI).
3. Make the hero sticky and full-viewport, with later sections stacking over it at z-index 2. A skewed #0D0D0D "Filler" gives a diagonal reveal, and the hero scales to 0.7.
4. Sticky patterns:
   - The Work Process header sits sticky at top:100.
   - The process cards are sticky at top:240 and form a staircase.
   - The Showreel has a 3600px scroll track with a video that scales from 0.2 to 1 while the side titles converge.
5. Run continuous marquees with edge masks for the hero chips and partners. Use roll text (two stacked copies, split by character) for every nav, footer and button label.
6. Keep the nav absolute (not fixed). Open the menu as a right-half panel with a blurred backdrop on desktop and full-screen on mobile. Add a blend-mode difference cursor dot.
7. Breakpoints: 1200 / 810. Gutters: 20 / 20 / 16. Section padding: 100-40 / 80-20 / 60-20.
