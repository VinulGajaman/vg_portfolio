"use client";

/**
 * <StackCards>: pinned stacking deck (DESIGN.md §3.7, U9).
 * Wrapper: flex column, gap 40, padding-bottom 40svh (the last card dwells).
 * Card i: position sticky; top calc(100px + i × 24px) so 24px of each earlier card shows.
 * Scale-back: as card i+1 arrives (trigger card[i+1], "top bottom" → "top {100+(i+1)·24}px",
 * scrub 0.7) card i's wrapper scales 1 → .94 (origin 50% 0), its dim overlay goes 0 → .55 and
 * its [data-stack-image] scales 1 → 1.08. will-change only while active.
 * Entry: each card plays <Reveal card> (delay .2) the first time it crosses 50%.
 * Phone: a plain list. Reduced motion: no sticky, no scale; a list with opacity reveals.
 * `portvio` profile: sticky deck kept, scale-back dropped.
 */
import { Children, useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { isPlus, SCRUB } from "@/lib/motion-tokens";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

export type StackCardsProps = {
  children: ReactNode;
  /** Sticky top of the first card, px. */
  top?: number;
  /** Visible edge of each earlier card, px. */
  step?: number;
  gap?: number;
  /** Bottom padding that lets the last card dwell. */
  dwell?: string;
  /** Card radius, px (for the dim overlay). */
  radius?: number;
  scaleTo?: number;
  dimTo?: number;
  imageScaleTo?: number;
  className?: string;
};

export function StackCards({
  children,
  top = 100,
  step = 24,
  gap = 40,
  dwell = "40svh",
  radius = 16,
  scaleTo = 0.94,
  dimTo = 0.55,
  imageScaleTo = 1.08,
  className,
}: StackCardsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);

  useMotion(
    ({ reduce, isPhone }) => {
      const root = ref.current;
      if (!root || reduce || isPhone || !isPlus) return;
      const cards = Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-stack-item]"));
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const scaleEl = card.querySelector<HTMLElement>("[data-stack-scale]");
        const dim = card.querySelector<HTMLElement>("[data-stack-dim]");
        const img = card.querySelector<HTMLElement>("[data-stack-image]");
        if (!scaleEl) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: () => `top ${top + (i + 1) * step}px`,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              const wc = self.isActive ? "transform" : "";
              scaleEl.style.willChange = wc;
              if (img) img.style.willChange = wc;
            },
          },
        });
        tl.fromTo(scaleEl, { scale: 1 }, { scale: scaleTo, ease: "none", force3D: true }, 0);
        if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: dimTo, ease: "none" }, 0);
        if (img) tl.fromTo(img, { scale: 1 }, { scale: imageScaleTo, ease: "none" }, 0);
      });
    },
    { scope: ref, dependencies: [items.length, top, step, scaleTo, dimTo, imageScaleTo] },
  );

  return (
    <div
      ref={ref}
      className={cn("flex flex-col md:motion-safe:pb-[var(--stack-dwell)]", className)}
      style={{ gap, ["--stack-dwell" as string]: dwell }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          data-stack-item=""
          className="relative md:motion-safe:sticky"
          style={{ top: `calc(${top}px + ${i * step}px)` }}
        >
          <div data-stack-scale="" className="relative origin-[50%_0]" style={{ borderRadius: radius }}>
            <Reveal variant="card" delay={0.2}>
              {child}
            </Reveal>
            <div
              aria-hidden
              data-stack-dim=""
              className="pointer-events-none absolute inset-0 bg-canvas opacity-0"
              style={{ borderRadius: radius }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
