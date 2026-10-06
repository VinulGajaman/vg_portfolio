"use client";

/**
 * <SkillsIndex>: the CV's full skills list as an interactive panel (DESIGN.md §3.4, revised per
 * Vinul). One card (#232222, radius 16, 1px line, edge light) split in two:
 *   - Tabs (left on tablet/desktop, a swipeable pill row on phone): "01" + group name in Clash
 *     uppercase. Inactive ink-faint; active white with an orange number and a 1px orange timer
 *     line that fills over CYCLE_S (CSS keyframes; its animationend advances to the next group).
 *   - Panel: "<group> · NN tools", the skills as a large numbered list, and a giant outlined
 *     ghost number. On every change the items rise yPercent 110 → 0 inside masks (0.8s expo.out,
 *     stagger .04), the ghost number rises and fades in, and the meta line fades up.
 * Autoplay runs only while the card is in view, not hovered and motion is allowed. Mouse hover
 * or click on a tab selects it; arrow keys move between tabs (WAI-ARIA tabs pattern).
 * Reduced motion: no autoplay, no rise; selection still works.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_S = 4.5;
const pad = (n: number) => String(n).padStart(2, "0");

export function SkillsIndex({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [started, setStarted] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = skillGroups.length;
  const group = skillGroups[active];
  const running = inView && !hovered && !reduce;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setStarted(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Panel entrance: held hidden until the card first scrolls into view, then replayed per change.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || reduce) return;
      const items = panel.querySelectorAll("[data-skill-item]");
      const ghost = panel.querySelector("[data-skill-ghost]");
      const meta = panel.querySelector("[data-skill-meta]");
      if (!started) {
        gsap.set(items, { yPercent: 110 });
        gsap.set([ghost, meta], { autoAlpha: 0 });
        return;
      }
      gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.04 });
      gsap.fromTo(ghost, { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" });
      gsap.fromTo(meta, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "out" });
    },
    { scope: panelRef, dependencies: [active, started, reduce] },
  );

  const select = (i: number, focus = false) => {
    const next = (i + n) % n;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      select(active + keys[e.key], true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      select(e.key === "Home" ? 0 : n - 1, true);
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "border-overlay edge-light relative grid overflow-hidden rounded-2xl bg-surface md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
        className,
      )}
    >
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Skill groups"
        aria-orientation="vertical"
        className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] md:flex-col md:gap-0 md:overflow-visible md:border-r md:border-line md:p-0"
      >
        {skillGroups.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.label}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`skill-tab-${i}`}
              aria-selected={selected}
              aria-controls="skill-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && select(i)}
              onKeyDown={onKeyDown}
              className={cn(
                "group relative flex shrink-0 items-center gap-3 rounded-pill border px-4 py-2 text-left transition-colors duration-300 ease-out",
                "md:gap-5 md:rounded-none md:border-0 md:border-b md:border-line md:px-8 md:py-[18px] md:last:border-b-0 lg:px-10 lg:py-[22px]",
                selected ? "border-accent md:bg-white/[.03]" : "border-line",
              )}
            >
              <span className={cn("type-small tabular transition-colors duration-300", selected ? "text-accent" : "text-ink-faint")}>
                {pad(i + 1)}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap font-display text-[15px] font-semibold uppercase leading-none transition-colors duration-300 md:text-[22px] lg:text-[28px]",
                  selected ? "text-ink" : "text-ink-faint pointer-fine:group-hover:text-ink-soft",
                )}
              >
                {g.label}
              </span>
              {selected && (
                <span
                  key={active}
                  aria-hidden
                  onAnimationEnd={() => select(active + 1)}
                  className="absolute inset-x-0 bottom-0 hidden h-px origin-left bg-accent md:block"
                  style={{
                    animation: reduce ? "none" : `skill-progress ${CYCLE_S}s linear forwards`,
                    animationPlayState: running ? "running" : "paused",
                    transform: reduce ? "scaleX(1)" : undefined,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        ref={panelRef}
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${active}`}
        className="relative min-h-[340px] overflow-hidden px-6 pb-8 pt-6 md:min-h-[520px] md:px-10 md:py-10 lg:px-14 lg:py-12"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 size-[360px] rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.14), transparent)" }}
        />
        <span
          data-skill-ghost=""
          aria-hidden
          className="pointer-events-none absolute -top-3 right-4 select-none font-display text-[120px] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.12)] md:right-8 md:text-[200px] lg:text-[240px]"
        >
          {pad(active + 1)}
        </span>

        <p data-skill-meta="" className="type-small relative text-ink-soft">
          {group.label} · {pad(group.items.length)} tools
        </p>

        <ul key={active} className="relative mt-6 grid grid-cols-1 gap-x-10 md:mt-10 lg:grid-cols-2">
          {group.items.map((item, j) => (
            <li key={item} className="overflow-hidden border-b border-line/60">
              <span
                data-skill-item=""
                className="flex items-baseline gap-3 py-3 font-display text-[22px] font-semibold leading-tight text-ink md:py-4 md:text-[24px] lg:text-[30px]"
              >
                <span className="type-small tabular shrink-0 text-accent">{pad(j + 1)}</span>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
