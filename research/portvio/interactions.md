# Portvio (portvio.framer.website) - Hover, Mouse & Click Interactions

Captured 2026-10-05 with Playwright/Chromium at 1440x900 (desktop) and 390x844 (mobile). Pages: `/` (home) and `/projects/vertex-studio` (project detail).

**How it was measured**
- Every `a`, `button`, `[role=button]`, `[data-highlight]`, `cursor:pointer` root and selected named Framer layers was hovered. For each one: a rest screenshot, then screenshots at about 50/150/300/600 ms after hover-in and 100/300/600 ms after hover-out.
- Pass A diffed computed styles every rAF across the element and all of its descendants (up to 500 nodes).
- Pass B re-hovered the element with no screenshots and sampled only the properties that changed, once per frame (about 16 ms). Durations and easings were fitted from those samples against 18 cubic-beziers and a spring grid.
- Wherever possible, the fitted values were checked against the real configs in the JS bundles (`script_main.BxnURo7O.mjs`, `HLVJ-…ZlvZxRXk.mjs`, `xP_GbhLFW.DU2D2fkz.mjs`, `PX9hIOIVM…mjs`). Fitted and source values agree in every case.
- Raw data: `research/portvio/interactions/*.json`, `hover_home_summary.txt`, `log_*.txt`. Screenshots are in `interactions/shots/`, `interactions/clicks/`, `interactions/extra/` and `interactions/mobile_menu/`. Contact sheets are the `sheet_*.png` files.

> Screenshot naming: `shots/<page>_<id>_<name>_{0rest|in50|in150|in300|in600|out100|out300|out600}.png`. The `in150`… labels are targets. Real capture times are listed in `hover_home.json` (`shotsIn` / `shotsOut`); the long-running ones landed later than their label. Note: the white or cyan dot visible in many shots is the site's **custom cursor** (see section 1), not an artifact.

---

## 0. TL;DR - the whole interaction language in 10 lines

1. **Custom cursor:** a 14 px white dot with `mix-blend-mode: difference`, so it looks cyan on orange and white on dark. Offset +16/+16 px, bottom-centre of the pointer. It follows on a spring: stiffness 400, damping 60, mass 1. The native cursor stays visible, and the dot never changes shape.
2. **Signature text hover = per-letter 3D flip-roll.** Two stacked copies of the label, one `<span>` per character. On hover the top copy goes `y:-100%`, `rotateX:90`, `opacity:0`; the bottom copy comes from `y:100%`, `rotateX:-90`, `opacity:0` to rest. Timing: 0.2 s `easeInOut`, `staggerChildren` 0.025 s. The menu-overlay links use 0.3 s and 0.03 s.
3. **Primary CTA:** a 48×48 white square holding an arrow expands to fill the whole button (inset 2 px). The label flips from white to #0d0d0d and the arrow rotates −45°. This is a Framer layout animation, spring duration 0.6 s with bounce 0.
4. **Project card:** a second image cross-fades in (opacity 0→1) while scaling 1→1.1. Spring 0.6 s, bounce 0.
5. **Service accordion row:** background goes from transparent to `rgba(35,34,34,.7)`, settling in about 500 ms. Click opens it with a layout spring of 0.8 s.
6. **Ghost/glass tab and Prev/Next pills:** a conveyor swap where the icon or label slides out and an identical copy slides in (24 px horizontal or 30 px vertical). Spring 0.6 s.
7. **Form buttons:** background `#F65802` → `rgba(246,88,2,.85)` over 0.2 s, `cubic-bezier(.44,0,.56,1)`.
8. **Mobile menu:** a backdrop of `rgba(0,0,0,.25)` plus `blur(5px)` fades in (spring 0.4 s). The panel slides in from x+560 with opacity 0→1 (spring 0.6 s). Links rise from y+100 inside masks, 0.8 s `cubic-bezier(.645,.045,.355,1)`, staggered 0/50/100/150 ms. The hamburger morphs to an X (spring 0.4 s, bounce 0.2).
9. **No magnetic buttons, no tilt/parallax on mouse move, no image-follows-cursor lists, no "View"/"Drag" cursor labels.** Mouse grids over the hero and the projects found only the cursor dot moving. Smooth scrolling is Lenis (`html.lenis`).
10. **Every hover reverses symmetrically** with the same transition. Text-roll letters also return in forward order (first letter first).

---

## 1. Mouse effects

