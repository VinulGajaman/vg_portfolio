"use client";

/**
 * <SlotSwap>: conveyor label / icon swap (DESIGN.md §2.5, [pv: interactions §3]).
 *   vertical    A y 0 → −30px (out of an overflow-hidden mask), B +30px → 0
 *   horizontal  A x 0 → +24px, B −24px → 0 (hero glass arrow)
 * All on springUI. Hover target: closest [data-roll-parent] / a / button (fine pointers), plus
 * :focus-visible; or controlled with `active` (e.g. "Copy" → "Copied").
 *
 * <SlotValue>: the same conveyor for a value that changes (counter digits "01" → "02").
 * Reduced motion: opacity crossfade only.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type SlotSwapProps = {
  a: ReactNode;
  /** Defaults to a copy of `a`. */
  b?: ReactNode;
  axis?: "y" | "x";
  /** Travel in px (default 30 for y, 24 for x). */
  distance?: number;
  /** Controlled state. */
  active?: boolean;
  className?: string;
};

function useHoverHost(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!enabled) return;
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
      if ((e.target as HTMLElement | null)?.matches?.(":focus-visible")) setHover(true);
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("focusin", focusIn);
    host.addEventListener("focusout", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("focusin", focusIn);
      host.removeEventListener("focusout", leave);
    };
  }, [ref, enabled]);
  return hover;
}

export function SlotSwap({ a, b, axis = "y", distance, active, className }: SlotSwapProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const controlled = active !== undefined;
  const hover = useHoverHost(ref, !controlled);
  const reduce = useReducedMotion();
  const on = controlled ? active : hover;
  const d = distance ?? (axis === "y" ? 30 : 24);
  const out = axis === "y" ? -d : d;
  const inn = axis === "y" ? d : -d;
  const prop = axis;

  return (
    <span ref={ref} className={cn("relative inline-grid overflow-hidden align-top", className)}>
      <m.span
        className="col-start-1 row-start-1 inline-flex items-center justify-center"
        initial={false}
        animate={reduce ? { opacity: on ? 0 : 1 } : { [prop]: on ? out : 0, opacity: 1 }}
        transition={reduce ? { duration: 0.15 } : SPRING.springUI}
        aria-hidden={on ? true : undefined}
      >
        {a}
      </m.span>
      <m.span
        className="col-start-1 row-start-1 inline-flex items-center justify-center"
        initial={false}
        animate={reduce ? { opacity: on ? 1 : 0 } : { [prop]: on ? 0 : inn, opacity: 1 }}
        transition={reduce ? { duration: 0.15 } : SPRING.springUI}
        aria-hidden={on ? undefined : true}
      >
        {b ?? a}
      </m.span>
    </span>
  );
}

export type SlotValueProps = {
  value: ReactNode;
  /** Key that changes with the value (defaults to String(value)). */
  valueKey?: string;
  axis?: "y" | "x";
  distance?: number;
  className?: string;
};

/** Vertical conveyor for a changing value (carousel "01/03", Impact "20 min" → "secs"). */
export function SlotValue({ value, valueKey, axis = "y", distance, className }: SlotValueProps) {
  const reduce = useReducedMotion();
  const d = distance ?? (axis === "y" ? 30 : 24);
  const key = valueKey ?? String(value);
  const from = axis === "y" ? { y: d } : { x: -d };
  const to = axis === "y" ? { y: -d } : { x: d };
  return (
    <span className={cn("relative inline-grid overflow-hidden align-top", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={key}
          className="col-start-1 row-start-1 inline-block"
          initial={reduce ? { opacity: 0 } : { ...from, opacity: 1 }}
          animate={reduce ? { opacity: 1 } : { x: 0, y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { ...to, opacity: 1 }}
          transition={reduce ? { duration: 0.15 } : SPRING.springUI}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
