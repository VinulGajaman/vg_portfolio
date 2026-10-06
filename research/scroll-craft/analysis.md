# scroll-craft analysis (returned by repo analyst agent)

I could not write `analysis.md`: the harness blocks subagents from creating report files, so the analysis is below. The verbatim copy of the repo's design file did work.

**What the repo is.** scroll-craft is an agent skill (a Claude Code plugin called `nateherk-design`, v0.3.1, MIT), not a website template. It contains:
- a build procedure (`SKILL.md`)
- design rules in `references/taste.md`
- a small vanilla-JS scroll engine (`engine/scrollcraft.js` and `.css`) that reads `data-sc-*` attributes from your own HTML
- Playwright scripts that screenshot every scroll position and check for dead scroll, frozen video and contrast
- kie.ai image and video generation, plus an ffmpeg script that makes video scrub smoothly

**Stack.** It uses no GSAP, Lenis, framer-motion or three.js. It runs on native scroll events, one requestAnimationFrame loop, CSS sticky pinning and IntersectionObserver. Each section gets a scroll progress value from 0 to 1, published as the CSS variable `--sc-p`. The code is easy to port into React hooks.

**There is no DESIGN.md, design.md or CLAUDE.md.** The design-system file is `references/taste.md`, copied verbatim (hash-checked) to `DESIGN.source.md`.

**Techniques worth reusing (exact values):**
- **Pinned scroll progress:** `p = (y - top) / (height - vh)`. A pinned section needs at least 1.2 screens of scroll or it snaps.
- **Dwell (the shot settles mid-section):** `(1-L)*x + L*(4c³ + 0.5)` with `c = x - 0.5` and L at most 0.6. Easing is smoothstep, `x*x*(3-2x)`.
- **Fade windows:** text fades in over the first 30% of its window, holds at full opacity, then fades out over the last 30%, rising by up to 2.4vh. The hero headline must already be visible on first load.
- **Line-by-line text reveal:** each line slides up from 100% behind an `overflow:hidden` mask, with a 0.62 stagger spread. Add `.14em` bottom padding so descenders aren't cut, and re-split after fonts load.
- **Scroll-scrubbed video:** the video follows a smoothed target (0.18 per frame). Its time spans the whole time the section is on screen, not just the pinned part. Encode with `-g 8 -keyint_min 8 -sc_threshold 0 -crf 20` (mobile: 720p, `-g 4`).
- **Wipes:** `clip-path: inset()`, or `circle()` for an iris.
- **Horizontal rail:** moves by exactly `scrollWidth - vw`. Give it about one screen of scroll per item, plus one.
- **Layered parallax hero:** background lags 31%, middle 17%, subject 20%, foreground and text move at normal speed.
- **Mouse effects:**
  - tilt: 5 to 9°, perspective 1100px, smoothing 0.09
  - magnet: strength 0.2 to 0.35, smoothing 0.12
  - spotlight: 28rem radial glow at 16% accent
- **Fade-up on entry:** 14px rise over 620ms with `cubic-bezier(.23,1,.32,1)`, children staggered 30 to 80ms, fires once.
- **Count-ups:** 1400ms with a cubic ease-out.
- **Extras:** grain overlay at 0.045 opacity, a 2px progress bar, and background colour that blends between sections.

**What to adopt into our DESIGN.md.** Use taste.md as the quality floor and let portvio decide the look (fonts, colours, timings).
- **Motion:** animate only transform, opacity and clip-path. No ease-in, hover 120 to 180ms, press `scale(.97)`, enter from `scale(.95)` rather than `scale(0)`, hover effects only on mouse devices, and reduced motion still keeps the fades.
- **Type:** tracking tightens as size grows, `text-wrap: balance` on headings and `pretty` on body, 45 to 75 characters per line, and the hero headline steps down a size below 700px.
- **Colour:** six colour roles plus one accent, no pure black, tinted secondary text, contrast checked on the rendered page.
- **Spacing and depth:** 4px spacing scale, shadows tinted to the background, a 1px top highlight on raised surfaces, grain.
- **States:** hover, focus-visible, active and disabled on everything interactive.
- **Content:** no made-up statistics and no em dashes.

taste.md bans custom cursors, scroll cues and section numbers. You asked for mouse effects and a copy of portvio, so those override it here.

**Most useful for your images and videos:**
- Write one style description (lens, light, colour grade, texture, what to avoid) and reuse it word for word in every prompt.
- Say in each prompt where the empty space for text should go, and attach your photo as the reference every time.
- Never put text inside a generated image.
- For the layered hero, generate a clean background with you removed plus a transparent cut-out of you.
- Video moves should be one slow, continuous move with nothing entering or leaving the frame.
- Use each clip's own first frame as its poster image.

Files written:
- `D:/Vinul/Portfolio/me/research/scroll-craft/repo/` (full clone)
- `D:/Vinul/Portfolio/me/research/scroll-craft/DESIGN.source.md` (verbatim copy of `taste.md`)

Source files worth porting:
- `D:/Vinul/Portfolio/me/research/scroll-craft/repo/plugins/nateherk-design/skills/scroll-craft/engine/scrollcraft.js` and `scrollcraft.css`
- `D:/Vinul/Portfolio/me/research/scroll-craft/repo/plugins/nateherk-design/skills/scroll-craft/references/devices.md`, `hero-depth.md` and `worlds.md`