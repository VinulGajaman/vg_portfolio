"use client";

/**
 * <ScrollFillText>: word opacity scrub (DESIGN.md §2.5, U5).
 * Words go from .18 to 1 in sequence while the block scrolls from "top 85%" to "bottom 55%"
 * (scrub 0.7). Each word owns 1/n of the progress, eased with smoothstep inside its window.
 * Accent spans keep their colour and ride the same ramp. Only opacity is animated.
 * Reduced motion: full opacity, no split.
 */
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useMotion } from "@/lib/gsap";
import { SCRUB, smoothstep } from "@/lib/motion-tokens";

export type ScrollFillTextProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  start?: string;
  end?: string;
  /** Resting opacity of unfilled words. */
  from?: number;
  id?: string;
};

export function ScrollFillText({
  as,
  children,
  className,
  start = "top 85%",
  end = "bottom 55%",
  from = 0.18,
  id,
}: ScrollFillTextProps) {
  const Tag = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el || reduce) return;
      const split = SplitText.create(el, { type: "words", wordsClass: "sf-word", aria: "auto" });
      const words = split.words as HTMLElement[];
      const n = words.length;
      const last = new Float32Array(n).fill(-1);
      const apply = (p: number) => {
        for (let i = 0; i < n; i++) {
          const local = smoothstep((p - i / n) * n);
          const o = from + (1 - from) * local;
          if (Math.abs(o - last[i]) > 0.002) {
            last[i] = o;
            words[i].style.opacity = o.toFixed(3);
          }
        }
      };
      apply(0);
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: () => apply(proxy.p),
        scrollTrigger: { trigger: el, start, end, scrub: SCRUB, invalidateOnRefresh: true },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [start, end, from] },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
