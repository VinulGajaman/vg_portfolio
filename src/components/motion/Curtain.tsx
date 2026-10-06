"use client";

/**
 * <Curtain>: the dark sheet that climbs over the shrinking hero (DESIGN.md §3.3, [pv: motion
 * §2b]). Absolute child at the top of #about: 100% × 834px (tablet and phone 92svh), #0D0D0D,
 * z 3, pointer-events none, origin 50% 50%. ScrollTrigger on the parent section,
 * "top bottom" → "+=" + its own height, scrub 0.7: skewY 0 → 7deg and y 0 → −220px.
 * Positive skewY raises the left edge, so the top edge slants like portvio's scroll-00300.png.
 * Section content sits above it at z 4. Reduced motion: static, flat.
 */
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export function Curtain({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      const trigger = el?.parentElement;
      if (!el || !trigger || reduce) return;
      gsap.fromTo(
        el,
        { skewY: 0, y: 0 },
        {
          skewY: 7,
          y: -220,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: () => `+=${el.offsetHeight}`,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              el.style.willChange = self.isActive ? "transform" : "";
            },
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 top-0 z-[3] h-[92svh] w-full origin-center bg-canvas lg:h-[834px]",
        className,
      )}
    />
  );
}
