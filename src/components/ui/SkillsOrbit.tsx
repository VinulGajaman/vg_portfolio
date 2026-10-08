"use client";

/**
 * <SkillsOrbit>: the CV's full skills list as an orbit constellation (skills idea 3 of 4).
 * Left (top on phone): the seven groups as a list; the active one is white with an orange number
 * and a 1px timer line. Right: a square stage with the VG mark at the centre (orange halo
 * breathing) and three dashed rings rotating at 90 / 130 / 170s in alternating directions. All
 * skills sit on the rings as dots; each node counter-rotates with its ring so labels stay upright.
 *   - Active group: its dots grow and glow orange, labels appear, and orange beams draw from the
 *     centre to each node (they live inside the ring, so they rotate with it). The group name and
 *     count cross-fade under the mark.
 *   - Autoplay: advances every CYCLE_S while in view and not hovered (the list timer's
 *     animationend drives it). Hover / click a group, or hover a dot, to take over.
 *   - Entrance: rings scale .6 → 1 and fade in (stagger .12), dots pop 0 → 1 (stagger .015).
 * Off-screen: rotations pause. Reduced motion: no rotation, no autoplay, no entrance.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const CYCLE_S = 3.6;
const pad = (n: number) => String(n).padStart(2, "0");

/** Ring geometry: inset of the ring box within the stage (%), spin period (s) and direction. */
const RINGS = [
  { inset: 26, period: 90, reverse: false },
  { inset: 14, period: 130, reverse: true },
  { inset: 3, period: 170, reverse: false },
];

type Node = { label: string; group: number; ring: number; x: number; y: number };

/** Position on the ring box in %, rounded so server and client render identical strings. */
const at = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: +(50 + 50 * Math.cos(rad)).toFixed(3), y: +(50 + 50 * Math.sin(rad)).toFixed(3) };
};

/** Spread every skill over the three rings; a coprime stride keeps a group's nodes apart. */
const NODES: Node[] = (() => {
  const flat = skillGroups.flatMap((g, group) => g.items.map((label) => ({ label, group })));
  const perRing = RINGS.map((_, r) => flat.filter((_, k) => k % RINGS.length === r));
  return perRing.flatMap((items, ring) =>
    items.map((it, j) => {
      const slot = (j * 5) % items.length;
      return { ...it, ring, ...at((slot / items.length) * 360 + ring * 17) };
    }),
  );
})();

