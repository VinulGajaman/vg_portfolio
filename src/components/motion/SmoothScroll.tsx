"use client";

/**
 * <SmoothScroll>: Lenis 1.8s exponential glide driven by gsap.ticker (DESIGN.md §2.4).
 * Lenis `anchors` is off: same-page hash links go through <TransitionLink> (Lenis' own anchor
 * handler resolved the sticky #hero to the current position and overrode the logo scroll).
 * One rAF for the page: gsap.ticker.add(t => lenis.raf(t*1000)), lagSmoothing(0),
 * lenis.on("scroll", ScrollTrigger.update). Inner scroll areas use data-lenis-prevent.
 * Under reduced motion Lenis is not mounted (native scroll); Lenis' own
 * respectReducedMotion stays on as a second safety net. ScrollTrigger.refresh() runs after
 * document.fonts.ready.
 */
import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisEasing } from "@/lib/motion-tokens";
import { sampleScroll, setLenis } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/hooks";

const OPTIONS = {
  duration: 1.8,
  easing: lenisEasing,
  smoothWheel: true,
  syncTouch: false,
  autoRaf: false,
  stopInertiaOnNavigate: true,
  respectReducedMotion: true,
};

function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    setLenis(lenis);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Keep the reader's place across ScrollTrigger refreshes. A refresh (resize, and every
    // breakpoint rebuild) scrolls to 0 to measure and is meant to restore, but on breakpoint
    // crossings the position was lost and the page snapped to the top. Remember the section at
    // the top of the viewport and how far into it the reader is, and return there afterwards,
    // like the browser's own scroll anchoring.
    const anchor = { el: null as HTMLElement | null, ratio: 0, y: 0, path: "" };
    const absTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const capture = () => {
      const y = window.scrollY;
      let el: HTMLElement | null = null;
      for (const s of document.querySelectorAll<HTMLElement>("section[id]:not(#hero), footer")) {
        if (absTop(s) <= y + 1) el = s;
        else break;
      }
      anchor.el = el;
      anchor.ratio = el ? (y - absTop(el)) / (el.offsetHeight || 1) : 0;
      anchor.y = y;
      anchor.path = window.location.pathname;
    };
    let refreshing = false;
    let raf = 0;
    const onRefreshInit = () => {
      refreshing = true;
      cancelAnimationFrame(raf);
    };
    const onRefresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        refreshing = false;
        const samePage = anchor.path === window.location.pathname;
        if (samePage && lenis.isScrolling !== "smooth" && (!anchor.el || anchor.el.isConnected)) {
          const raw = anchor.el ? absTop(anchor.el) + anchor.ratio * anchor.el.offsetHeight : anchor.y;
          const target = Math.max(0, Math.min(raw, ScrollTrigger.maxScroll(window)));
          // Native scroll, not lenis.scrollTo(): the refresh moved the page behind Lenis' back, so its
          // targetScroll can still equal `target` and scrollTo() would return early. Lenis re-syncs
          // from the resulting native scroll event.
          if (Math.abs(target - window.scrollY) > 2) window.scrollTo(0, target);
        }
        capture();
      });
    };
    capture();
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.addEventListener("refresh", onRefresh);

    const onScroll = () => {
      sampleScroll(lenis.scroll);
      ScrollTrigger.update();
      if (!refreshing) capture();
    };
    lenis.on("scroll", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      setLenis(null);
    };
  }, [lenis]);
  return null;
}

function NativeBridge() {
  useEffect(() => {
    const onScroll = () => sampleScroll(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Children always sit in the same slot, so toggling Lenis never remounts the page.
  return (
    <>
      {!reduce && <ReactLenis root options={OPTIONS} />}
      {reduce ? <NativeBridge /> : <LenisBridge />}
      {children}
    </>
  );
}
