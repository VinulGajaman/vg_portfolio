"use client";

/**
 * <SmoothScroll>: Lenis 1.8s exponential glide driven by gsap.ticker (DESIGN.md §2.4).
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
  anchors: { offset: 0, duration: 1.8 },
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
    const onScroll = () => {
      sampleScroll(lenis.scroll);
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);
    return () => {
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
