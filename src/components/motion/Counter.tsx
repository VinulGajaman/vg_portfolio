"use client";

/**
 * <Counter to from={0} decimals prefix suffix duration={1.4}> (DESIGN.md §2.5, U6).
 * gsap.to(obj, {val: to, duration: 1.4, ease: power2.out (cubic out), snap 1/10^decimals}).
 * 50% visible, once (inside the rail pass `containerAnimation`). tabular-nums; the box width is
 * reserved with the final value so nothing shifts while counting up. Counting down is
 * supported (the suffix then follows the shrinking number). SSR renders the final value; JS resets to `from` just before the trigger, so
 * crawlers and no-JS visitors see the real number. Reduced motion: final value immediately.
 */
import { useEffect, useRef, type ElementType } from "react";
import { gsap, onceInView, useMotion, type ScrollTrigger } from "@/lib/gsap";
import { DUR } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type CounterProps = {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  /** Thousands separator, e.g. "," (default none). */
  separator?: string;
  as?: ElementType;
  className?: string;
  containerAnimation?: gsap.core.Animation;
  /** ScrollTrigger start override (rail panels use "left 75%"). */
  start?: string;
  /** "inview" (default) or "manual" with `play`. */
  trigger?: "inview" | "manual";
  play?: boolean;
  onComplete?: () => void;
};

function format(v: number, decimals: number, separator: string) {
  const fixed = v.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return dec ? `${withSep}.${dec}` : withSep;
}

export function Counter({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = DUR.count,
  delay = 0,
  separator = "",
  as,
  className,
  containerAnimation,
  start,
  trigger = "inview",
  play,
  onComplete,
}: CounterProps) {
  const Tag = (as ?? "span") as ElementType;
  const rootRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const played = useRef(false);
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  });

  const finalText = format(to, decimals, separator);
  const fromText = format(from, decimals, separator);
  const countsDown = from > to;

  useMotion(
    ({ reduce }) => {
      const root = rootRef.current;
      const num = numRef.current;
      if (!root || !num || reduce) return;
      const obj = { val: from };
      let st: ScrollTrigger | null = null;
      if (!played.current) num.textContent = fromText;
      const tween = gsap.to(obj, {
        val: to,
        duration,
        delay,
        ease: "power2.out",
        snap: { val: 1 / 10 ** decimals },
        paused: true,
        onUpdate: () => {
          num.textContent = format(obj.val, decimals, separator);
        },
        onComplete: () => doneRef.current?.(),
      });
      tweenRef.current = tween;
      const go = () => {
        played.current = true;
        tween.play();
      };
      if (played.current) {
        tween.progress(1);
      } else if (trigger === "inview") {
        st = onceInView(root, go, {
          start,
          containerAnimation,
          settle: () => {
            played.current = true;
            tween.progress(1);
          },
        });
      } else if (play) go();
      return () => {
        st?.kill();
        num.textContent = finalText;
      };
    },
    { scope: rootRef, dependencies: [to, from, decimals, duration, delay, separator, containerAnimation, start, trigger] },
  );

  useEffect(() => {
    if (trigger === "manual" && play && !played.current && tweenRef.current) {
      played.current = true;
      tweenRef.current.play();
    }
  }, [trigger, play]);

  return (
    <Tag ref={rootRef} className={cn("tabular whitespace-nowrap", className)}>
      <span className="sr-only">
        {prefix}
        {finalText}
        {suffix}
      </span>
      <span aria-hidden>
        {prefix}
        {countsDown ? (
          // Counting down shrinks the number; the suffix follows it instead of leaving a gap.
          <span ref={numRef}>{finalText}</span>
        ) : (
          <span className="relative inline-block text-right">
            <span className="invisible">{finalText}</span>
            <span ref={numRef} className="absolute inset-y-0 right-0">
              {finalText}
            </span>
          </span>
        )}
        {suffix}
      </span>
    </Tag>
  );
}
