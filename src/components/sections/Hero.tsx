"use client";

/**
 * Hero `#hero` (DESIGN.md §3.2). Sticky under every later section; <StickyHero> owns the
 * shrink (scale 1 → .7, y −80, radius, dim), the drift and the L0 depth layer.
 * This file adds: the two-layer load timeline (wrapper = portvio exact, inner = upgrade),
 * layer gating (plate + subject only when both decode before the intro), the wordmark /
 * subject depth rates in layered mode, mouse parallax, the thumbnail carousel and chips.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { StickyHero } from "@/components/motion/StickyHero";
import { BlurText } from "@/components/motion/BlurText";
import { RevealText } from "@/components/motion/RevealText";
import { Marquee } from "@/components/motion/Marquee";
import { SlotSwap, SlotValue } from "@/components/motion/SlotSwap";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Chip } from "@/components/ui/Chip";
import { Sparkle } from "@/components/ui/Sparkle";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useMediaMap } from "@/components/providers/MediaProvider";
import { gsap, useMotion } from "@/lib/gsap";
import {
  DUR,
  isPlus,
  SCRUB,
  SPRING,
  SPRING_SAMPLES,
  STAGGER,
} from "@/lib/motion-tokens";
import { getUI, useIntro } from "@/lib/store";
import { useIsDesktop, useReducedMotion } from "@/lib/hooks";
import { hero } from "@/content/site";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------------ */

function PixelCross({ className }: { className?: string }) {
  // 24px white pixel cross: five 4.8px squares on a 5×5 grid.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 5 5"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <rect x="2" y="0" width="1" height="1" />
      <rect x="2" y="1" width="1" height="1" />
      <rect x="0" y="2" width="5" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="2" y="4" width="1" height="1" />
    </svg>
  );
}

