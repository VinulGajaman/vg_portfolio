"use client";

/**
 * <MaskReveal>: image / block clip reveal (DESIGN.md §2.5).
 *   default  clip-path inset(100% 0 0 0 round R) → inset(0 0 0 0 round R), inner scale 1.3 → 1
 *   iris     circle(0% at 50% 50%) → circle(75% at 50% 50%)
 * 1.4s `mask`, 50% visible, once. Reduced motion: opacity fade, static scale.
 */
import { useRef, type ReactNode } from "react";
import { gsap, onceInView, useMotion, type ScrollTrigger } from "@/lib/gsap";
import { DUR } from "@/lib/motion-tokens";
import { useIntro } from "@/lib/store";
import { cn } from "@/lib/cn";

export type MaskRevealProps = {
  children: ReactNode;
  /** Corner radius in px (matches the media radius token). */
  radius?: number;
  variant?: "bottom" | "iris";
  delay?: number;
  duration?: number;
  /** Inner media start scale. */
  fromScale?: number;
  trigger?: "inview" | "mount" | "intro";
  className?: string;
  innerClassName?: string;
};

export function MaskReveal({
  children,
  radius = 0,
  variant = "bottom",
  delay = 0,
  duration = 1.4,
  fromScale = 1.3,
  trigger = "inview",
  className,
  innerClassName,
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const introOpen = useRef(false);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      let st: ScrollTrigger | null = null;
      const tl = gsap.timeline({ paused: true, delay });
      if (reduce) {
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.reduced, ease: "out" });
      } else {
        const r = `${radius}px`;
        const from =
          variant === "iris" ? "circle(0% at 50% 50%)" : `inset(100% 0% 0% 0% round ${r})`;
        const to =
          variant === "iris" ? "circle(75% at 50% 50%)" : `inset(0% 0% 0% 0% round ${r})`;
        gsap.set(el, { autoAlpha: 1 });
        tl.fromTo(el, { clipPath: from }, { clipPath: to, duration, ease: "mask" }, 0).fromTo(
          inner,
          { scale: fromScale },
          { scale: 1, duration, ease: "mask", force3D: true },
          0,
        );
      }
      tlRef.current = tl;
      if (trigger === "mount") tl.play();
      else if (trigger === "inview") st = onceInView(el, () => tl.play(), { settle: () => tl.progress(1) });
      else if (introOpen.current) tl.play();
      return () => st?.kill();
    },
    { scope: ref, dependencies: [radius, variant, delay, duration, fromScale, trigger] },
  );

  useIntro(() => {
    introOpen.current = true;
    if (trigger === "intro") tlRef.current?.play();
  });

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ borderRadius: radius }}
      data-reveal=""
    >
      <div ref={innerRef} className={cn("relative h-full w-full", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
