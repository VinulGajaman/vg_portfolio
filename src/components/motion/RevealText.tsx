"use client";

/**
 * <RevealText mode="lines | chars | words">: SplitText reveals (DESIGN.md §2.5, U4).
 *   lines  masked lines, yPercent 110 → 0, 1.0s mask, stagger .08     (H2s, hero paragraph)
 *   chars  masked lines + chars, yPercent 110 → 0 + rotateX −40° → 0,
 *          1.2s expo.out, stagger .02 (wordmark .035)                  (wordmark, titles)
 *   words  autoAlpha 0 → 1, y 20 → 0, 1.0s springHero, stagger .05     (eyebrows, labels)
 * SplitText autoSplit re-splits after fonts load and on resize; the tween returned from
 * onSplit is reverted and re-created with its progress kept.
 * Reduced motion: opacity 0 → 1 over 0.4s, no split. `portvio` profile: block <Reveal text>.
 */
import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, onceInView, SplitText, useMotion, type ScrollTrigger } from "@/lib/gsap";
import { DUR, isPlus, SPRING_SAMPLES, STAGGER } from "@/lib/motion-tokens";
import { useIntro } from "@/lib/store";
import { cn } from "@/lib/cn";

export type RevealTextMode = "lines" | "chars" | "words";

export type RevealTextProps = {
  as?: ElementType;
  mode?: RevealTextMode;
  /** Seconds after the trigger. */
  delay?: number;
  /** Override the per-piece stagger. */
  stagger?: number;
  /** Override the per-piece duration. */
  duration?: number;
  /** Override the ease (e.g. "expo.out"). */
  ease?: string;
  /** Start offset for lines/chars, default 110 (footer name uses 100). */
  fromYPercent?: number;
  /** "inview" (default, 50% visible once), "mount", "intro" (intro gate) or "manual" (`play`). */
  trigger?: "inview" | "mount" | "intro" | "manual";
  /** For trigger="manual": plays when it becomes true. */
  play?: boolean;
  /** ScrollTrigger start override, e.g. "30% bottom" for "30% visible". */
  start?: string;
  containerAnimation?: gsap.core.Animation;
  onComplete?: () => void;
  className?: string;
  id?: string;
  children: ReactNode;
};

export function RevealText({
  as,
  mode = "lines",
  delay = 0,
  stagger,
  duration,
  ease,
  fromYPercent = 110,
  trigger = "inview",
  play,
  start,
  containerAnimation,
  onComplete,
  className,
  id,
  children,
}: RevealTextProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const tweenRef = useRef<gsap.core.Animation | null>(null);
  const playedRef = useRef(false);
  const introOpen = useRef(false);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  });

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el) return;
      let st: ScrollTrigger | null = null;

      const schedule = (tween: gsap.core.Animation) => {
        tweenRef.current = tween;
        if (playedRef.current) {
          tween.play();
          return;
        }
        const go = () => {
          playedRef.current = true;
          tween.play();
        };
        if (trigger === "mount") go();
        else if (trigger === "inview") {
          st = onceInView(el, go, {
            start,
            containerAnimation,
            settle: () => {
              playedRef.current = true;
              tween.progress(1);
            },
          });
        } else if (trigger === "intro" && introOpen.current) go();
        else if (trigger === "manual" && play) go();
      };

      const onDone = () => completeRef.current?.();

      if (reduce || !isPlus) {
        const tween = reduce
          ? gsap.fromTo(
              el,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: DUR.reduced, ease: "out", paused: true, onComplete: onDone },
            )
          : gsap.fromTo(
              el,
              { autoAlpha: 0, y: 30 },
              {
                autoAlpha: 1,
                y: 0,
                duration: SPRING_SAMPLES.springReveal.duration,
                ease: "springReveal",
                delay: 0.2,
                paused: true,
                onComplete: onDone,
              },
            );
        schedule(tween);
        return () => st?.kill();
      }

      const split = SplitText.create(el, {
        type: mode === "lines" ? "lines" : mode === "chars" ? "lines,chars" : "words",
        mask: mode === "words" ? undefined : "lines",
        linesClass: "rt-line",
        charsClass: "rt-char",
        wordsClass: "rt-word",
        aria: "auto",
        autoSplit: true,
        onSplit(self) {
          st?.kill();
          gsap.set(el, { visibility: "visible" });
          let tween: gsap.core.Tween;
          if (mode === "lines") {
            tween = gsap.fromTo(
              self.lines,
              { yPercent: fromYPercent },
              {
                yPercent: 0,
                duration: duration ?? 1,
                ease: ease ?? "mask",
                stagger: stagger ?? STAGGER.lines,
                delay,
                paused: true,
                force3D: true,
                onComplete: onDone,
              },
            );
          } else if (mode === "chars") {
            tween = gsap.fromTo(
              self.chars,
              { yPercent: fromYPercent, rotateX: -40 },
              {
                yPercent: 0,
                rotateX: 0,
                duration: duration ?? 1.2,
                ease: ease ?? "expo.out",
                stagger: stagger ?? STAGGER.chars,
                delay,
                paused: true,
                force3D: true,
                onComplete: onDone,
              },
            );
          } else {
            tween = gsap.fromTo(
              self.words,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                duration: duration ?? SPRING_SAMPLES.springHero.duration,
                ease: ease ?? "springHero",
                stagger: stagger ?? STAGGER.words,
                delay,
                paused: true,
                onComplete: onDone,
              },
            );
          }
          schedule(tween);
          return tween;
        },
      });

      return () => {
        st?.kill();
        split.revert();
      };
    },
    {
      scope: ref,
      dependencies: [mode, delay, stagger, duration, ease, fromYPercent, trigger, start, containerAnimation],
    },
  );

  useIntro(() => {
    introOpen.current = true;
    if (trigger === "intro" && !playedRef.current && tweenRef.current) {
      playedRef.current = true;
      tweenRef.current.play();
    }
  });

  useEffect(() => {
    if (trigger === "manual" && play && !playedRef.current && tweenRef.current) {
      playedRef.current = true;
      tweenRef.current.play();
    }
  }, [trigger, play]);

  return (
    <Tag ref={ref} id={id} className={cn(mode === "chars" && "rt-chars", className)} data-reveal-text="">
      {children}
    </Tag>
  );
}
