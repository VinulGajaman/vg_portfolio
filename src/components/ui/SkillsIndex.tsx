"use client";

/**
 * <SkillsIndex>: the CV's full skills list as an animated index (DESIGN.md §3.4, revised per Vinul).
 * One row per CV group: "01" number, Clash uppercase title (RollText on hover), the skills as
 * outline chips, and the item count on desktop. Rows are separated by 1px hairlines.
 *
 * Scroll (once per row, motion allowed): the hairline draws scaleX 0 → 1 (1.0s mask), the number
 * fades in, the title rises yPercent 110 → 0 inside a mask (0.9s expo.out), then each chip rises
 * yPercent 110 → 0 inside its own mask (0.8s expo.out, stagger .03).
 * Hover (fine pointers, CSS only): an orange 2px bar grows scaleY 0 → 1 at the row's left, the
 * title block shifts x 16px, and the chips brighten left to right (transition-delay i × 30ms).
 * Reduced motion / no JS: everything static and visible.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { RollText } from "@/components/motion/RollText";
import { cn } from "@/lib/cn";

export function SkillsIndex({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce }) => {
      const root = ref.current;
      if (!root || reduce) return;
      root.querySelectorAll<HTMLElement>("[data-skill-row]").forEach((row) => {
        const line = row.querySelector<HTMLElement>("[data-skill-line]");
        const num = row.querySelector<HTMLElement>("[data-skill-num]");
        const title = row.querySelector<HTMLElement>("[data-skill-title]");
        const chips = row.querySelectorAll<HTMLElement>("[data-skill-chip]");
        gsap.set(line, { scaleX: 0 });
        gsap.set(num, { autoAlpha: 0 });
        gsap.set([title, ...chips], { yPercent: 110 });
        const tl = gsap
          .timeline({ paused: true })
          .to(line, { scaleX: 1, duration: 1, ease: "mask" }, 0)
          .to(num, { autoAlpha: 1, duration: 0.6, ease: "out" }, 0.1)
          .to(title, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 0.1)
          .to(chips, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.03 }, 0.25);
        onceInView(row, () => tl.play(), { settle: () => tl.progress(1) });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      {skillGroups.map((g, i) => (
        <div
          key={g.label}
          data-skill-row=""
          data-roll-parent=""
          className="group relative grid grid-cols-[40px_1fr] gap-x-4 gap-y-5 py-7 md:grid-cols-[64px_minmax(0,300px)_1fr] md:items-center md:gap-x-6 md:py-9 lg:grid-cols-[80px_minmax(0,360px)_1fr_48px]"
        >
          {/* Hairline (draws in on scroll) */}
          <span data-skill-line="" aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
          {/* Hover accent bar */}
          <span
            aria-hidden
            className="absolute bottom-5 left-0 top-5 w-[2px] origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out pointer-fine:group-hover:scale-y-100"
          />

          <span data-skill-num="" className="type-body tabular self-start pt-1 text-ink-soft md:self-center md:pt-0">
            {String(i + 1).padStart(2, "0")}
          </span>

          <div className="overflow-hidden pb-[.08em] transition-transform duration-500 ease-out pointer-fine:group-hover:translate-x-4">
            <h3 data-skill-title="" className="font-display text-[22px] font-bold uppercase leading-[1.1] text-ink md:text-[28px] lg:text-[32px]">
              <RollText size="lg">{g.label}</RollText>
            </h3>
          </div>

          <ul className="col-span-2 flex flex-wrap gap-2 md:col-span-1">
            {g.items.map((item, j) => (
              <li key={item} className="overflow-hidden rounded-pill">
                <span
                  data-skill-chip=""
                  className="type-body block whitespace-nowrap rounded-pill border border-line px-[14px] py-[6px] text-ink-soft transition-colors duration-300 ease-out pointer-fine:group-hover:border-white/30 pointer-fine:group-hover:text-ink"
                  style={{ transitionDelay: `${j * 30}ms` }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <span className="type-small tabular hidden text-right text-ink-soft lg:block">
            {String(g.items.length).padStart(2, "0")}
          </span>
        </div>
      ))}
      <span aria-hidden className="h-px bg-line" />
    </div>
  );
}
