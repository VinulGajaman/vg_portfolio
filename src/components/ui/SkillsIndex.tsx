"use client";

/**
 * <SkillsIndex>: the CV's full skills list as a kinetic type wall (DESIGN.md §3.4, revised per
 * Vinul). One full-bleed row per CV group, separated by 1px hairlines:
 *   - Label line (in the content column): orange "01", the group name in small uppercase, and
 *     "NN tools" at the far side.
 *   - A <Marquee> of the skills in Clash 600 uppercase (40 / 64 / 88px) with orange sparkle
 *     separators. Rows alternate: odd rows solid white running left, even rows outlined
 *     (1px white stroke) running right, at 45 / 55 px/s, with the site's scroll-velocity boost
 *     and skew.
 * Hover (fine pointers): the row eases to .25× speed, outlined words fill white, the label turns
 * white and an orange hairline draws across the top (scaleX 0 → 1, 0.7s).
 * Scroll (once per row): the row rises yPercent 100 → 0 inside a mask (1.0s expo.out), the
 * label fades up, rows staggered by their own trigger points.
 * Reduced motion: Marquee renders a static wrapped row; no rise.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { Marquee } from "@/components/motion/Marquee";
import { Sparkle } from "@/components/ui/Sparkle";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const SIZE = "text-[40px] md:text-[64px] lg:text-[88px]";

export function SkillsIndex({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce }) => {
      const root = ref.current;
      if (!root || reduce) return;
      root.querySelectorAll<HTMLElement>("[data-wall-row]").forEach((row) => {
        const inner = row.querySelector<HTMLElement>("[data-wall-inner]");
        const label = row.querySelector<HTMLElement>("[data-wall-label]");
        gsap.set(inner, { yPercent: 100 });
        gsap.set(label, { autoAlpha: 0, y: 10 });
        const tl = gsap
          .timeline({ paused: true })
          .to(inner, { yPercent: 0, duration: 1, ease: "expo.out" }, 0)
          .to(label, { autoAlpha: 1, y: 0, duration: 0.6, ease: "out" }, 0.1);
        onceInView(row, () => tl.play(), { settle: () => tl.progress(1) });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("flex flex-col border-b border-line", className)}>
      {skillGroups.map((g, i) => {
        const outlined = i % 2 === 1;
        return (
          <div key={g.label} data-wall-row="" className="group relative border-t border-line py-5 md:py-7">
            <span
              aria-hidden
              className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out pointer-fine:group-hover:scale-x-100"
            />
            <div data-wall-label="" className="container-site mb-2 flex items-center gap-3 md:mb-3">
              <span className="type-small tabular text-accent">{pad(i + 1)}</span>
              <h3 className="type-small uppercase tracking-[.08em] text-ink-soft transition-colors duration-300 pointer-fine:group-hover:text-ink">
                {g.label}
              </h3>
              <span className="type-small tabular ml-auto text-ink-faint">{pad(g.items.length)} tools</span>
            </div>
            <div className="overflow-hidden">
              <div data-wall-inner="">
                <Marquee
                  speed={outlined ? 55 : 45}
                  gap={0}
                  direction={outlined ? -1 : 1}
                  hoverSlow={0.25}
                  mask="tiles"
                  label={g.label}
                >
                  {g.items.map((item) => (
                    <li key={item} className={cn("flex items-center font-display font-semibold uppercase", SIZE)}>
                      <span
                        className={cn(
                          "whitespace-nowrap px-[.3em] leading-[1.1] transition-colors duration-500 ease-out",
                          outlined
                            ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.55)] pointer-fine:group-hover:text-ink"
                            : "text-ink",
                        )}
                      >
                        {item}
                      </span>
                      <Sparkle className="w-[.3em]" />
                    </li>
                  ))}
                </Marquee>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
