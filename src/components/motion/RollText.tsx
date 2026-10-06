"use client";

/**
 * <RollText>: portvio's per-letter 3D flip, exact (DESIGN.md §2.5, [pv: interactions §2]).
 *   wrapper inline-flex, overflow hidden, perspective 1000px
 *   A: {y:0, rotateX:0, opacity:1}        → hover {y:'-100%', rotateX:90, opacity:0}
 *   B: {y:'100%', rotateX:-90, opacity:0} → hover {y:0, rotateX:0, opacity:1}
 *   per char {duration D, ease [.42,0,.58,1]}, staggerChildren S, forward order both ways
 *   default D .2 / S .025 · size="lg" D .3 / S .03
 * Hover target: the closest [data-roll-parent], else the closest a/button. Also :focus-visible.
 * Hover is gated to fine pointers. Reduced motion: 0.15s opacity crossfade between copies.
 */
import { useEffect, useRef, useState } from "react";
import { m, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/hooks";
import { BEZIER, DUR, STAGGER } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type RollTextProps = {
  children: string;
  /** Copy B text (defaults to the same text). E.g. "Menu" → "Close". */
  to?: string;
  size?: "default" | "lg";
  /** Controlled state; when set, hover listeners are ignored. */
  active?: boolean;
  className?: string;
};

const NBSP = " ";

function chars(text: string) {
  return Array.from(text).map((c) => (c === " " ? NBSP : c));
}

export function RollText({ children, to, size = "default", active, className }: RollTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const controlled = active !== undefined;
  const on = controlled ? active : hover;

  const D = size === "lg" ? DUR.rollLg : DUR.roll;
  const S = size === "lg" ? STAGGER.rollLg : STAGGER.roll;

  useEffect(() => {
    if (controlled) return;
    const el = ref.current;
    if (!el) return;
    const host =
      (el.closest("[data-roll-parent]") as HTMLElement | null) ??
      (el.closest("a,button,[role='button']") as HTMLElement | null) ??
      el;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && fine.matches) setHover(true);
    };
    const leave = () => setHover(false);
    const focusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.matches?.(":focus-visible")) setHover(true);
    };
    const focusOut = () => setHover(false);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("focusin", focusIn);
    host.addEventListener("focusout", focusOut);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("focusin", focusIn);
      host.removeEventListener("focusout", focusOut);
    };
  }, [controlled]);

  const text = children;
  const textB = to ?? children;
  const transition = { duration: D, ease: BEZIER.roll };

  const copy: Variants = {
    rest: { transition: { staggerChildren: S } },
    hover: { transition: { staggerChildren: S } },
  };
  const charA: Variants = reduce
    ? { rest: { opacity: 1 }, hover: { opacity: 1 } }
    : {
        rest: { y: 0, rotateX: 0, opacity: 1, transition },
        hover: { y: "-100%", rotateX: 90, opacity: 0, transition },
      };
  const charB: Variants = reduce
    ? { rest: { opacity: 1 }, hover: { opacity: 1 } }
    : {
        rest: { y: "100%", rotateX: -90, opacity: 0, transition },
        hover: { y: 0, rotateX: 0, opacity: 1, transition },
      };
  const fadeA: Variants = {
    rest: { opacity: 1, transition: { duration: 0.15, ease: "linear" } },
    hover: { opacity: 0, transition: { duration: 0.15, ease: "linear" } },
  };
  const fadeB: Variants = {
    rest: { opacity: 0, transition: { duration: 0.15, ease: "linear" } },
    hover: { opacity: 1, transition: { duration: 0.15, ease: "linear" } },
  };

  return (
    <span ref={ref} className={cn("roll", className)}>
      <span className="sr-only">{on && to ? to : text}</span>
      <m.span
        aria-hidden
        className="roll-inner"
        initial="rest"
        animate={on ? "hover" : "rest"}
      >
        <m.span className="roll-copy" variants={reduce ? fadeA : copy}>
          {chars(text).map((c, i) => (
            <m.span key={i} className="roll-char" variants={charA}>
              {c}
            </m.span>
          ))}
        </m.span>
        <m.span className="roll-copy" variants={reduce ? fadeB : copy}>
          {chars(textB).map((c, i) => (
            <m.span key={i} className="roll-char" variants={charB}>
              {c}
            </m.span>
          ))}
        </m.span>
      </m.span>
    </span>
  );
}
