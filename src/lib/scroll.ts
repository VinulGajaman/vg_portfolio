"use client";

/**
 * Scroll bridge: the Lenis instance (when mounted), scroll locking by reason, scroll velocity
 * and a scrollTo that works with or without Lenis (reduced motion = native scroll, §2.4).
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenis = l;
  if (l && locks.size) l.stop();
}

export function getLenis(): Lenis | null {
  return lenis;
}

/* ---------------------------- scroll locking ----------------------------- */

const locks = new Set<string>();

/** lenis.stop() while the menu, preloader or a page transition is active (§2.4). */
export function lockScroll(reason: string) {
  locks.add(reason);
  lenis?.stop();
  if (!lenis && typeof document !== "undefined") {
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll(reason: string) {
  locks.delete(reason);
  if (locks.size) return;
  lenis?.start();
  if (typeof document !== "undefined") document.documentElement.style.overflow = "";
}

/* ------------------------------- scrollTo -------------------------------- */

type ScrollTarget = number | string | HTMLElement;

export function scrollToTarget(
  target: ScrollTarget,
  opts: { immediate?: boolean; offset?: number; force?: boolean; duration?: number } = {},
) {
  if (lenis) {
    lenis.scrollTo(target, {
      immediate: opts.immediate,
      offset: opts.offset ?? 0,
      force: opts.force ?? true,
      duration: opts.duration ?? 1.8,
    });
    return;
  }
  const behavior: ScrollBehavior = "auto";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
    window.scrollTo({ top, behavior });
  }
}

export function getScrollY(): number {
  if (lenis) return lenis.scroll;
  return typeof window === "undefined" ? 0 : window.scrollY;
}

/* ------------------------------- velocity -------------------------------- */

let lastY = 0;
let lastT = 0;
let velocity = 0;

/** Feed one scroll sample (called by SmoothScroll on every Lenis or native scroll event). */
export function sampleScroll(y: number) {
  const now = performance.now();
  const dt = now - lastT;
  if (lastT && dt > 0 && dt < 200) {
    const v = ((y - lastY) / dt) * 1000;
    velocity = velocity * 0.6 + v * 0.4;
  } else {
    velocity = 0;
  }
  lastY = y;
  lastT = now;
}

/** Scroll velocity in px/s (signed: positive = scrolling down). Decays to 0 when idle. */
export function getScrollVelocity(): number {
  if (!lastT) return 0;
  const idle = performance.now() - lastT;
  if (idle > 120) return 0;
  return velocity;
}
