"use client";

/**
 * The text over a project card, laid out the same on every card so cards line up side by side:
 *   - top bar: number badge on the left, year on the right
 *   - bottom block: tags on one line, the title in a box always three lines tall (so tags and
 *     titles start at the same height on every card), the description (large cards only), and
 *     "View Case Study" pinned to the bottom
 * The title words rise into place once the card is revealed.
 */
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/content/projects";
import { ctaLabels } from "@/content/site";
import { cn } from "@/lib/cn";

export type CardSize = "lg" | "sm";

/** Props shared by every project card variant. */
export type ProjectCardProps = {
  project: Project;
  number: string;
  size?: CardSize;
  sizes?: string;
  className?: string;
};

export function CardText({
  p,
  number,
  size,
  revealed,
  reduce,
}: {
  p: Project;
  number: string;
  size: CardSize;
  revealed: boolean;
  reduce: boolean;
}) {
  const shown = revealed || reduce;
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas-deep via-canvas-deep/55 via-40% to-transparent to-75%" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-6">
        <span className="type-small tabular rounded-full border border-white/15 bg-canvas/55 px-3 py-1 text-ink backdrop-blur-md">{number}</span>
        <span className="type-small tabular text-ink-soft">{p.year}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col p-5 md:p-7">
        <ul className="flex gap-[6px] overflow-hidden whitespace-nowrap [mask-image:linear-gradient(90deg,#000_85%,transparent)]">
          {p.tags.map((t) => (
            <li key={t} className="shrink-0">
              <Tag>{t}</Tag>
            </li>
          ))}
        </ul>
        <h3
          className={cn(
            "mt-4 min-h-[3lh] font-display font-semibold uppercase leading-[1.06] tracking-[-0.01em] text-ink [text-wrap:balance]",
            size === "lg" ? "text-[28px] md:text-[40px]" : "text-[22px] md:text-[26px]",
          )}
        >
          {p.title.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
              <span
                className={cn(
                  "inline-block transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]",
                  shown ? "translate-y-0" : "translate-y-[110%]",
                )}
                style={{ transitionDelay: reduce ? undefined : `${200 + i * 60}ms` }}
              >
                {w}
                {" "}
              </span>
            </span>
          ))}
        </h3>
        {size === "lg" && <p className="type-body mt-2 max-w-[540px] text-ink-soft max-md:hidden">{p.description}</p>}
        <span className="type-ui mt-5 flex items-center gap-2 text-ink">
          {ctaLabels.project}
          <svg viewBox="0 0 24 24" aria-hidden className="size-4 text-accent transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </>
  );
}
