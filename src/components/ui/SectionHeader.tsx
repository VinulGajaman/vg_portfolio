"use client";

/**
 * <SectionHeader> (DESIGN.md §1.4).
 *  split   eyebrow cols 1–4 · H2 cols 5–10 (≈ x 477 at 1440) · counter cols 11–12 right-aligned
 *          (body ink-soft); phone stacks with 20px gaps.
 *  centred eyebrow above the H2 (gap 20), centred (process, experience).
 * H2 uses <RevealText lines>; eyebrow words + sparkle; counter <Reveal text>; all delay .2.
 */
import { Fragment } from "react";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "./Eyebrow";
import { cn } from "@/lib/cn";

export type SectionHeaderProps = {
  eyebrow: string;
  /** One string or an array of lines (joined with <br/>). */
  title: string | readonly string[];
  /** id for the H2, for the section's aria-labelledby. */
  titleId?: string;
  counter?: string;
  variant?: "split" | "centred";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  counter,
  variant = "split",
  className,
}: SectionHeaderProps) {
  const lines = typeof title === "string" ? [title] : title;
  const h2 = (
    <RevealText as="h2" id={titleId} mode="lines" delay={0.2} className="type-h2">
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {l}
        </Fragment>
      ))}
    </RevealText>
  );
  if (variant === "centred") {
    return (
      <header className={cn("flex flex-col items-center gap-5 text-center", className)}>
        <Eyebrow>{eyebrow}</Eyebrow>
        {h2}
      </header>
    );
  }
  return (
    <header className={cn("flex flex-col gap-5 md:grid md:grid-cols-12 md:items-start", className)}>
      <Eyebrow className="md:col-span-4">{eyebrow}</Eyebrow>
      <div className="md:col-span-6">{h2}</div>
      {counter && (
        <Reveal className="type-body text-ink-soft md:col-span-2 md:text-right">
          <span className="tabular">{counter}</span>
        </Reveal>
      )}
    </header>
  );
}
