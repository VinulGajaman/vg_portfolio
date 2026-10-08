"use client";

/**
 * <SkillsGlitch>: the CV's skills as a corrupted-signal display. A dark card with CRT scan lines.
 *   - Title: the active group name, huge Clash uppercase, built from three stacked copies (white
 *     on top, red and cyan underneath). During a glitch burst (~650ms) the copies split apart and
 *     every copy is cut into horizontal slices (clip-path inset) that jump sideways at random,
 *     with noise bars flashing across; the name swaps mid-burst, then everything snaps back.
 *   - Skills: the group's tools as chips that decode in (random glyphs → final text, left to
 *     right) after each change.
 *   - Autoplay every CYCLE_MS while on screen and not hovered; pills below jump directly; hovering
 *     the title fires a small glitch. Reduced motion: a plain cross-fade, no slices or scramble.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { Decode } from "@/components/ui/Decode";

const CYCLE_MS = 4000;
const BURST_MS = 650;
const pad = (n: number) => String(n).padStart(2, "0");

export function SkillsGlitch({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLDivElement>(null);
  const bursting = useRef(false);
  const n = skillGroups.length;
  const group = skillGroups[shown];

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Run a glitch burst; `swap` (if given) is applied at the midpoint. */
  const burst = useCallback(
    (ms: number, swap?: () => void) => {
      const title = titleRef.current;
      const noise = noiseRef.current;
      if (!title || reduce || bursting.current) {
        swap?.();
        return;
      }
      bursting.current = true;
      const layers = Array.from(title.children) as HTMLElement[];
      const start = performance.now();
      let swapped = !swap;
      let raf = 0;
      const tick = (now: number) => {
        const t = (now - start) / ms;
        if (!swapped && t > 0.45) {
          swapped = true;
          swap?.();
        }
        if (t >= 1) {
          layers.forEach((l) => {
            l.style.clipPath = "";
            l.style.transform = "";
          });
          if (noise) noise.style.opacity = "0";
          bursting.current = false;
          return;
        }
        const k = Math.sin(t * Math.PI); // 0 → 1 → 0
        layers.forEach((l, i) => {
          if (Math.random() < 0.35) return; // hold some frames for a stuttery feel
          const top = Math.random() * 80;
          const h = 6 + Math.random() * 30;
          const shift = (Math.random() - 0.5) * 60 * k;
          const split = i === 1 ? -8 * k : i === 2 ? 8 * k : 0;
          l.style.clipPath = Math.random() < 0.7 * k ? `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)` : "";
          l.style.transform = `translate(${(i === 0 ? shift * 0.4 : shift + split).toFixed(1)}px, 0)`;
        });
        if (noise) {
          noise.style.opacity = String(0.6 * k);
          noise.style.backgroundPosition = `0 ${Math.random() * 200}px`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
    [reduce],
  );

  // Change group: glitch out, swap at the midpoint.
  useEffect(() => {
    if (active === shown) return;
    burst(BURST_MS, () => setShown(active));
  }, [active, shown, burst]);

  useEffect(() => {
    if (!inView || hovered || reduce) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [active, inView, hovered, reduce, n]);

  const layer = "col-start-1 row-start-1 font-display font-bold uppercase leading-[.9] text-[44px] md:text-[96px] lg:text-[124px] will-change-transform";

  return (
    <div
      ref={boxRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn("border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0b0a0a]", className)}
    >
      {/* CRT scan lines + vignette */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] opacity-50"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 70% at 50% 45%, rgba(246,88,2,.10), transparent 70%)" }}
      />
      {/* Noise bars (visible only during bursts) */}
      <div
        ref={noiseRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] opacity-0 mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 18px, rgba(246,88,2,.35) 18px 20px, transparent 20px 46px, rgba(255,255,255,.18) 46px 47px, transparent 47px 90px)",
        }}
      />

      <div className="relative z-[1] flex min-h-[320px] flex-col justify-center px-6 py-10 md:min-h-[460px] md:px-12">
        <p className="type-small tabular text-accent">
          {pad(shown + 1)} / {pad(n)} <span className="text-ink-faint">· signal locked</span>
        </p>
        <div
          ref={titleRef}
          onPointerEnter={(e) => e.pointerType === "mouse" && burst(260)}
          className="mt-4 grid select-none"
        >
          <h3 className={cn(layer, "relative z-[2] text-ink")}>{group.label}</h3>
          <span aria-hidden className={cn(layer, "text-[#ff2a3d] opacity-80 mix-blend-screen")}>
            {group.label}
          </span>
          <span aria-hidden className={cn(layer, "text-[#20e3ff] opacity-80 mix-blend-screen")}>
            {group.label}
          </span>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 md:mt-10">
          {group.items.map((item, j) => (
            <li
              key={`${shown}-${item}`}
              className="whitespace-nowrap rounded-pill border border-line bg-white/[.03] px-4 py-2 font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[13px] text-ink md:text-[15px]"
            >
              <Decode text={item} delay={120 + j * 70} enabled={!reduce} />
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-[1] border-t border-line px-5 py-5 md:px-12 md:py-6">
        <div role="tablist" aria-label="Skill groups" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap">
          {skillGroups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "type-small shrink-0 rounded-pill border px-3.5 py-1.5 transition-colors duration-300",
                i === active ? "border-accent text-ink" : "border-line text-ink-faint pointer-fine:hover:text-ink-soft",
              )}
            >
              <span className={cn("tabular", i === active && "text-accent")}>{pad(i + 1)}</span> {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