### 1.1 Custom cursor (global)
| Property | Value |
|---|---|
| Element | `div.framer-4dpwI.framer-8xt4lf[data-framer-name="Variant 1"]` (Framer component "Curser"), mounted once for the page via `data-framer-cursor="8xaevz"` on the page root |
| Size / shape | 14×14 px, `border-radius: 100px`, `background: #fff` (token `--token-54748734…`) |
| Blend | `mix-blend-mode: difference`. It reads cyan `rgb(9,167,253)` over the orange `#F65802` hero and white over `#0d0d0d` |
| Position | `position:fixed; top:0; left:0; z-index:13; pointer-events:none; transform: translate(-50%, 0%) translateX(x+16px) translateY(y+16px)` |
| Framer config (bundle) | `{alignment:"center", placement:"bottom", offset:{x:16,y:16}, transition:{type:"spring", stiffness:400, damping:60, mass:1}}` |
| Measured follow | Jump of 700 px: 21% at 50 ms, 45% at 100 ms, 63% at 150 ms, 74% at 200 ms, 88% at 300 ms, 97% at 500 ms, ≈100% at 1000 ms. No overshoot (ζ≈1.5). The best fit was k≈340–350, c≈52 at m=1, which matches the source values |
| Native cursor | NOT hidden (`body{cursor:auto}`). Links and buttons still show the hand |
| Variants | Only one variant (`wztAtYzJM`). The dot does not grow or change text over cards, buttons or images |
| Shots | `shots/mouse_home_hero_pos{0,1,2}.png`, `shots/mouse_home_projcard_pos{0..3}.png`, and the dot is visible in most `*_in*.png` |

### 1.2 Things checked and NOT present
| Effect | Method | Result |
|---|---|---|
| Magnetic buttons | Rect of every button sampled per frame while hovering off-centre | No translation of the button box |
| Tilt / parallax following mouse | 5×3 mouse grid over the hero and the projects section, with a MutationObserver on every style/class change | Only the cursor dot and the always-running marquee (`li` translateX 699 px loop) changed. No hero or card transforms tied to the mouse |
| Image-follow-cursor list | Same grid over the service rows and the projects | None |
| Cursor label ("View", "Drag") | Hovered every `[data-framer-cursor]` element | Only one cursor attr exists (the root); no text |
| Scroll-linked transforms seen in passing (for the scroll role) | | `div[Filler]` `translateY(-220px) skewY(7deg)`, `section[Hero]` `translateY(-602px) scale(.7)`, `div[video - holder]` `scale(0.2)` |

---

## 2. Text hover effects (per-letter 3D flip-roll) - used by nav, footer and contact links, the Menu label and the menu-overlay links

### 2.1 Mechanism (from `script_main.BxnURo7O.mjs`, code component plugin `84d4c1`)
```
<div onMouseEnter/onMouseLeave  style="display:flex;align-items:center;justify-content:center;overflow:hidden;perspective:1000px;cursor:pointer">
  <motion.div animate={hover?'hover':'initial'} style="position:relative;white-space:pre;line-height:1;padding:0 0 2px">
    <motion.div variants={{initial:{transition:{staggerChildren:S}},hover:{transition:{staggerChildren:S}}}} style="display:block;position:relative">   <!-- primary copy -->
      <motion.span style="display:inline-block;transform-style:preserve-3d">h</motion.span> ... one span per char (spaces too)
    </motion.div>
    <motion.div ... style="position:absolute;top:0;left:0">  <!-- secondary copy, same chars -->
  </motion.div>
</div>
primary  : initial {y:0, rotateX:0, opacity:1}      hover {y:'-100%', rotateX:90, opacity:0}
secondary: initial {y:'100%', rotateX:-90, opacity:0} hover {y:0, rotateX:0, opacity:1}
transition per char: {duration:D, ease:'easeInOut'}  // = cubic-bezier(0.42,0,0.58,1)
```
The whole wrapper is the hover target, so the roll starts as soon as the pointer enters the link box. The letter stays inside `overflow:hidden`. The flip happens around the X axis with `perspective:1000px`, so letters look like they tip backwards over the top edge while the new letters tip up from the bottom.

