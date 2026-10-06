"use client";

/**
 * <Magnetic strength={0.3} max={10}> (DESIGN.md §2.5, U14).
 * Fine pointers only. Inside the element's rect plus a 24px halo, the element moves toward the
 * pointer by (pointer − centre) × strength, clamped to ±max px; [data-magnetic-inner] children
 * move an extra 0.5× for a layered effect. quickTo 0.4s power3.out; on leave it returns over
 * 0.6s power3.out (no elastic). The rect is read on pointerenter and resize, never in move.
 * The halo is a transparent pseudo layer behind the content, so it never steals clicks from
 * positioned neighbours. Off under reduced motion and in the `portvio` profile.
 */
import { useRef, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type MagneticProps = {
  children: ReactNode;
  strength?: number;
  max?: number;
  /** Halo around the rect, px. */
  halo?: number;
  className?: string;
  /** Render as block-level (default inline-block). */
  block?: boolean;
};

export function Magnetic({
  children,
  strength = 0.3,
  max = 10,
  halo = 24,
  className,
  block = false,
}: MagneticProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const moverRef = useRef<HTMLSpanElement>(null);

  useMotion(
    ({ reduce, fine }) => {
      const host = hostRef.current;
      const mover = moverRef.current;
      if (!host || !mover || reduce || !fine || !isPlus) return;
      const inner = mover.querySelector<HTMLElement>("[data-magnetic-inner]");
      const xTo = gsap.quickTo(mover, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(mover, "y", { duration: 0.4, ease: "power3.out" });
      const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.4, ease: "power3.out" }) : null;
      const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.4, ease: "power3.out" }) : null;
      let rect: DOMRect | null = null;
      const clamp = gsap.utils.clamp(-max, max);

      // The host never moves (only the inner mover does), so its rect is the rest position.
      const read = () => {
        rect = host.getBoundingClientRect();
      };
      const tos = [xTo, yTo, ixTo, iyTo].filter(Boolean) as gsap.QuickToFunc[];
      const setDuration = (d: number) => {
        for (const to of tos) if (to.tween.duration() !== d) to.tween.duration(d);
      };
      const enter = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        read();
        setDuration(0.4);
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        if (!rect) read();
        const r = rect!;
        const dx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
        const dy = clamp((e.clientY - (r.top + r.height / 2)) * strength);
        setDuration(0.4);
        xTo(dx);
        yTo(dy);
        ixTo?.(dx * 0.5);
        iyTo?.(dy * 0.5);
      };
      // Return over 0.6s power3.out, never elastic.
      const leave = () => {
        rect = null;
        setDuration(0.6);
        for (const to of tos) to(0);
      };
      const resize = () => {
        rect = null;
      };
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerleave", leave);
      window.addEventListener("resize", resize);
      return () => {
        host.removeEventListener("pointerenter", enter);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerleave", leave);
        window.removeEventListener("resize", resize);
        gsap.set([mover, inner].filter(Boolean), { x: 0, y: 0 });
      };
    },
    { scope: hostRef, dependencies: [strength, max] },
  );

  return (
    <span
      ref={hostRef}
      className={cn("relative", block ? "block" : "inline-block", className)}
    >
      <span
        aria-hidden
        className="pointer-events-auto absolute -z-10"
        style={{ inset: `-${halo}px` }}
      />
      <span ref={moverRef} className={cn("relative", block ? "block" : "inline-block")}>
        {children}
      </span>
    </span>
  );
}
