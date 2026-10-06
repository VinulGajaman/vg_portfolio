# Component API (short reference)

All motion code: import `gsap`, `ScrollTrigger`, `SplitText`, `useMotion`, `onceInView` from `@/lib/gsap` (never `gsap` directly). Tokens: `@/lib/motion-tokens` (`SPRING`, `DUR`, `STAGGER`, `BEZIER`, `SCRUB`, `isPlus`). Every primitive has a reduced-motion branch; JS hovers are fine-pointer only. Use `m.*` from `motion/react` (LazyMotion strict). Intro gate: `useIntro(cb)` from `@/lib/store`. Media existence: `useMedia(id)` from `providers/MediaProvider`.

## motion/
| Primitive | Props (defaults) | DESIGN.md |
|---|---|---|
| `Reveal` | `as, variant: text\|card\|card-tall\|from-left, delay=.2, trigger: inview\|mount\|intro, start?, containerAnimation?` | §2.5 |
| `RevealText` | `as, mode: lines\|chars\|words, delay, stagger?, duration?, ease?, fromYPercent=110, trigger: inview\|mount\|intro\|manual, play?, start?, containerAnimation?, onComplete?, id?` | §2.5 U4 |
| `BlurText` | `children: string, as='p', trigger='mount'\|inview\|intro\|manual, play?, delay, stagger=.05` | §2.5 |
| `ScrollFillText` | `as='p', children (accent spans allowed), start='top 85%', end='bottom 55%', from=.18, id?` | §2.5 U5 |
| `MaskReveal` | `radius px, variant: bottom\|iris, delay, duration=1.4, fromScale=1.3, trigger, innerClassName` | §2.5 |
| `ScrollZoom` | `from=1.2, parallax=false, start, end, dwell=.4` (outer needs a size; child fills) | §2.5 U11 |
| `ParallaxImage` | `speed=.1, phone=false` (outer needs a size; inner is 120% tall) | §2.5 |
| `RollText` | `children: string, to?, size: default\|lg, active?` (hover host: closest `[data-roll-parent]`/a/button) | §2.5 |
| `SlotSwap` / `SlotValue` | `a, b?, axis: y\|x, distance?, active?` / `value, valueKey?, axis` | §2.5 |
| `Magnetic` | `strength=.3, max=10, halo=24, block?`; mark a child `data-magnetic-inner` for 0.5× extra | §2.5 U14 |
| `Tilt` | `max=6, isDisabled?: () => boolean, innerClassName` | §2.5 U20 |
| `Marquee` | `children: <li>s, speed=40, gap=8, mask: chips\|tiles\|none, velocity=true, reverse, label` | §2.5 U7 |
| `Counter` | `to, from=0, decimals, prefix, suffix, duration=1.4, delay, separator, start?, containerAnimation?, trigger: inview\|manual, play?` | §2.5 U6 |
| `StackCards` | `children: cards, top=100, step=24, gap=40, dwell='40svh', radius=16`; mark the card image `data-stack-image` | §3.7 U9 |
| `HorizontalRail` + `RailPanel` + `useRail()` | `header, gap=20, dwell=.15, progress, background, id, aria-labelledby`; `useRail().tween` → `Counter containerAnimation`, `getVelocity` → `Tilt isDisabled` | §3.8 U10 |
| `PinnedZoom` | `children (MediaSlot fill autoPlay={false}), left, right, id, headingId` | §3.10 |
| `StickyHero` | `children, coverSelector='#about', contentClassName`; layers: `data-hero-depth="0.31" data-hero-depth-scale="1.06"` | §3.2 |
| `Curtain` | place as first child of `#about` (content at z 4) | §3.3 |
| `Cursor`, `Preloader`, `Grain`, `ScrollProgress`, `SmoothScroll`, `PageTransitionProvider` | mounted once in `app/layout.tsx`; cursor states via `data-cursor="view\|open\|copy\|play\|hide"` + `data-cursor-label` | §2.4, §2.5 |
| `TransitionLink` | next/link props + `transitionTitle?`; `usePageTransition().navigate(href, title?)` | §2.5 U15 |
| `AmbientGlow` | `preset: a\|b\|c` or `blobs`, `parallax=.15` (inside a positioned section) | §1.6 |
| `Spotlight` | `as='div'` polymorphic wrapper; content above needs `relative` | §1.6 |

## ui/
| Component | Props | DESIGN.md |
|---|---|---|
| `PrimaryButton` | `children: string, variant: orange\|white\|dark, href?, transitionTitle?, onClick?, type, disabled, magnetic=true, download, asSpan` | §2.5 |
| `SubmitButton` | `children='Send Message', state: idle\|loading\|success\|error, successLabel, errorLabel` | §2.5 |
| `Tag` / `Chip` | `children` / `children, variant: glass\|outline` | §3.7, §3.2 |
| `Eyebrow` | `children: string, delay=.2, animate=true` | §3.3 |
| `SectionHeader` | `eyebrow, title: string\|string[], titleId, counter?, variant: split\|centred` | §1.4 |
| `Divider` | `variant: gradient\|solid, reverse, draw, delay` | §1.2 |
| `Accordion`, `AccordionItem id`, `AccordionTrigger label?`, `AccordionPanel`, `useAccordionItem()` | single-open FLIP accordion | §2.5, §3.5 |
| `LiveClock` | `tz='Asia/Colombo'` | §2.5 |
| `MediaSlot` | `id, fill?, rounded, ratio?, priority?, preloadMedia?, alt?, sizes?, mediaClassName, autoPlay/loop/controls/preloadVideo, fallback?, onReady?` | §5.3 |
| `Sparkle` / `ArrowIcon` | `size, className` / `kind: right\|hooked\|chevron-left\|chevron-right\|plus\|cross, size` | §1.3.1 |
| `Wordmark` | `variant: hero\|footer, sparkle=true, textClassName` (aria-hidden; pair with an sr-only h1) | §1.3.1 |
| `Timeline` | `nodes, trigger?: selector` | §3.9 U19 |
| `SkillsIndex` | none (reads `content/stack.ts`) | §3.4 |

Layout (`components/layout/`): `Nav`, `CompactNav`, `Menu`, `Footer`, `MenuTrigger`. Brand: `components/brand/Logo` (`Logo variant`, `LogoMark size`).