### 2.2 Instances
| Element | Font (rest) | D / stagger | Travel | Measured (dense rAF) | Shots |
|---|---|---|---|---|---|
| Nav email "hello@portvio.com" (preceded by a 6 px white dot) | Inter 16px / 400, line-height 16px, #fff | 0.2 s / 0.025 s | ±16 px (100% of the 16 px line box), rotateX ±90° | Each char about 200 ms. 10% at 66 ms, 50% at 116 ms, 90% at 166 ms (an easeInOut curve). Char start delays 0, 19, 35, 50, 67, 85 … 352 ms for 17 chars (≈21 ms, quantised by frames; the source says 25 ms). Whole word ≈ 0.62 s | `shots/home_01_a_hello-portvio_*` |
| Nav "Menu" label | Inter 18px / 500, line-height 132% | 0.2 / 0.025 | ±18 px | 4 chars over 0–100 ms, each about 200 ms, total ≈ 300 ms | `shots/home_02_Closed_Menu-Menu_*` |
| Footer nav Home / About / Services / Projects | Inter 18px / 400, line-height 150% | 0.2 / 0.025 | ±18 px | Total 290–430 ms depending on length | `shots/home_24…27_*` |
| Footer socials Facebook / Instagram / Linkedin / Twitter / X | Inter 18px / 400 | 0.2 / 0.025 | ±18 px | 390–490 ms total | `shots/home_28…31_*` |
| Footer contact (contact@ / phone / info@) | Inter 18px / 400 | 0.2 / 0.025 | ±18 px | 570–690 ms total | `shots/home_34…36_*` |
| Menu-overlay socials (Youtube, Instagram, Twitter / X, hello@, phone) | Inter 16px / 400 | 0.2 / 0.025 | ±16 px | | `extra/desktop_menu_open_*.png` |
| Menu-overlay big links (Home, About, Services, Projects, Contact) | Clash Display 54px / 700, line-height 150% | **0.3 s / 0.03 s** | ±54 px | Each char about 290 ms, start delays 0, 0, 48, 51, 82 ms (frame-quantised) | `extra/menu_link_hover_{0080,0200,0350,0700}.png` |

Hover-out runs the same tween in reverse, letters again in forward order, with the same duration.

---

## 3. Buttons / CTAs

| Element | Rest | Hover | Timing / easing | DOM mechanism | Shots |
|---|---|---|---|---|---|
| **Primary CTA - orange** ("Contact Us" in the hero/about, "Start a Project" in pricing col 2) `a[data-framer-name=Primary]` (framer-JukMY) | 188×60, padding 6 24 6 6, gap 14, radius 6, bg `#F65802`, overflow hidden. Left: a 48×48 white square (radius 4) holding a 24 px arrow → in #0d0d0d. Label Inter 18/500, line-height 26.64 px, #fff | The white square **expands to fill the button** (`inset:2px`, width 48→183.7, height 48→56). Label colour #fff→#0d0d0d. Arrow rotates **0→−45°** (→ becomes ↗) | Layout and rotate: `spring {duration:.6, bounce:0}` ≈ stiffness 237, damping 30.8. Measured 50% at 117–136 ms, 90% at 266–277 ms, settled ≈ 580 ms. Colour 50% at about 80–165 ms, settled ≈ 520–600 ms. Hover-out is the mirror | Variant `framer-v-y9g4fe` gets the `hover` class. CSS: `.hover .framer-ywwi48{width:unset;order:1;inset:2px}` and `.hover .framer-6vlq6p{order:0}`, animated as a Framer layout animation (transform scale/translate on the square). Props: `bGShapeColor`, `fillColor`, `textDefaultColor`, `textHoverColor`, `iconColor` | `shots/home_04_Primary_Contact-Us_*`, `sheet_buttons.png` |
| **Primary CTA - inverted** ("Start a Project", pricing col 1) | Same geometry. bg #fff, dark #0d0d0d square with a white arrow, label #0d0d0d | Dark square fills the button and the label turns #fff | Same as above | Same component with colour props swapped | `shots/home_14_Primary_Start-a-Projec_*`, `home_15_*` |
| **Form submit** "Start a Project" (contact form) `button[data-framer-name=Default]` (framer-ynEji) | 520×54, padding 16, radius 6, bg `#F65802`, label Inter 18/500 #fff | bg → `rgba(246,88,2,.85)` (token `#f65802d9`) | `tween 0.2 s cubic-bezier(.44,0,.56,1)`. Measured settle 270–296 ms, including frame lag | Variant hover. Also Loading/Success/Error/Disabled variants. The Loading variant uses a linear 1 s spinner (`rotate:360`, ease [0,0,1,1]) | `shots/home_20_Default_Start-a-Projec_*` |
| **Newsletter "Subscribe"** | 150×48, radius 6, bg `#F65802` | bg → `rgba(246,88,2,.85)` | Same 0.2 s tween | Same component | `shots/home_23_Default_Subscribe_*` |
| **Hero glass tab** (32×110 vertical pill beside the hero portrait, ↱ arrow) `[data-framer-name=Default][data-highlight]` (framer-LaL6A) | `rgba(255,255,255,.2)`, `backdrop-filter: blur(10px)`, radius 6, overflow hidden, a 20 px white arrow | bg → `rgba(255,255,255,.3)`. **Arrow conveyor:** the visible arrow slides +24 px right (out) while a hidden copy (absolute, 24 px left, `translateY(-50%)`) slides in to centre | `spring {duration:.6, bounce:0}`. Measured position 50% at 135 ms, 90% at 269 ms, settled ≈ 560 ms. bg ≈ 380 ms | Two `<svg>` arrows. The hover class sets `.framer-3uegoi{position:absolute;top:50%;right:-24px}` and `.framer-1wc8gux{position:relative}`, and the layout animation moves them | `shots/home_03_Default__*` |
| **Testimonial Prev / Next** (690×75 pills) `[data-framer-name=Previous|Next]` (framer-IU9e0) | bg `#232222`, radius 10, padding 24, gap 8, chevron 20 px + label Inter 18/500 #fff, overflow hidden | **Vertical label swap:** label copy A slides up 30 px (out of the mask) while copy B rises from +30 px to 0. Chevron unchanged | `spring {duration:.6, bounce:0}`. Measured 50% at 117–134 ms, 90% at 266 ms, settled about 550–615 ms | Two stacked `<p>` copies. The hover class sets copy A `position:absolute; top:-30px; left:50%` and copy B `position:relative`, with a layout animation | `shots/home2_22_Previous_*`, `home2_23_Next_*` |
| Logo (nav) `a[href="./"]` | | No change | | | `shots/home_00_a__*` |
| "Made in Framer" badge, credits "Olynex"/"Framer" | | No change | | | `home_32/33/37_*` |

