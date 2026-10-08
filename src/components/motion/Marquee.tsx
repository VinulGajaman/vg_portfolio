"use client";

/**
 * <Marquee speed gap mask velocity reverse> (DESIGN.md §2.5, U7).
 * Linear, leftward, seamless. The item set is duplicated until the track is ≥ 2× the container
 * (duplicates aria-hidden), driven by gsap.ticker with a wrapped x and permanent will-change on
 * the track. No hover slow-down by default (portvio); `hoverSlow` eases the speed to that
 * multiplier while a mouse is over the row. `direction` -1 runs it rightward.
 * Velocity: speed × (1 + clamp(|v|/1000, 0, 3)), skewX = clamp(v/300, −6, 6)°, both smoothed
 * with quickTo (0.5s power3.out) and decaying to rest; `reverse` flips direction on scroll-up.
 * Pauses off-screen, when the tab is hidden and when the hero is covered. Phone: runs, velocity
 * off. Reduced motion: a static row (wraps on phone), duplicates removed.
 */
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { getScrollVelocity } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/hooks";
import { isPlus } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type MarqueeProps = {
  /** Children are list items (<li>), rendered once per set. */
  children: ReactNode;
  /** px/s: hero chips 40, stack tiles 50. */
  speed?: number;
  /** Gap between items, px: chips 8, tiles 6. */
  gap?: number;
  /** Edge mask: "chips" 10.36/88.29%, "tiles" 7.21/92.79%, or none. */
  mask?: "chips" | "tiles" | "none";
  velocity?: boolean;
  reverse?: boolean;
  /** Base direction: 1 leftward (default), -1 rightward. */
  direction?: 1 | -1;
  /** Speed multiplier while a mouse hovers the row (e.g. .25); 1 = no slow-down. */
  hoverSlow?: number;
  className?: string;
  setClassName?: string;
  /** Accessible label for the list. */
  label?: string;
};

export function Marquee({
  children,
  speed = 40,
  gap = 8,
  mask = "none",
  velocity = true,
  reverse = false,
  direction = 1,
  hoverSlow = 1,
  className,
  setClassName,
  label,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [copies, setCopies] = useState(2);

  // Size the duplicate count so the track is at least 2× the container.
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || reduce) return;
    const measure = () => {
      const set = track.firstElementChild as HTMLElement | null;
      if (!set) return;
      const w = set.offsetWidth;
      if (!w) return;
      const need = Math.max(2, Math.ceil((root.offsetWidth * 2) / w) + 1);
      setCopies((c) => (c === need ? c : need));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    if (track.firstElementChild) ro.observe(track.firstElementChild);
    return () => ro.disconnect();
  }, [reduce, children]);

  useMotion(
    ({ reduce: rm, isPhone }) => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track || rm) return;
      const set = track.firstElementChild as HTMLElement | null;
      if (!set) return;

      let W = set.offsetWidth;
      let x = 0;
      let visible = true;
      let covered = false;
      const state = { mult: 1, dir: direction, hover: 1 };
      const useVel = velocity && !isPhone && isPlus;
      const multTo = gsap.quickTo(state, "mult", { duration: 0.5, ease: "power3.out" });
      const dirTo = gsap.quickTo(state, "dir", { duration: 0.5, ease: "power3.out" });
      const hoverTo = gsap.quickTo(state, "hover", { duration: 0.8, ease: "power3.out" });
      const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && hoverTo(hoverSlow);
      const onLeave = () => hoverTo(1);
      if (hoverSlow !== 1) {
        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointerleave", onLeave);
      }
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
      const setX = gsap.quickSetter(track, "x", "px") as (v: number) => void;
      const clampMult = gsap.utils.clamp(0, 3);
      const clampSkew = gsap.utils.clamp(-6, 6);

      const tick = (_t: number, deltaMs: number) => {
        if (!visible || covered || document.hidden || !W) return;
        if (useVel) {
          const v = getScrollVelocity();
          multTo(1 + clampMult(Math.abs(v) / 1000));
          skewTo(clampSkew(v / 300));
          if (reverse) dirTo(v < -20 ? -direction : direction);
        }
        const dt = Math.min(deltaMs, 64) / 1000;
        x -= state.dir * speed * state.mult * state.hover * dt;
        if (x <= -W) x += W;
        else if (x > 0) x -= W;
        setX(x);
      };
      gsap.ticker.add(tick);

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(root);
      const ro = new ResizeObserver(() => {
        W = set.offsetWidth;
      });
      ro.observe(set);
      const onCovered = (e: Event) => {
        if (root.closest("#hero")) covered = Boolean((e as CustomEvent<boolean>).detail);
      };
      window.addEventListener("vg:hero-covered", onCovered);

      return () => {
        gsap.ticker.remove(tick);
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("vg:hero-covered", onCovered);
        gsap.set(track, { x: 0, skewX: 0 });
      };
    },
    { scope: rootRef, dependencies: [speed, velocity, reverse, direction, hoverSlow, copies] },
  );

  const maskClass = mask === "chips" ? "mask-chips" : mask === "tiles" ? "mask-tiles" : "";
  const items = Children.toArray(children);

  if (reduce) {
    return (
      <div ref={rootRef} className={cn("overflow-hidden", maskClass, className)}>
        <ul
          aria-label={label}
          className={cn("flex flex-wrap md:flex-nowrap", setClassName)}
          style={{ gap }}
        >
          {items}
        </ul>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("overflow-hidden", maskClass, className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, i) => (
          <ul
            key={i}
            aria-label={i === 0 ? label : undefined}
            aria-hidden={i === 0 ? undefined : true}
            className={cn("flex shrink-0", setClassName)}
            style={{ gap, paddingRight: gap }}
          >
            {items}
          </ul>
        ))}
      </div>
    </div>
  );
}
