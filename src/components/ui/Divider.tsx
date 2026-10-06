"use client";

/**
 * <Divider>: 1px line (DESIGN.md §1.2). variant gradient (90deg rgba(255,255,255,.3) → #0D0D0D,
 * `reverse` mirrors) or solid #3C3C3C. `draw` scales it 0 → 1 from the left over 1.0s `mask`
 * when 50% visible. Reduced motion: shown complete.
 */
import { useRef } from "react";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export function Divider({ variant = "gradient", reverse = false, draw = false, delay = 0, className }: { variant?: "gradient" | "solid"; reverse?: boolean; draw?: boolean; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el || !draw || reduce) return;
      const t = gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "mask", delay, paused: true });
      onceInView(el, () => t.play(), { start: "top bottom-=10%", settle: () => t.progress(1) });
    },
    { scope: ref, dependencies: [draw, delay] },
  );
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "h-px w-full origin-left",
        variant === "solid" ? "bg-line" : reverse ? "divider-gradient-rtl" : "divider-gradient",
        className,
      )}
    />
  );
}