---

## 4. Cards / rows / tiles

| Element | Rest | Hover | Timing / easing | DOM mechanism | Shots |
|---|---|---|---|---|---|
| **Project card** `a[data-framer-name=Desktop]` (framer-Mlf2t), 980×528 | bg `#232222`, radius 16, overflow hidden. Top row has 3 tags (bg `rgba(255,255,255,.1)`, radius 4, padding 8 10, Inter 16/600 uppercase, letter-spacing −0.32 px). 980×360 image well. Bottom row has the title + description | A **second image** (absolute, z-index 1, initially `opacity:0`) cross-fades to `opacity:1` while scaling `1 → 1.1` | `spring {duration:.6, bounce:0}`. Measured 10% at 53 ms, 50% at 116–134 ms, 90% at 271 ms, settled ≈ 590 ms. Out is the mirror (≈ 575 ms) | Variant gets the `hover` class. The overlay div animates `opacity` and `scale` (`transform: scale(1.1)` at the end). The base image does not move | `shots/home_10_Desktop_WEBSITE-BRANDI_*`, `home_11_*`, `home_12_*`, `sheet_projectcard.png` |
| **Service accordion row** `[data-framer-name="Desktop Closed"]` (framer-H1RmS), 1400×160 | Transparent bg, radius 16, padding 50. "01." + title in Inter 32/700 uppercase, a small orange "+" circle on the right | bg → `rgba(35,34,34,.7)` (token `#232222b3`) | Measured ≈ 500 ms ("ease"-like, 50% at 142 ms, 90% at 340 ms); consistent with the component spring 0.8 s on colour | Variant hover | `shots/home_05…08_Desktop-Closed_*` |
| Process cards (//01…//04) | bg `#232222`, radius 12, inner `#303030` panel | **No hover** | | (Scroll-driven stacking is handled by the scroll role) | `shots/home2_09…12_Process-card_*` |
| Testimonial cards | | No hover (click carousel, see section 5) | | | |
| Pricing toggle "Monthly / Annually" | | No hover change (click only) | | | `shots/home_13_*` |
| Form inputs | Wrapper bg `rgba(255,255,255,.2)`, radius 6, padding 16. Input Inter 16 #fff, placeholder #fff | No hover change. Focus: `outline:none`, and Framer focus vars resolve to the same values, so there is no visible change | CSS `transition: background, box-shadow` | | `shots/home_17/18/19/22_input_*` |

---

## 5. Click-driven interactions (bonus - same motion system)

| Interaction | What moves | Config (bundle) / measured | Shots |
|---|---|---|---|
| Service accordion open / close | Row grows (layout animation): the description, the 240 px image (hidden at `height:1px; opacity:0`) and the bullet list "Logo design / Brand guidelines / Motion Identity / Art Direction" fade in. The "+" turns into "×". Rows below are pushed with a transform/scale correction | `spring {duration:.8, bounce:0}` ≈ k133 c23. Measured layout ≈ 810 ms; the list item fades `opacity 0→1` over the same span | `clicks/accordion_open_*.png`, `clicks/accordion_close_*.png` |
| Pricing toggle Monthly↔Annually | 16 px orange knob in a 44×24 track slides 20 px. Labels cross-fade #fff↔#bdbdbd. The price card swaps variant | Knob `spring {stiffness:500, damping:60, mass:1}` (≈ 50% at 91 ms, 99% at 483 ms). Label colour ≈ 650 ms | `clicks/plan_toggle_*.png` |
| Testimonial Next / Prev | Carousel of cards. The active card expands (image + quote, "Desktop" variant), the previous one shrinks to the image-only "Desktop 2" variant, and the track shifts with layout transforms (translateX up to 1320 px, scaleX 0.74–1.35 corrections) | ≈ 800 ms (component spring 0.4 s bounce 0.2 for small parts, 0.8 s for layout) | `clicks/testimonial_next_*.png`, `clicks/testimonial_prev_*.png` |

---

## 6. Menu open/close animation

### 6.1 Mobile 390×844 (video `mobile_menu/mobile_menu_390.webm`, frames `mobile_menu/mm390_open_*.png`, `mm390_close_*.png`, sheets `mobile_menu/sheet_open.png`, `sheet_close.png`, dense data `mobile_menu_dense.json`)
| Layer | From → To | Transition (bundle) | Measured |
|---|---|---|---|
| Trigger "Menu" (framer-4ZGaQ, 87×24) | Hamburger made of 3 white bars, each 24×2 px, at y = 4, 11, 18 inside a 28×24 box | `spring {duration:.4, bounce:.2}` ≈ k506 c36 (1.5% overshoot) | Top bar: translateY moves it to the centre and it rotates to −45°. Bottom bar rotates to +45°. Middle bar `opacity 1→0` and shrinks to `width:1px` (scaleX). Result is an 18×18 "X", done ≈ 410 ms. The label rolls "Menu"→"Close" with the text roll (0.2/0.025) |
| Backdrop `[data-framer-name=Background]` | `opacity 0→1`. Fixed full-screen, `rgba(0,0,0,.25)` + `backdrop-filter: blur(5px)`, z 9 | `spring {duration:.4, bounce:0}` | 50% at ≈ 95 ms, done ≈ 440 ms |
| Panel `[data-framer-name="Menu / Menu Overlay"]` | `x: 560 → 0`, `opacity 0 → 1`, bg `#0d0d0d`, full height (mobile full width; desktop 648 px wide on the right, padding 0 40) | `spring {duration:.6, bounce:0}` ≈ k237 c31 | Done ≈ 615 ms |
| Links Home / About / Services / Projects / Contact (Clash Display 54/700, rows 56 px apart, masked) | `y: 100 → 0` (opacity stays 1; revealed by the overflow mask) | `tween 0.8 s cubic-bezier(.645,.045,.355,1)`, delays **0, .05, .10, .15, .15 s** | Home done ≈ 815 ms after the panel starts, About +50 ms, Services +100, Projects/Contact +150 |
| Contact / Socials blocks | Ride in with the panel (no own animation) | | |
| **Close** | Panel `x 0→560` + `opacity 1→0` (spring 0.6), backdrop fades (spring 0.4, ≈ 390 ms), links return to `y:100` (tween 0.8 with the same delays, behind the panel). The X morphs back to the hamburger (≈ 490 ms) and the label rolls "Close"→"Menu". The overlay unmounts at ≈ 1 s | | |

### 6.2 Desktop 1440×900 (frames `extra/desktop_menu_open_{0100…1100}.png`, `extra/sheet_desktop_menu.png`)
The same component and timings. The panel is 648×900 on the right (x 792–1440). The rest of the page stays visible behind the 25% black + 5 px blur backdrop. The links sit at x 832, y 202/262/322/382/442. There is no dimming of sibling links on hover; the hovered link only gets its letter roll (0.3 s / 0.03 s).

---

## 7. Project detail page (`/projects/vertex-studio`)
Interactive set: nav email roll, Menu, newsletter "Subscribe", footer links, socials and contact (all identical to home, same timings), plus credits. There are no project-specific hover components (no next-project card hover, no gallery hover). Shots: `shots/project_*`. Data: `hover_project.json`, `hover_project_summary.txt`, `mouse_project.json`.

---

## 8. Motion tokens to reuse (Framer duration/bounce springs converted with framer-motion `findSpring`, mass 1)
| Name | Framer config | stiffness / damping | t50 / t90 / t99 | Used for |
|---|---|---|---|---|
| `springSnappy` | duration .4, bounce .2 | 506 / 36.0 (1.5% overshoot) | 67 / 132 / 175 ms | Hamburger→X, small toggles in testimonials |
| `springFade` | duration .4, bounce 0 | 533 / 46.2 | 72 / 169 / 288 ms | Backdrop fade, cursor-component variants |
| `springUI` | duration .6, bounce 0 | 237 / 30.8 | 109 / 253 / 432 ms | Buttons, cards, glass tab, prev/next, menu panel |
| `springLayout` | duration .8, bounce 0 | 133 / 23.1 | 145 / 337 / 576 ms | Accordion |
| `springCursor` | stiffness 400, damping 60, mass 1 | 400 / 60 | 111 / 322 / 624 ms | Cursor follower |
| `springToggle` | stiffness 500, damping 60, mass 1 | 500 / 60 | 91 / 252 / 483 ms | Pricing knob |
| `tweenColor` | 0.2 s `cubic-bezier(.44,0,.56,1)` | | | Form button bg |
| `textRoll` | 0.2 s `easeInOut` [.42,0,.58,1], stagger .025 s (big: 0.3 s / .03 s) | | | All text links |
| `menuLinks` | 0.8 s `cubic-bezier(.645,.045,.355,1)`, delays 0/.05/.1/.15 s | | | Menu link reveal |

Colour tokens involved: `#0d0d0d` (page bg and dark text), `#f65802` (orange), `#f65802d9` (orange hover), `#232222` (cards), `#232222b3` (service row hover), `#ffffff33` (glass tab rest), `#ffffff4d` (glass tab hover), `#ffffff1a` (tags), `#bdbdbd` (muted text), `#303030` (inner panel), `#3c3c3c` (borders), `#00000040` (backdrop).

---

## 9. Ideas to exceed the reference (built on the same language)
- Keep the difference-blend dot, and add a context state Portvio lacks. Over project cards it could grow to 72 px with "View" in an 11px uppercase label (spring k400 c60); over the accordion it could show a "+". Hide it on touch devices.
- Make the primary CTA magnetic (±6 px, spring k300 c20) and keep the square-fill and −45° arrow.
- Project card: keep the 1→1.1 second-image cross-fade, and add a 3D tilt of about ±4° with `perspective:1200px` driven by the mouse, plus a moving light sheen.
- Text roll: reuse the exact config (0.2 s easeInOut, 0.025 s stagger, rotateX ±90, perspective 1000) on all nav and footer links. Use the 0.3/0.03 version for big display links.

---

## 10. Files
- `research/portvio/interactions.md` (this file)
- `research/portvio/interactions/` contains `discover_home.json`, `hover_home.json` + `hover_home_summary.txt`, `hover_home2_partial.json` (process cards, prev/next) + summary, `hover_project.json` + summary, `mouse_home.json`, `mouse_project.json`, `cursor_home.json`, `clicks.json`, `extra.json`, `dom_home.json` (DOM, computed styles, hover CSS rules, colour tokens), `mobile_menu_390.json`, `mobile_menu_dense.json`, `log_*.txt`, `sheet_buttons.png`, `sheet_projectcard.png` and `sheet_misc.png`.
- `research/portvio/interactions/shots/` holds about 500 hover frame PNGs. `clicks/`, `extra/` and `mobile_menu/` hold frames, contact sheets and the webm video.
- `research/portvio/interactions/bundles/` holds the downloaded JS modules and `_home.html` used to confirm the configs.
- Scripts in `research/tools/`: `hov_01_discover.cjs`, `hov_02_capture.cjs`, `hov_03_summarize.cjs`, `hov_04_mouse.cjs`, `hov_05_cursor.cjs`, `hov_06_springfit.cjs`, `hov_07_bundles.cjs`, `hov_08_mobilemenu.cjs`, `hov_09_sheet.cjs`, `hov_10_mobiledense.cjs`, `hov_11_dom.cjs`, `hov_12_clicks.cjs`, `hov_13_extra.cjs`, `hov_14_menudim.cjs`, `hov_15_springconv.cjs`, `hov_16_focus.cjs`.
