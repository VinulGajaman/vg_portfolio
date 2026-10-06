"use client";

/**
 * <Preloader> (DESIGN.md §2.5, U1). Once per session (sessionStorage "vg-loaded"); the inline
 * head script adds html.no-preloader on later visits / reduced motion so it never flashes.
 * Layout: fixed #0A0A0A panel, z 80, with grain. Bottom-left "VINUL GAJAMAN" (h2, RevealText
 * chars, stagger .035); bottom-right a 3-digit counter (display-counter) over a 1px #3C3C3C
 * track with an orange scaleX fill; top-left role, top-right location (small, ink-soft).
 * Progress: document.fonts.ready = 40%, hero media decode ([data-preload-media]) = 60%; the
 * counter follows with quickTo (0.6s power3.out); min 1.4s, forced complete at 3.0s.
 * Exit (~1.2s): counter + name yPercent −110 (0.6s mask, stagger .05); at .35s the panel lifts
 * on a constant 7° slant (left edge higher, 12.28vw = 100vw × tan 7°) over 0.9s expoInOut;
 * at .55s the hero intro starts. Then lenis.start(), ScrollTrigger.refresh(), cursor enabled.
 * When skipped, the intro gate opens 0.3s after hydration (portvio's appear start).
 */
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { setUI, startIntro } from "@/lib/store";
import { preloader as copy } from "@/content/site";
import { RevealText } from "./RevealText";

const MIN_MS = 1400;
const MAX_MS = 3000;
const TAN7 = Math.tan((7 * Math.PI) / 180); // 0.1228

export function Preloader() {
  const [done, setDone] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const exitRefs = useRef<HTMLElement[]>([]);
  const fadeRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("vg-loaded") === "1";
    } catch {
      seen = true;
    }
    if (seen || reduce || !isPlus || html.classList.contains("no-preloader")) {
      html.classList.add("no-preloader");
      const t = window.setTimeout(startIntro, 300);
      const raf = requestAnimationFrame(() => setDone(true));
      return () => {
        window.clearTimeout(t);
        cancelAnimationFrame(raf);
      };
    }
    try {
      sessionStorage.setItem("vg-loaded", "1");
    } catch {
      /* private mode: plays once per page load instead */
    }

    const panel = panelRef.current!;
    const num = numRef.current!;
    const fill = fillRef.current!;
    setUI({ preloader: true });
    lockScroll("preloader");
    window.scrollTo(0, 0);

    const started = performance.now();
    const shown = { v: 0 };
    let target = 0;
    let fontsPart = 0;
    let mediaPart = 0;
    let exiting = false;
    let killed = false;

    const render = () => {
      const v = Math.round(shown.v);
      num.textContent = String(v).padStart(3, "0");
      fill.style.transform = `scaleX(${shown.v / 100})`;
    };
    const to = gsap.quickTo(shown, "v", { duration: 0.6, ease: "power3.out", onUpdate: render });

    const exit = () => {
      if (exiting || killed) return;
      exiting = true;
      const W = () => document.documentElement.clientWidth;
      const H = () => window.innerHeight;
      const lift = { p: 0 };
      const setClip = () => {
        const s = W() * TAN7;
        const right = (1 - lift.p) * (H() + s);
        const left = right - s;
        panel.style.clipPath = `polygon(0px 0px, 100% 0px, 100% ${right}px, 0px ${left}px)`;
      };
      setClip();
      gsap
        .timeline({
          onComplete: () => {
            setUI({ preloader: false });
            unlockScroll("preloader");
            ScrollTrigger.refresh();
            setDone(true);
          },
        })
        .to(exitRefs.current, { yPercent: -110, duration: 0.6, ease: "mask", stagger: 0.05 }, 0)
        .to(fadeRefs.current, { autoAlpha: 0, duration: 0.4, ease: "out" }, 0)
        .to(lift, { p: 1, duration: 0.9, ease: "expoInOut", onUpdate: setClip }, 0.35)
        .call(startIntro, [], 0.55);
    };

    const update = () => {
      target = Math.min(100, fontsPart + mediaPart);
      to(target);
    };
    const check = () => {
      if (killed || exiting) return;
      const elapsed = performance.now() - started;
      if (elapsed >= MAX_MS) {
        target = 100;
        to(100);
      }
      if (target >= 100 && elapsed >= MIN_MS && shown.v >= 99.5) {
        exit();
        return;
      }
      raf = requestAnimationFrame(check);
    };
    let raf = requestAnimationFrame(check);

    document.fonts.ready.then(() => {
      fontsPart = 40;
      update();
    });

    const media = Array.from(document.querySelectorAll<HTMLElement>("[data-preload-media]"));
    if (!media.length) {
      mediaPart = 60;
      update();
    } else {
      let ready = 0;
      const one = () => {
        ready += 1;
        mediaPart = (60 * ready) / media.length;
        update();
      };
      media.forEach((el) => {
        if (el instanceof HTMLImageElement) {
          el.decode().then(one, one);
        } else if (el instanceof HTMLVideoElement) {
          if (el.readyState >= 3) one();
          else el.addEventListener("canplay", one, { once: true });
        } else one();
      });
    }

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      setUI({ preloader: false });
      unlockScroll("preloader");
    };
  }, []);

  if (done) return null;

  const addExit = (el: HTMLElement | null) => {
    if (el && !exitRefs.current.includes(el)) exitRefs.current.push(el);
  };
  const addFade = (el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  return (
    <div
      ref={panelRef}
      aria-hidden
      className="preloader fixed inset-0 z-[80] bg-canvas-deep"
      style={{ clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[.045] mix-blend-overlay"
        style={{ backgroundImage: "url(/textures/grain.png)", backgroundSize: "256px 256px" }}
      />
      <div className="relative flex h-full flex-col justify-between px-[var(--gutter)] py-[20px] lg:py-[24px]">
        <div className="flex justify-between gap-6">
          <span ref={addFade} className="type-small text-ink-soft">
            {copy.topLeft}
          </span>
          <span ref={addFade} className="type-small text-right text-ink-soft">
            {copy.topRight}
          </span>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="overflow-hidden pb-[.1em]">
            <div ref={addExit}>
              <RevealText as="p" mode="chars" trigger="mount" stagger={0.035} className="type-h2">
                {copy.name}
              </RevealText>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="overflow-hidden">
              <span ref={addExit} className="type-display-counter block">
                <span ref={numRef}>000</span>
              </span>
            </div>
            <div ref={addFade} className="mt-3 h-px w-full min-w-[200px] overflow-hidden bg-line">
              <div ref={fillRef} className="h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
