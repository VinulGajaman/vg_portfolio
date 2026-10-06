"use client";

/**
 * <Reveal>: portvio's default block fade-up (DESIGN.md §2.5).
 *   text      {autoAlpha:0, y:30}
 *   card      {autoAlpha:0, y:30, scale:.8}
 *   card-tall {autoAlpha:0, y:60, scale:.8}  springCard, threshold 0
 *   from-left {autoAlpha:0, x:-50}
 * → {autoAlpha:1, x:0, y:0, scale:1, duration 1.207, ease springReveal, delay}
 * Trigger: 50% visible, once. Reduced motion: opacity 0 → 1 over 0.4s `out`.
 */
import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { DUR, SPRING_SAMPLES } from "@/lib/motion-tokens";
import { useIntro } from "@/lib/store";

export type RevealVariant = "text" | "card" | "card-tall" | "from-left";

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  text: { y: 30 },
  card: { y: 30, scale: 0.8 },
  "card-tall": { y: 60, scale: 0.8 },
  "from-left": { x: -50 },
};

type RevealProps<T extends ElementType> = {
  as?: T;
  variant?: RevealVariant;
  /** Sibling cadence .2 / .3 / .4 (§2.3). */
  delay?: number;
  /** "inview" (default), "mount" (plays on mount) or "intro" (waits for the intro gate). */
  trigger?: "inview" | "mount" | "intro";
  /** Override the ScrollTrigger start (default: 50% visible; card-tall uses "top bottom"). */
  start?: string;
  /** Horizontal rail container tween, for reveals inside <HorizontalRail>. */
  containerAnimation?: gsap.core.Animation;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Reveal<T extends ElementType = "div">({
  as,
  variant = "text",
  delay = 0.2,
  trigger = "inview",
  start,
  containerAnimation,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const introOpen = useRef(false);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el) return;
      const tween = reduce
        ? gsap.fromTo(
            el,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: DUR.reduced, ease: "out", paused: true },
          )
        : gsap.fromTo(
            el,
            { autoAlpha: 0, x: 0, y: 0, scale: 1, ...FROM[variant] },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration:
                variant === "card-tall"
                  ? SPRING_SAMPLES.springCard.duration
                  : SPRING_SAMPLES.springReveal.duration,
              ease: variant === "card-tall" ? "springCard" : "springReveal",
              delay: reduce ? 0 : delay,
              paused: true,
              force3D: true,
              clearProps: "transform,willChange",
            },
          );
      tweenRef.current = tween;
      if (trigger === "mount") {
        tween.play();
      } else if (trigger === "inview") {
        onceInView(el, () => tween.play(), {
          start: start ?? (variant === "card-tall" ? "top bottom" : undefined),
          containerAnimation,
          settle: () => tween.progress(1),
        });
      } else if (trigger === "intro" && introOpen.current) {
        tween.play();
      }
    },
    { scope: ref, dependencies: [variant, delay, trigger, start, containerAnimation] },
  );

  useIntro(() => {
    introOpen.current = true;
    if (trigger === "intro") tweenRef.current?.play();
  });

  return (
    <Tag ref={ref} className={className} data-reveal="" {...rest}>
      {children}
    </Tag>
  );
}
