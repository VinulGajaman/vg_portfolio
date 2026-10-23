"use client";

/**
 * GSAP setup (DESIGN.md §2.1, §2.4). Import gsap, ScrollTrigger, SplitText and useGSAP from
 * here (never from "gsap" directly) so plugins and ease tokens are always registered.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import {
  BEZIER,
  MQ,
  SPRING_SAMPLES,
  dwell,
  smoothstep,
  type MQConditions,
  type SpringName,
} from "./motion-tokens";

/** Converts 25 equally spaced spring samples into a CustomEase path (§2.1). */
export function springPath(points: readonly number[]): string {
  const n = points.length - 1;
  return (
    "M0,0 " +
    points
      .slice(1)
      .map((y, i) => `L${((i + 1) / n).toFixed(4)},${y}`)
      .join(" ")
  );
}

let registered = false;

function register() {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

  // Cubic-bezier tokens
  for (const [name, b] of Object.entries(BEZIER)) {
    CustomEase.create(name, b.join(","));
  }
  // Exact springs
  for (const [name, s] of Object.entries(SPRING_SAMPLES)) {
    CustomEase.create(name, springPath(s.points));
  }

  ScrollTrigger.config({ ignoreMobileResize: true });
}

if (typeof window !== "undefined") register();

/** GSAP ease for a spring token, with its matching duration. */
export function springEase(name: SpringName): { ease: string; duration: number } {
  return { ease: name, duration: SPRING_SAMPLES[name].duration };
}

/** Ease functions for scrubbed tweens. */
export const dwellEase = (L = 0.4) => (x: number) => dwell(x, L);
export { smoothstep, dwell };

/* -------------------------------------------------------------------------- */
/* Trigger rule (§2.3)                                                          */
/* -------------------------------------------------------------------------- */

/**
 * 50% visible: "center bottom" for elements shorter than the viewport, "top center" for
 * taller ones. Returned as a function so ScrollTrigger re-evaluates it on refresh.
 */
export function revealStart(el: Element) {
  return () =>
    (el as HTMLElement).offsetHeight < window.innerHeight ? "center bottom" : "top center";
}

let restoring = false;
/** Set during Back/Forward restoration so reveals above the restored position jump to the end. */
export function setRestoring(v: boolean) {
  restoring = v;
}
export function isRestoring() {
  return restoring;
}

/**
 * Fires `play` when the element meets its start, including when a fast scroll skips past it. If
 * the trigger is already passed during a Back/Forward restoration, `settle` runs instead so
 * above-the-fold content never pops.
 * With `reset` (used everywhere, per Vinul: entrance animations replay on every visit), `reset`
 * rewinds the animation once the element has fully left the screen, in either direction, and
 * `play` runs again the next time it comes back (scrolling down or up). Without it, it plays once.
 */
export function onceInView(
  el: Element,
  play: () => void,
  opts: {
    start?: string | (() => string);
    containerAnimation?: gsap.core.Animation;
    settle?: () => void;
    reset?: () => void;
  } = {},
): ScrollTrigger {
  if (opts.reset) {
    const reset = opts.reset;
    const ca = opts.containerAnimation;
    let shown = false;
    const show = (self: ScrollTrigger) => {
      if (shown) return;
      shown = true;
      if (isRestoring() && self.progress === 1 && opts.settle) opts.settle();
      else play();
    };
    const hide = () => {
      if (!shown) return;
      shown = false;
      reset();
    };
    const out = ScrollTrigger.create({
      trigger: el,
      start: ca ? "left right" : "top bottom",
      end: ca ? "right left" : "bottom top",
      containerAnimation: ca,
      onLeave: hide,
      onLeaveBack: hide,
    });
    const st = ScrollTrigger.create({
      trigger: el,
      start: opts.start ?? revealStart(el),
      end: ca ? "right left" : "bottom top",
      containerAnimation: ca,
      onEnter: show,
      onEnterBack: show,
    });
    // One handle for the caller: killing it removes both triggers.
    const kill = st.kill.bind(st);
    st.kill = (...args: Parameters<ScrollTrigger["kill"]>) => {
      out.kill();
      return kill(...args);
    };
    return st;
  }
  let fired = false;
  const fire = (self: ScrollTrigger) => {
    if (fired) return;
    fired = true;
    if (isRestoring() && self.progress === 1 && opts.settle) opts.settle();
    else play();
    // Kill after the current callback stack so ScrollTrigger is not mutated mid-update.
    requestAnimationFrame(() => self.kill());
  };
  return ScrollTrigger.create({
    trigger: el,
    start: opts.start ?? revealStart(el),
    end: opts.containerAnimation ? "right left" : "bottom top",
    containerAnimation: opts.containerAnimation,
    onEnter: fire,
    onLeave: fire,
    onEnterBack: fire,
  });
}

/* -------------------------------------------------------------------------- */
/* Refresh scheduling (§2.4): fonts ready, preloader exit, media swaps          */
/* -------------------------------------------------------------------------- */

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
/** Debounced ScrollTrigger.refresh(), so a burst of media loads refreshes once. */
export function scheduleRefresh(delay = 120) {
  if (typeof window === "undefined") return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    ScrollTrigger.refresh();
  }, delay);
}

/* -------------------------------------------------------------------------- */
/* useMotion: useGSAP + gsap.matchMedia with the five §2.4 contexts             */
/* -------------------------------------------------------------------------- */

export type MotionCleanup = void | (() => void);

/**
 * Runs `build` inside useGSAP (scoped, auto-reverted on unmount and route change) and inside a
 * gsap.matchMedia() with the isDesktop / isTablet / isPhone / reduce / fine contexts, so every
 * effect is rebuilt when a context flips. Return a cleanup function for listeners.
 */
export function useMotion(
  build: (c: MQConditions) => MotionCleanup,
  opts: { scope?: RefObject<Element | null>; dependencies?: unknown[] } = {},
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ, (ctx) => build(ctx.conditions as MQConditions));
      return () => mm.revert();
    },
    {
      scope: opts.scope as RefObject<Element> | undefined,
      dependencies: opts.dependencies ?? [],
      revertOnUpdate: true,
    },
  );
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
