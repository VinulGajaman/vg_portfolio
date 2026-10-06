"use client";

/**
 * <BlurText>: portvio's per-word blur-in (DESIGN.md §2.5, [pv: motion §5]).
 * Each word {opacity:.001, filter:blur(10px), x:20} → {opacity:1, filter:blur(0px), x:0},
 * springHero (1.007s), stagger .05. Filter is cleared on complete. Short text only (≤ 40 words).
 * Reduced motion: opacity 0 → 1 over 0.4s.
 */
import { useEffect, useRef, type ElementType } from "react";
import { gsap, onceInView, useMotion, type ScrollTrigger } from "@/lib/gsap";
import { DUR, SPRING_SAMPLES, STAGGER } from "@/lib/motion-tokens";
import { useIntro } from "@/lib/store";

export type BlurTextProps = {
  as?: ElementType;
  children: string;
  /** "mount" (default; hero, case-study summary), "inview", "intro" or "manual". */
  trigger?: "mount" | "inview" | "intro" | "manual";
  play?: boolean;
  delay?: number;
  stagger?: number;
  className?: string;
  id?: string;
};

export function BlurText({
  as,
  children,
  trigger = "mount",
  play,
  delay = 0,
  stagger = STAGGER.words,
  className,
  id,
}: BlurTextProps) {
  const Tag = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const played = useRef(false);
  const introOpen = useRef(false);
  const words = children.trim().split(/\s+/);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el) return;
      const targets = el.querySelectorAll<HTMLElement>("[data-bw]");
      let st: ScrollTrigger | null = null;
      const tween = reduce
        ? gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.reduced, ease: "out", paused: true })
        : gsap.fromTo(
            targets,
            { opacity: 0.001, filter: "blur(10px)", x: 20 },
            {
              opacity: 1,
              filter: "blur(0px)",
              x: 0,
              duration: SPRING_SAMPLES.springHero.duration,
              ease: "springHero",
              stagger,
              delay,
              paused: true,
              clearProps: "filter,willChange",
            },
          );
      if (!reduce) gsap.set(el, { autoAlpha: 1 });
      tweenRef.current = tween;
      const go = () => {
        played.current = true;
        tween.play();
      };
      if (played.current) tween.progress(1);
      else if (trigger === "mount") go();
      else if (trigger === "inview")
        st = onceInView(el, go, { settle: () => tween.progress(1) });
      else if (trigger === "intro" && introOpen.current) go();
      else if (trigger === "manual" && play) go();
      return () => st?.kill();
    },
    { scope: ref, dependencies: [children, trigger, delay, stagger] },
  );

  useIntro(() => {
    introOpen.current = true;
    if (trigger === "intro" && !played.current && tweenRef.current) {
      played.current = true;
      tweenRef.current.play();
    }
  });

  useEffect(() => {
    if (trigger === "manual" && play && !played.current && tweenRef.current) {
      played.current = true;
      tweenRef.current.play();
    }
  }, [trigger, play]);

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {words.map((w, i) => (
        <span key={i}>
          <span data-bw="" className="inline-block">
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
