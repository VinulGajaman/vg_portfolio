"use client";

/** The text over a project card (number badge, tags, year, decoding title, description, CTA). */
import { Tag } from "@/components/ui/Tag";
import { Decode } from "@/components/ui/Decode";
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
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas-deep/95 via-canvas-deep/35 to-transparent" />
      <span className="type-small tabular absolute left-5 top-5 rounded-full border border-white/15 bg-canvas/55 px-3 py-1 text-ink backdrop-blur-md md:left-6 md:top-6">
        {number}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-[6px]">
          {p.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          <span className="type-number ml-auto text-ink">{p.year}</span>
        </div>
        <h3 className={cn(size === "lg" ? "type-h2" : "type-statement", "text-ink transition-opacity duration-500", !shown && "opacity-0")}>
          <Decode text={p.title} enabled={revealed && !reduce} delay={500} />
        </h3>
        {size === "lg" && <p className="type-body max-w-[540px] text-ink-soft max-md:hidden">{p.description}</p>}
        <span className="type-ui flex items-center gap-2 text-ink">
          {ctaLabels.project}
          <svg viewBox="0 0 24 24" aria-hidden className="size-4 text-accent transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </>
  );
}
