"use client";

/**
 * <Spotlight>: cursor spotlight (DESIGN.md §1.6.3, U17). Fine pointer only.
 * Sets --mx / --my on the host; its ::before paints
 * radial-gradient(28rem circle at var(--mx) var(--my), rgba(246,88,2,.08), transparent 70%).
 * The rect is read on pointerenter (never in move); writes are rAF-throttled.
 * Used on the expertise list, the experience shell and the footer. Off under reduced motion.
 */
import { useEffect, useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { isPlus } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

type SpotlightProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Spotlight<T extends ElementType = "div">({
  as,
  children,
  className,
  ...rest
}: SpotlightProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isPlus) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rect: DOMRect | null = null;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      if (!rect) return;
      el.style.setProperty("--mx", `${px - rect.left}px`);
      el.style.setProperty("--my", `${py - rect.top}px`);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches || reduce.matches) return;
      rect = el.getBoundingClientRect();
      px = e.clientX;
      py = e.clientY;
      write();
      el.style.setProperty("--spot-o", "1");
    };
    const move = (e: PointerEvent) => {
      if (!rect) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const leave = () => {
      rect = null;
      el.style.setProperty("--spot-o", "0");
    };
    const invalidate = () => {
      if (rect) rect = el.getBoundingClientRect();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  return (
    <Tag ref={ref} className={cn("spotlight", className)} {...rest}>
      {children}
    </Tag>
  );
}
