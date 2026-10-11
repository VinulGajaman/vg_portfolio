"use client";

/**
 * <Preloader>: counter splash (DESIGN.md §2.5 U1, revised per Vinul: counter only, on every load
 * and reload). The inline head script adds html.no-preloader only for reduced motion or the
 * `portvio` profile, so the panel never flashes in those cases.
 *
 * Layout: fixed #0A0A0A panel, z 80, grain at .045. Bottom-right a large Clash counter 000 → 100
 * (tabular, masked), with a full-width 1px #3C3C3C hairline along the bottom whose orange fill
 * tracks the same value. Nothing else on screen.
 * Count: the shown value is min(real progress, timed ramp). The ramp runs 0 → 100 over RAMP_S with
 * power2.inOut, so the count is always visible from 000 even when everything is cached; real
 * progress (document.fonts.ready = 40%, hero media decode [data-preload-media] = 60%) can only
 * hold it back. Forced complete at MAX_MS.
 * At 100 an enter gesture fades in (see ENTER_VARIANT): completing it starts the background music
 * (browsers only allow sound after a user gesture), then the exit runs.
 * Exit (~1.3s): the counter rises out (yPercent −110, 0.6s mask) and the hairline fades; at .3s the
 * dark panel lifts on a constant 7° slant (left edge higher, 12.28vw = 100vw × tan 7°) over 0.9s
 * expoInOut, revealing an orange layer that follows 0.12s later; at .55s the hero intro starts.
 * Then scroll unlocks and ScrollTrigger refreshes.
 */
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { setUI, startIntro } from "@/lib/store";
import { startMusic } from "@/components/ui/SoundToggle";
import { EnterSlide } from "./EnterSlide";
import { EnterCircle } from "./EnterCircle";
import { EnterHold } from "./EnterHold";

/** Splash gesture while Vinul compares ideas (the gesture also unlocks the music). */
const ENTERS = { slide: EnterSlide, circle: EnterCircle, hold: EnterHold };
const ENTER_VARIANT: keyof typeof ENTERS = "hold";
const ENTER = ENTERS[ENTER_VARIANT];

const RAMP_S = 1.8;
const HOLD_S = 0.25;
const MAX_MS = 4000;
const TAN7 = Math.tan((7 * Math.PI) / 180); // 0.1228

/** Clip polygon for a panel lifting on a 7° slant; p = 0 covers the screen, p = 1 is gone. */
function slant(p: number) {
  const W = document.documentElement.clientWidth;
  const H = window.innerHeight;
  const s = W * TAN7;
  const right = (1 - p) * (H + s);
  return `polygon(0px 0px, 100% 0px, 100% ${right}px, 0px ${right - s}px)`;
}

export function Preloader() {
  const [done, setDone] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const enterFn = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !isPlus || html.classList.contains("no-preloader")) {
      html.classList.add("no-preloader");
      const t = window.setTimeout(startIntro, 300);
      const raf = requestAnimationFrame(() => setDone(true));
      return () => {
        window.clearTimeout(t);
        cancelAnimationFrame(raf);
      };
    }

    const panel = panelRef.current!;
    const accent = accentRef.current!;
    const num = numRef.current!;
    const fill = fillRef.current!;
    setUI({ preloader: true });
    lockScroll("preloader");
    window.scrollTo(0, 0);

    let real = 0;
    let fontsPart = 0;
    let mediaPart = 0;
    let exiting = false;
    let killed = false;
    const ramp = { v: 0 };
    let shown = 0;

    const render = () => {
      num.textContent = String(Math.round(shown)).padStart(3, "0");
      fill.style.transform = `scaleX(${shown / 100})`;
    };

    const exit = () => {
      if (exiting || killed) return;
      exiting = true;
      const lift = { dark: 0, accent: 0 };
      const setClips = () => {
        panel.style.clipPath = slant(lift.dark);
        accent.style.clipPath = slant(lift.accent);
      };
      gsap
        .timeline({
          delay: 0.05,
          onComplete: () => {
            setUI({ preloader: false });
            unlockScroll("preloader");
            ScrollTrigger.refresh();
            setDone(true);
          },
        })
        .call(setClips, [], 0)
        .to(countRef.current, { yPercent: -110, duration: 0.6, ease: "mask" }, 0)
        .to(lineRef.current, { autoAlpha: 0, duration: 0.35, ease: "out" }, 0)
        .to(enterRef.current, { autoAlpha: 0, scale: 0.94, duration: 0.4, ease: "out" }, 0)
        .to(lift, { dark: 1, duration: 0.9, ease: "expoInOut", onUpdate: setClips }, 0.3)
        .to(lift, { accent: 1, duration: 0.9, ease: "expoInOut", onUpdate: setClips }, 0.42)
        .call(startIntro, [], 0.55);
    };

    // At 100 the splash waits for "Enter": that click is the user gesture browsers need before
    // they allow sound, so the music starts exactly as the site is revealed.
    let armed = false;
    const enter = () => {
      if (!armed || exiting) return;
      startMusic();
      exit();
    };
    enterFn.current = enter;
    const arm = () => {
      if (armed) return;
      armed = true;
      const box = enterRef.current;
      if (box) {
        box.style.pointerEvents = "auto";
        gsap.fromTo(box, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", delay: HOLD_S });
      }
    };

    // The shown value never runs ahead of real progress or of the timed ramp.
    const tick = () => {
      if (killed || exiting) return;
      shown = Math.min(ramp.v, real);
      render();
      if (shown >= 100) arm();
    };
    gsap.ticker.add(tick);
    const rampTween = gsap.to(ramp, { v: 100, duration: RAMP_S, ease: "power2.inOut", delay: 0.15 });
    const force = window.setTimeout(() => (real = 100), MAX_MS);

    const update = () => {
      real = Math.min(100, fontsPart + mediaPart);
    };
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
        if (el instanceof HTMLImageElement) el.decode().then(one, one);
        else if (el instanceof HTMLVideoElement) {
          if (el.readyState >= 3) one();
          else el.addEventListener("canplay", one, { once: true });
        } else one();
      });
    }

    return () => {
      killed = true;
      gsap.ticker.remove(tick);
      rampTween.kill();
      window.clearTimeout(force);
      setUI({ preloader: false });
      unlockScroll("preloader");
    };
  }, []);

  if (done) return null;

  return (
    <div className="preloader fixed inset-0 z-[80]">
      {/* Orange layer revealed under the lifting dark panel */}
      <div
        ref={accentRef}
        className="absolute inset-0 bg-accent"
        style={{ clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)" }}
      />
      <div
        ref={panelRef}
        className="absolute inset-0 overflow-hidden bg-canvas-deep"
        style={{ clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[.045] mix-blend-overlay"
          style={{ backgroundImage: "url(/textures/grain.png)", backgroundSize: "256px 256px" }}
        />
        {/* Enter gesture (appears at 100) */}
        <div className="absolute inset-0 grid place-items-center">
          <div ref={enterRef} className="invisible pointer-events-none opacity-0">
            <ENTER onComplete={() => enterFn.current()} />
          </div>
        </div>

        <div aria-hidden className="absolute bottom-[18px] right-[var(--gutter)] overflow-hidden lg:bottom-[24px]">
          <span
            ref={countRef}
            className="tabular block font-display text-[clamp(72px,16vw,200px)] font-semibold leading-[0.85] tracking-[-0.02em] text-ink"
          >
            <span ref={numRef}>000</span>
          </span>
        </div>
        <div ref={lineRef} aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line">
          <div ref={fillRef} className="h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
