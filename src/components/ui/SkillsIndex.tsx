"use client";

/**
 * <SkillsIndex>: the CV's full skills list as a bento grid (DESIGN.md §3.4, revised per Vinul).
 * Seven cards (#232222, radius 16, 1px line, edge light) on a 12-column grid at desktop:
 * 5 + 7 / 7 + 5 / 4 + 4 + 4; two columns on tablet (the last card spans both); one on phone.
 * Each card: orange "01" + "NN tools", the group in Clash uppercase, the skills as outline chips,
 * and a giant outlined ghost number in the corner.
 * Motion:
 *   - Scroll: cards rise with <Reveal card> (y 30, scale .8 → 1), delays .2 / .3 / .4 by column.
 *   - Hover (fine pointers): a 4° <Tilt>, an orange radial spotlight that follows the cursor
 *     (CSS vars, opacity 0 → 1), the border warms to accent/40, the ghost number drifts up and
 *     brightens, and the chips light up left to right (transition-delay i × 35ms).
 * Reduced motion: no tilt, no rise; hover colour changes only.
 */
import type { PointerEvent } from "react";
import { skillGroups } from "@/content/stack";
import { Reveal } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import { STAGGER } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");

/** Column spans per card at desktop (12 cols) and tablet (2 cols). */
const SPANS = [
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "md:col-span-2 lg:col-span-4",
];

/** Column index at desktop, for the reveal delay. */
const COLUMN = [0, 1, 0, 1, 0, 1, 2];

function track(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function SkillsIndex({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-12", className)}>
      {skillGroups.map((g, i) => (
        <Reveal key={g.label} variant="card" delay={STAGGER.siblings[COLUMN[i]]} className={cn("min-w-0", SPANS[i])}>
          <Tilt max={4} className="h-full">
            <article
              onPointerMove={track}
              className="group border-overlay edge-light relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl bg-surface p-6 after:transition-colors after:duration-300 after:ease-out pointer-fine:hover:after:border-accent/40 md:min-h-[280px] md:p-8 lg:min-h-[300px] lg:p-9"
            >
              {/* Cursor spotlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out pointer-fine:group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(246,88,2,.14), transparent 60%)",
                }}
              />
              {/* Ghost number */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[120px] font-bold leading-none text-transparent opacity-60 transition-[transform,opacity] duration-700 ease-out [-webkit-text-stroke:1px_rgba(255,255,255,.12)] pointer-fine:group-hover:-translate-y-2 pointer-fine:group-hover:opacity-100 md:text-[150px] lg:text-[170px]"
              >
                {pad(i + 1)}
              </span>

              <div className="relative flex items-center justify-between">
                <span className="type-small tabular text-accent">{pad(i + 1)}</span>
                <span className="type-small tabular text-ink-faint">{pad(g.items.length)} tools</span>
              </div>

              <h3 className="relative mt-8 font-display text-[26px] font-semibold uppercase leading-[1.05] text-ink md:mt-10 md:text-[30px] lg:text-[34px]">
                {g.label}
              </h3>

              <ul className="relative mt-auto flex flex-wrap gap-2 pt-8">
                {g.items.map((item, j) => (
                  <li
                    key={item}
                    className="type-body whitespace-nowrap rounded-pill border border-line bg-canvas/40 px-[14px] py-[6px] text-ink-soft transition-colors duration-300 ease-out pointer-fine:group-hover:border-white/25 pointer-fine:group-hover:text-ink"
                    style={{ transitionDelay: `${j * 35}ms` }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Tilt>
        </Reveal>
      ))}
    </div>
  );
}
