"use client";

/**
 * <ParallaxImage speed={0.1}>: portvio's speed-90 parallax, element-relative (DESIGN.md §2.5).
 * The inner layer is 120% tall at top −10% and scrubs yPercent −8 → 8 over the element's time
 * in the viewport ("top bottom" → "bottom top"), ≈ 0.1 × (vh + h). Off on phone and under
 * reduced motion. The outer box needs a size (className) and clips.
 */
import { useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type ParallaxImageProps = {
  children: ReactNode;
  /** 0.1 = portvio speed 90. The travel scales linearly (max 0.12 keeps the headroom). */
  speed?: number;
  className?: string;
  innerClassName?: string;
  /** Keep it running on phone (portvio disables it). */
  phone?: boolean;
};

export function ParallaxImage({
  children,
  speed = 0.1,
  className,
  innerClassName,
  phone = false,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isPhone }) => {
      const el = ref.current;
      const inner = innerRef.current;
      if (!el || !inner || reduce || (isPhone && !phone)) return;
      const range = Math.min(8 * (speed / 0.1), 9.5);
      gsap.fromTo(
        inner,
        { yPercent: -range },
        {
          yPercent: range,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
            onToggle: (self) => {
              inner.style.willChange = self.isActive ? "transform" : "";
            },
          },
        },
      );
    },
    { scope: ref, dependencies: [speed, phone] },
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div ref={innerRef} className={cn("absolute left-0 top-[-10%] h-[120%] w-full", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