export function SkillsOrbit({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const n = skillGroups.length;
  const running = inView && !hovered && !reduce;
  const spin = inView && !reduce ? "running" : "paused";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useMotion(
    ({ reduce: rm }) => {
      const stage = stageRef.current;
      if (!stage || rm) return;
      const rings = stage.querySelectorAll("[data-orbit-ring]");
      const dots = stage.querySelectorAll("[data-orbit-dot]");
      const core = stage.querySelector("[data-orbit-core]");
      gsap.set(rings, { scale: 0.6, autoAlpha: 0 });
      gsap.set(dots, { scale: 0 });
      gsap.set(core, { scale: 0.7, autoAlpha: 0 });
      const tl = gsap
        .timeline({ paused: true })
        .to(core, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" }, 0)
        .to(rings, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "expo.out", stagger: 0.12 }, 0.1)
        .to(dots, { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.015 }, 0.5);
      onceInView(stage, () => tl.play(), { settle: () => tl.progress(1) });
    },
    { scope: stageRef },
  );

  const group = skillGroups[active];

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setHoverNode(null);
      }}
      className={cn("grid items-center gap-8 lg:grid-cols-12 lg:gap-12", className)}
    >
      {/* Group list */}
      <div
        role="tablist"
        aria-label="Skill groups"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:col-span-4 lg:flex-col lg:gap-0 lg:overflow-visible"
      >
        {skillGroups.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              className={cn(
                "group relative flex shrink-0 items-center gap-3 rounded-pill border px-4 py-2 text-left transition-colors duration-300",
                "lg:gap-5 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-0 lg:py-4",
                selected ? "border-accent" : "border-line",
              )}
            >
              <span className={cn("type-small tabular transition-colors", selected ? "text-accent" : "text-ink-faint")}>
                {pad(i + 1)}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap font-display text-[15px] font-semibold uppercase leading-none transition-colors duration-300 lg:text-[24px]",
                  selected ? "text-ink" : "text-ink-faint pointer-fine:group-hover:text-ink-soft",
                )}
              >
                {g.label}
              </span>
              {selected && (
                <span
                  key={active}
                  aria-hidden
                  onAnimationEnd={() => setActive((a) => (a + 1) % n)}
                  className="absolute inset-x-0 -bottom-px hidden h-px origin-left bg-accent lg:block"
                  style={{
                    animation: reduce ? "none" : `skill-progress ${CYCLE_S}s linear forwards`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Orbit stage */}
      <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[640px] lg:col-span-8">
        {/* Core */}
        <div data-orbit-core="" className="absolute inset-0 z-[2] grid place-items-center">
          <div className="flex flex-col items-center">
            <span className="relative grid place-items-center">
              <span
                aria-hidden
                className="absolute size-[150%] rounded-full motion-safe:animate-pulse"
                style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.35), transparent)" }}
              />
              <LogoMark size={64} className="relative" />
            </span>
            <span key={active} className="mt-3 flex flex-col items-center text-center motion-safe:animate-[fade-up_.5s_ease-out]">
              <span className="font-display text-[14px] font-semibold uppercase text-ink md:text-[16px]">{group.label}</span>
              <span className="type-small tabular text-ink-faint">{pad(group.items.length)} tools</span>
            </span>
          </div>
        </div>

        {/* Rings */}
        {RINGS.map((ring, r) => (
          <div
            key={r}
            data-orbit-ring=""
            className="absolute rounded-full border border-dashed border-line/80"
            style={{
              inset: `${ring.inset}%`,
              animation: reduce ? "none" : `orbit-spin ${ring.period}s linear infinite ${ring.reverse ? "reverse" : "normal"}`,
              animationPlayState: spin,
            }}
          >
            {/* Beams to the active group's nodes on this ring */}
            <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible">
              {NODES.filter((nd) => nd.ring === r && nd.group === active).map((nd) => {
                return (
                  <line
                    key={`${active}-${nd.label}`}
                    x1="50"
                    y1="50"
                    x2={nd.x}
                    y2={nd.y}
                    stroke="rgba(246,88,2,.35)"
                    strokeWidth=".25"
                    pathLength={1}
                    strokeDasharray="1"
                    className="motion-safe:animate-[orbit-beam_.8s_ease-out_forwards]"
                    style={{ strokeDashoffset: reduce ? 0 : 1 }}
                  />
                );
              })}
            </svg>

            {NODES.filter((nd) => nd.ring === r).map((nd) => {
              const on = nd.group === active;
              const showLabel = on || hoverNode === nd.label;
              return (
                <div
                  key={nd.label}
                  className="absolute"
                  style={{ left: `${nd.x}%`, top: `${nd.y}%` }}
                >
                  {/* Counter-rotation keeps the label upright */}
                  <div
                    className="-translate-x-1/2 -translate-y-1/2"
                    style={{
                      animation: reduce
                        ? "none"
                        : `orbit-spin ${ring.period}s linear infinite ${ring.reverse ? "normal" : "reverse"}`,
                      animationPlayState: spin,
                    }}
                  >
                    <div
                      data-orbit-dot=""
                      onPointerEnter={(e) => {
                        if (e.pointerType !== "mouse") return;
                        setHoverNode(nd.label);
                        setActive(nd.group);
                      }}
                      className="relative flex cursor-default items-center justify-center p-2"
                    >
                      <span
                        className={cn(
                          "block rounded-full transition-all duration-500 ease-out",
                          on ? "size-3 bg-accent shadow-[0_0_14px_rgba(246,88,2,.8)]" : "size-1.5 bg-ink-faint/70",
                        )}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-[12px] font-medium transition-[opacity,transform] duration-500 ease-out md:text-[13px]",
                          showLabel ? "translate-y-0 text-ink opacity-100" : "-translate-y-1 opacity-0",
                        )}
                      >
                        {nd.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Full list for screen readers (the orbit is visual) */}
      <ul className="sr-only">
        {skillGroups.map((g) => (
          <li key={g.label}>
            {g.label}: {g.items.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