/** Fitted wordmark (§1.3.1) with hand-split chars so the intro can mask them per line. */
function HeroWordmark() {
  const word = (w: string, sparkle = false) => (
    <span className="-my-[.12em] inline-block overflow-hidden py-[.12em] [perspective:1000px]">
      {Array.from(w).map((c, i) => (
        <span
          key={i}
          data-wm-char=""
          className="inline-block origin-[50%_100%]"
        >
          {c}
        </span>
      ))}
      {sparkle && (
        // Lifted with relative top (no layout effect), not align-super: a raised inline box grew the
        // line box and opened a big gap between the two wordmark lines on phone.
        <span
          data-wm-char=""
          className="relative -top-[.45em] inline-block origin-[50%_100%]"
        >
          <Sparkle className="ml-[.02em] w-[.28em]" />
        </span>
      )}
    </span>
  );
  return (
    <div aria-hidden className="w-full [container-type:inline-size]">
      <p
        className="type-display-wordmark m-0 whitespace-nowrap [--wm-k:8.93]"
        style={{ fontSize: "calc(100cqw / var(--wm-k))" }}
      >
        {word(hero.wordmarkLines[0])}
        <span> </span>
        {word(hero.wordmarkLines[1], true)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const THUMB_W = 130;

function HeroCarousel() {
  const n = hero.thumbs.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);

  // Pause off-screen and while the hero is covered.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let inView = true;
    let covered = false;
    const sync = () => setVisible(inView && !covered);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    const onCovered = (e: Event) => {
      covered = Boolean((e as CustomEvent<boolean>).detail);
      sync();
    };
    window.addEventListener("vg:hero-covered", onCovered);
    return () => {
      io.disconnect();
      window.removeEventListener("vg:hero-covered", onCovered);
    };
  }, []);

  // 5s autoplay with a linear progress line; restarts on every index change.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (reduce) {
      gsap.set(bar, { scaleX: 0 });
      tweenRef.current = null;
      return;
    }
    const t = gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, duration: 5, ease: "none", onComplete: next },
    );
    tweenRef.current = t;
    return () => {
      t.kill();
    };
  }, [index, reduce, next]);

  const paused = hover || focus || !visible || reduce;
  useEffect(() => {
    const t = tweenRef.current;
    if (!t) return;
    if (paused) t.pause();
    else t.resume();
  }, [paused, index]);

  return (
    <div
      ref={rootRef}
      className="flex gap-[6px]"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label="Snapshots"
    >
      <div className="flex flex-col gap-2">
        <div className="relative h-[110px] w-[130px] overflow-hidden rounded-md">
          <m.div
            className="flex h-full"
            style={{ width: THUMB_W * n }}
            initial={false}
            animate={{ x: -index * THUMB_W }}
            transition={reduce ? { duration: 0 } : SPRING.springUI}
          >
            {hero.thumbs.map((id, i) => (
              <div
                key={id}
                className="relative h-full w-[130px] shrink-0"
                aria-hidden={i !== index}
              >
                <MediaSlot id={id} fill sizes="130px" />
              </div>
            ))}
          </m.div>
          <span
            ref={barRef}
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent"
          />
        </div>
        <p className="type-small flex text-ink tabular" aria-live="polite">
          <SlotValue value={String(index + 1).padStart(2, "0")} />
          <span>/{String(n).padStart(2, "0")}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={next}
        aria-label="Next snapshot"
        className="glass pressable grid h-[110px] w-[32px] place-items-center rounded-sm text-ink transition-colors duration-200 hover:bg-glass-hover focus-visible:bg-glass-hover"
      >
        <SlotSwap axis="x" a={<ArrowIcon kind="chevron-right" size={16} />} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const introTl = useRef<gsap.core.Timeline | null>(null);
  const introStarted = useRef(false);
  const map = useMediaMap();
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();

  /* Layer gating: plate + subject only when both exist and decode before the intro. */
  const plate = map["hero-bg-plate"];
  const subject = map["hero-subject"];
  const canLayer = Boolean(plate && subject);
  const [layered, setLayered] = useState(false);
  useEffect(() => {
    if (!plate || !subject) return;
    let cancelled = false;
    Promise.all(
      [plate.src, subject.src].map((src) => {
        const img = new Image();
        img.src = src;
        return img.decode();
      }),
    )
      .then(() => {
        if (!cancelled && !getUI().introReady) setLayered(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [plate, subject]);

  /* Optional cinemagraph: desktop only, never under data-saver or reduced motion. */
  const [saveData, setSaveData] = useState(true);
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only capability read
    setSaveData(Boolean(c?.saveData));
  }, []);
  const useLoop =
    Boolean(map["hero-loop"]) && isDesktop && !saveData && !reduce;
  const [loopReady, setLoopReady] = useState(false);
  useEffect(() => {
    if (!useLoop) return;
    const onCovered = (e: Event) => {
      const v = rootRef.current?.querySelector<HTMLVideoElement>(
        "[data-hero-loop] video",
      );
      if (!v) return;
      if ((e as CustomEvent<boolean>).detail) v.pause();
      else void v.play().catch(() => {});
    };
    window.addEventListener("vg:hero-covered", onCovered);
    return () => window.removeEventListener("vg:hero-covered", onCovered);
  }, [useLoop]);

  /* Load timeline + mouse parallax. */
  useMotion(
    ({ reduce: rm, fine, isPhone }) => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ paused: true });
      const add = (
        sel: string,
        from: gsap.TweenVars,
        to: gsap.TweenVars,
        at: number,
      ) => {
        const els = q(sel);
        if (els.length) tl.fromTo(els, from, { ...to, force3D: true }, at);
      };
      const H = SPRING_SAMPLES.springHero.duration;
      if (rm) {
        add(
          "[data-intro]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: DUR.reduced, ease: "out" },
          0,
        );
      } else {
        add(
          '[data-hi="bg"]',
          { scale: 1.2, autoAlpha: 0.001 },
          { scale: 1, autoAlpha: 1, duration: 1, ease: "portvio" },
          0,
        );
        add(
          '[data-hi="wm"]',
          { y: 52, autoAlpha: 0.001 },
          { y: 0, autoAlpha: 1, duration: H, ease: "springHero" },
          0.4,
        );
        add(
          '[data-hi="tag"]',
          { x: -40, autoAlpha: 0.001 },
          { x: 0, autoAlpha: 1, duration: H, ease: "springHero" },
          0.8,
        );
        add(
          '[data-hi="para"]',
          { y: 40, autoAlpha: 0.001 },
          { y: 0, autoAlpha: 1, duration: H, ease: "springHero" },
          0.8,
        );
        add(
          '[data-hi="car"]',
          { x: 40, autoAlpha: 0.001 },
          { x: 0, autoAlpha: 1, duration: H, ease: "springHero" },
          1.2,
        );
        add(
          '[data-hi="chips"]',
          { y: 40, autoAlpha: 0.001 },
          {
            y: 0,
            autoAlpha: 1,
            duration: SPRING_SAMPLES.springLayout.duration,
            ease: "springLayout",
          },
          1.2,
        );
        if (isPlus) {
          add(
            '[data-hi="subject"]',
            { scale: 1.12, yPercent: 4 },
            { scale: 1, yPercent: 0, duration: 1.6, ease: "expo.out" },
            0,
          );
          add(
            "[data-wm-char]",
            { yPercent: 110, rotateX: -40 },
            {
              yPercent: 0,
              rotateX: 0,
              duration: 1.2,
              ease: "expo.out",
              stagger: STAGGER.charsWordmark,
            },
            0.4,
          );
          add(
            '[data-hi="tag-icon"]',
            { rotate: -90 },
            { rotate: 0, duration: H, ease: "springHero" },
            0.8,
          );
        }
      }
      introTl.current = tl;
      if (introStarted.current) tl.progress(1);

      if (!fine || isPhone || rm) return;
      const layers = q("[data-mouse]").map((el) => ({
        amt: parseFloat((el as HTMLElement).dataset.mouse ?? "0") || 0,
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        layers.forEach((l) => {
          l.x(nx * l.amt);
          l.y(ny * l.amt);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: rootRef },
  );

  useIntro(() => {
    introStarted.current = true;
    introTl.current?.play();
  });

  /* Layered scroll depth for L1 (wordmark .17·T) and L2 (subject .20·T). L0 lives in StickyHero. */
  useMotion(
    ({ reduce: rm }) => {
      const root = rootRef.current;
      const cover = document.querySelector<HTMLElement>("#about");
      if (!root || !cover || !layered || rm || !isPlus) return;
      const T = () => 80 + 0.1 * cover.offsetHeight;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: cover,
          start: "top bottom",
          end: "bottom bottom",
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      });
      gsap.utils
        .selector(root)("[data-depth]")
        .forEach((el) => {
          const rate =
            parseFloat((el as HTMLElement).dataset.depth ?? "0") || 0;
          tl.fromTo(el, { y: 0 }, { y: () => rate * T(), force3D: true }, 0);
        });
    },
    { scope: rootRef, dependencies: [layered] },
  );

  return (
    <StickyHero
      aria-labelledby="hero-title"
      contentClassName="justify-between md:justify-end"
    >
      <div ref={rootRef} className="contents">
        {/* L0: background (single portrait, or the plate in layered mode) */}
        <div
          className="absolute inset-0 z-0"
          data-hero-depth="0.31"
          data-hero-depth-scale="1.06"
        >
          <div className="absolute inset-0" data-mouse="10">
            <div className="absolute inset-0" data-hi="bg" data-intro="">
              <MediaSlot
                id="hero-portrait"
                fill
                priority
                preloadMedia
                sizes="100vw"
                className={cn(
                  "hidden transition-opacity duration-[400ms] md:block",
                  layered && "md:opacity-0",
                )}
              />
              {canLayer && (
                <MediaSlot
                  id="hero-bg-plate"
                  fill
                  sizes="100vw"
                  className={cn(
                    "hidden opacity-0 transition-opacity duration-[400ms] md:block",
                    layered && "opacity-100",
                  )}
                />
              )}
              {useLoop && (
                <div
                  data-hero-loop=""
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-[800ms]",
                    loopReady && "opacity-100",
                  )}
                >
                  <MediaSlot
                    id="hero-loop"
                    fill
                    onReady={() => setLoopReady(true)}
                  />
                </div>
              )}
              <MediaSlot
                id="hero-portrait-mobile"
                fill
                priority
                sizes="100vw"
                className="md:hidden"
              />
            </div>
          </div>
        </div>

        {/* L2: subject cut-out (layered mode only) */}
        {canLayer && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-[2] hidden opacity-0 transition-opacity duration-[400ms] md:block",
              layered && "opacity-100",
            )}
            data-depth="0.20"
            aria-hidden={!layered}
          >
            <div className="absolute inset-0" data-mouse="22">
              <div className="absolute inset-0" data-hi="subject">
                <MediaSlot
                  id="hero-subject"
                  fill
                  sizes="100vw"
                  mediaClassName="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Legibility scrims (siblings of the copy, never children) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 25%, rgba(13,13,13,.45), transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{
            background:
              "linear-gradient(0deg, rgba(13,13,13,.55) 0%, transparent 38%)",
          }}
        />

        {/* Content column: the backdrop stays full-bleed, but copy is capped at the site's 1400px
            content width (portvio's 1440 container) so it does not stretch on wide screens. No
            z-index here, so the layered depth (plate / wordmark / subject) still interleaves. */}
        <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end">
          {/* Top group: in flow on phone, absolutely placed on tablet / desktop */}
          <div className="relative z-[4] flex flex-col items-start gap-[30px] pb-10 pt-[100px] md:static md:p-0">
            <div className="md:absolute md:left-[80px] md:top-[260px] md:z-[4] md:w-[280px] lg:left-[220px]">
              <div data-mouse="4">
                <div
                  data-hi="tag"
                  data-intro=""
                  className="flex max-w-[280px] items-start gap-5"
                >
                  <span
                    data-hi="tag-icon"
                    className="mt-[2px] block shrink-0 text-ink"
                  >
                    <PixelCross />
                  </span>
                  <BlurText
                    as="p"
                    trigger="intro"
                    delay={0.8}
                    className="type-ui text-ink"
                  >
                    {hero.tagline}
                  </BlurText>
                </div>
              </div>
            </div>
            <div className="md:absolute md:right-[80px] md:top-[260px] md:z-[4] lg:right-[220px]">
              <div data-mouse="4">
                <div data-hi="car" data-intro="">
                  <HeroCarousel />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom group: wordmark, then paragraph + chips */}
          <div className="flex flex-col gap-[30px]">
            <h1
              id="hero-title"
              className={cn("relative", layered ? "z-[1]" : "z-[4]")}
            >
              <span className="sr-only">{hero.srHeading}</span>
              <span className="block" data-depth="0.17">
                <span className="block" data-mouse="-8">
                  <span className="block" data-hi="wm" data-intro="">
                    <HeroWordmark />
                  </span>
                </span>
              </span>
            </h1>
            {/* Stacked until desktop: side by side at tablet width squeezed the paragraph into a narrow column. */}
            <div className="relative z-[4] flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div data-hi="para" data-intro="" className="max-w-[540px]">
                <RevealText
                  as="p"
                  mode="lines"
                  trigger="intro"
                  delay={0.8}
                  className="type-lead text-ink"
                >
                  {hero.paragraph}
                </RevealText>
              </div>
              <div
                data-hi="chips"
                data-intro=""
                className="w-full min-w-0 lg:max-w-[550px]"
              >
                <Marquee speed={40} gap={8} mask="chips" label="Core stack">
                  {hero.chips.map((c) => (
                    <li key={c}>
                      <Chip variant="glass">{c}</Chip>
                    </li>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StickyHero>
  );
}
