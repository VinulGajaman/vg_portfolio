"use client";

/**
 * <SkillsPanels>: the CV's full skills list as expanding panels (skills idea, round 2 #2).
 * Tablet / desktop: seven tall cards in a row (520 / 560px). Collapsed panels show the orange
 * number and the group name set vertically; the active panel widens (flex-grow 1 → 6 over 0.9s on
 * the site's mask ease), the vertical label fades, and the content fades in: "NN tools", the
 * group in Clash, and the skills as a two-column numbered list rising out of masks (stagger 45ms,
 * after a 250ms delay). An orange glow sits at the top and a giant outlined number at the corner.
 * Content keeps a fixed min width so text never reflows while the panel grows.
 * Phone: stacked rows; the active row opens with a 0fr → 1fr grid-row transition showing chips.
 * Control: hover (mouse) or focus / click selects; autoplay every CYCLE_S while in view and not
 * hovered. Entrance: panels rise y 60 → 0 and fade in, stagger .06. Reduced motion: no autoplay,
 * no rise; selection swaps instantly.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_S = 4;
const pad = (n: number) => String(n).padStart(2, "0");
const EASE = "cubic-bezier(.645,.045,.355,1)";

export function SkillsPanels({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const n = skillGroups.length;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovered || reduce) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), CYCLE_S * 1000);
    return () => window.clearTimeout(t);
  }, [active, inView, hovered, reduce, n]);

  useMotion(
    ({ reduce: rm }) => {
      const root = rootRef.current;
      if (!root || rm) return;
      const panels = root.querySelectorAll("[data-panel]");
      gsap.set(panels, { y: 60, autoAlpha: 0 });
      const tl = gsap.to(panels, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", stagger: 0.06, paused: true });
      onceInView(root, () => tl.play(), { settle: () => tl.progress(1) });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn("flex flex-col gap-2 md:h-[520px] md:flex-row lg:h-[560px]", className)}
    >
      {skillGroups.map((g, i) => {
        const on = i === active;
        return (
          <article
            key={g.label}
            data-panel=""
            data-active={on}
            tabIndex={0}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className="group border-overlay edge-light relative min-w-0 cursor-pointer overflow-hidden rounded-2xl bg-surface outline-none after:transition-colors after:duration-500 focus-visible:ring-2 focus-visible:ring-accent data-[active=true]:after:border-accent/40 md:basis-0"
            style={{
              flexGrow: on ? 6 : 1,
              transition: reduce ? undefined : `flex-grow .9s ${EASE}`,
            }}
          >
            {/* Glow + ghost number (active only) */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-0 transition-opacity duration-700 group-data-[active=true]:opacity-100"
              style={{ background: "radial-gradient(60% 100% at 30% 0%, rgba(246,88,2,.18), transparent)" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-8 -right-3 hidden select-none font-display text-[200px] font-bold leading-none text-transparent opacity-0 transition-opacity duration-700 [-webkit-text-stroke:1px_rgba(255,255,255,.1)] group-data-[active=true]:opacity-100 md:block lg:text-[240px]"
            >
              {pad(i + 1)}
            </span>

            {/* ---------- Tablet / desktop ---------- */}
            {/* Collapsed: number + vertical name */}
            <div className="absolute inset-0 hidden flex-col items-center justify-between py-7 transition-opacity duration-500 group-data-[active=true]:pointer-events-none group-data-[active=true]:opacity-0 md:flex">
              <span className="type-small tabular text-accent">{pad(i + 1)}</span>
              <span className="rotate-180 whitespace-nowrap font-display text-[20px] font-semibold uppercase text-ink-faint transition-colors duration-300 [writing-mode:vertical-rl] group-hover:text-ink-soft lg:text-[24px]">
                {g.label}
              </span>
            </div>

            {/* Expanded content */}
            <div className="absolute inset-0 hidden min-w-[520px] flex-col p-8 opacity-0 transition-opacity duration-500 group-data-[active=true]:opacity-100 group-data-[active=true]:delay-200 md:flex lg:min-w-[600px] lg:p-10">
              <div className="flex items-center gap-4">
                <span className="type-small tabular text-accent">{pad(i + 1)}</span>
                <span className="type-small tabular text-ink-faint">{pad(g.items.length)} tools</span>
              </div>
              <h3 className="mt-6 font-display text-[34px] font-semibold uppercase leading-[1.02] text-ink lg:text-[44px]">
                {g.label}
              </h3>
              <ul className="mt-auto grid grid-cols-2 gap-x-8">
                {g.items.map((item, j) => (
                  <li key={item} className="overflow-hidden border-b border-line/60">
                    <span
                      className="flex items-baseline gap-3 py-3 font-display text-[20px] font-semibold leading-tight text-ink transition-transform duration-700 group-data-[active=false]:translate-y-[110%] lg:text-[24px]"
                      style={{ transitionDelay: on ? `${250 + j * 45}ms` : "0ms", transitionTimingFunction: EASE }}
                    >
                      <span className="type-small tabular shrink-0 text-accent">{pad(j + 1)}</span>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- Phone ---------- */}
            <div className="relative md:hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="type-small tabular text-accent">{pad(i + 1)}</span>
                <span
                  className={cn(
                    "font-display text-[18px] font-semibold uppercase transition-colors duration-300",
                    on ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {g.label}
                </span>
                <span className="type-small tabular ml-auto text-ink-faint">{pad(g.items.length)}</span>
              </div>
              <div
                className="grid"
                style={{
                  gridTemplateRows: on ? "1fr" : "0fr",
                  transition: reduce ? undefined : `grid-template-rows .7s ${EASE}`,
                }}
              >
                <div className="overflow-hidden">
                  <ul className="flex flex-wrap gap-2 px-5 pb-5">
                    {g.items.map((item) => (
                      <li
                        key={item}
                        className="type-body rounded-pill border border-line bg-canvas/40 px-3 py-1.5 text-[14px] text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
