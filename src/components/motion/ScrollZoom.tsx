"use client";

/**
 * <ScrollZoom>: scroll-scrubbed zoom (DESIGN.md §2.5, U11).
 * Inner media scale `from` (default 1.2) → 1, scrubbed "top bottom" → "bottom top", scrub 0.7,
 * ease dwell(x, .4) so the zoom settles while the element is centred. Optional parallax
 * yPercent −6 → 6 (the inner layer gets 7% headroom each side so no edge ever shows).
 * Phone: the zoom is halved. Reduced motion: static at scale 1.
 */
import { useRef, type ReactNode } from "react";
import { dwellEase, gsap, useMotion } from "@/lib/gsap";
import { SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type ScrollZoomProps = {
  children: ReactNode;
  from?: number;
  parallax?: boolean;
  start?: string;
  end?: string;
  /** Dwell strength L (≤ 0.6). */
  dwell?: number;
  className?: string;
  innerClassName?: string;
};

export function ScrollZoom({
  children,
  from = 1.2,
  parallax = false,
  start = "top bottom",
  end = "bottom top",
  dwell = 0.4,
  className,
  innerClassName,
}: ScrollZoomProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isPhone }) => {
      const el = ref.current;
      const inner = innerRef.current;
      if (!el || !inner || reduce) return;
      const startScale = isPhone ? 1 + (from - 1) / 2 : from;
      gsap.fromTo(
        inner,
        { scale: startScale, yPercent: parallax ? -6 : 0 },
        {
          scale: 1,
          yPercent: parallax ? 6 : 0,
          ease: dwellEase(dwell),
          force3D: true,
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              inner.style.willChange = self.isActive ? "transform" : "";
            },
          },
        },
      );
    },
    { scope: ref, dependencies: [from, parallax, start, end, dwell] },
  );

  return (
    // cn() does not resolve Tailwind conflicts, so only default to `relative` when the caller sets no position.
    <div
      ref={ref}
      className={cn(!/\b(absolute|fixed|sticky)\b/.test(className ?? "") && "relative", "overflow-hidden", className)}
    >
      <div
        ref={innerRef}
        className={cn(
          "absolute left-0 w-full",
          parallax ? "top-[-7%] h-[114%]" : "top-0 h-full",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
