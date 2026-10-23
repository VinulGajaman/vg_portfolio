"use client";

/**
 * <Eyebrow>: 24px orange sparkle + label (`lead`, white), gap 10 (DESIGN.md §3.3).
 * Label: <RevealText words>; the sparkle rotates −90° → 0 over 1.0s springHero on the same
 * trigger. Reduced motion: opacity only.
 */
import { useRef } from "react";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { DUR, SPRING_SAMPLES } from "@/lib/motion-tokens";
import { RevealText } from "@/components/motion/RevealText";
import { Sparkle } from "./Sparkle";
import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  delay = 0.2,
  className,
  animate = true,
}: {
  children: string;
  delay?: number;
  className?: string;
  animate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    ({ reduce }) => {
      const root = ref.current;
      const icon = root?.querySelector("svg");
      if (!root || !icon || !animate) return;
      const t = reduce
        ? gsap.fromTo(icon, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.reduced, ease: "out", paused: true })
        : gsap.fromTo(
            icon,
            { rotate: -90, autoAlpha: 0 },
            {
              rotate: 0,
              autoAlpha: 1,
              duration: SPRING_SAMPLES.springHero.duration,
              ease: "springHero",
              delay,
              paused: true,
            },
          );
      onceInView(root, () => t.play(), { settle: () => t.progress(1), reset: () => t.pause(0) });
    },
    { scope: ref, dependencies: [delay, animate] },
  );
  return (
    <div ref={ref} className={cn("flex items-center gap-[10px]", className)}>
      <Sparkle size={24} />
      {animate ? (
        <RevealText as="span" mode="words" delay={delay} className="type-lead text-ink">
          {children}
        </RevealText>
      ) : (
        <span className="type-lead text-ink">{children}</span>
      )}
    </div>
  );
}
