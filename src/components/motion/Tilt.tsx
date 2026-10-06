"use client";

/**
 * <Tilt max={6}>: scroll-craft's pointer tilt, ported exactly (DESIGN.md §2.5, U20).
 * Mouse only, desktop and tablet. nx = (x − cx)/(w/2), ny = (y − cy)/(h/2); active while
 * |nx| and |ny| < 1.6 (a halo), else the target is 0. rotateX = clamp(ny,−1,1)·−max,
 * rotateY = clamp(nx,−1,1)·max. Each gsap.ticker frame: cur += (target − cur) × 0.09, written
 * as perspective(1100px) rotateX() rotateY() on the inner wrapper (never on the element a
 * ScrollTrigger measures). Rect read on pointerenter, scroll end and resize, never in move.
 * Off under reduced motion, on phone and in the `portvio` profile.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type TiltProps = {
  children: ReactNode;
  max?: number;
  /** Polled every frame; while it returns true the tilt eases back to 0 (rail velocity gate). */
  isDisabled?: () => boolean;
  className?: string;
  innerClassName?: string;
};

export function Tilt({ children, max = 6, isDisabled, className, innerClassName }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const disabledRef = useRef(isDisabled);
  useEffect(() => {
    disabledRef.current = isDisabled;
  });

  useMotion(
    ({ reduce, fine, isPhone }) => {
      const el = ref.current;
      const inner = innerRef.current;
      if (!el || !inner || reduce || !fine || isPhone || !isPlus) return;
      let rect = el.getBoundingClientRect();
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let running = false;
      const clamp1 = gsap.utils.clamp(-1, 1);

      const read = () => {
        rect = el.getBoundingClientRect();
      };
      const tick = () => {
        const off = disabledRef.current?.() ?? false;
        const gx = off ? 0 : tx;
        const gy = off ? 0 : ty;
        cx += (gx - cx) * 0.09;
        cy += (gy - cy) * 0.09;
        inner.style.transform = `perspective(1100px) rotateX(${cx.toFixed(3)}deg) rotateY(${cy.toFixed(3)}deg)`;
        if (Math.abs(gx - cx) < 0.01 && Math.abs(gy - cy) < 0.01 && gx === 0 && gy === 0) {
          inner.style.transform = "";
          inner.style.willChange = "";
          gsap.ticker.remove(tick);
          running = false;
        }
      };
      const start = () => {
        if (running) return;
        running = true;
        inner.style.willChange = "transform";
        gsap.ticker.add(tick);
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        if (Math.abs(nx) < 1.6 && Math.abs(ny) < 1.6) {
          tx = clamp1(ny) * -max;
          ty = clamp1(nx) * max;
          start();
        } else if (tx !== 0 || ty !== 0) {
          tx = 0;
          ty = 0;
        }
      };
      el.addEventListener("pointerenter", read);
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("resize", read);
      ScrollTrigger.addEventListener("scrollEnd", read);
      return () => {
        el.removeEventListener("pointerenter", read);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("resize", read);
        ScrollTrigger.removeEventListener("scrollEnd", read);
        gsap.ticker.remove(tick);
        inner.style.transform = "";
        inner.style.willChange = "";
      };
    },
    { scope: ref, dependencies: [max] },
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div ref={innerRef} className={cn("h-full w-full", innerClassName)} style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
