"use client";

/**
 * <ScrollProgress>: fixed 2px #F65802 bar at the top (DESIGN.md §1.6.5).
 * transform: scaleX(progress), origin 0 50%, z 50. Fades in after scrollY > 100vh and hides
 * while the menu is open. Off in the `portvio` profile.
 */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { useUI } from "@/lib/store";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pastFold = useRef(false);
  const menuOpen = useUI((s) => s.menuOpen);
  const menuRef = useRef(menuOpen);

  const sync = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      autoAlpha: pastFold.current && !menuRef.current ? 1 : 0,
      duration: 0.3,
      ease: "out",
      overwrite: true,
    });
  };

  useEffect(() => {
    menuRef.current = menuOpen;
    sync();
  });

  useMotion(
    () => {
      const bar = barRef.current;
      if (!bar || !isPlus) return;
      const setScale = gsap.quickSetter(bar, "scaleX") as (v: number) => void;
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          setScale(self.progress);
          const past = self.scroll() > window.innerHeight;
          if (past !== pastFold.current) {
            pastFold.current = past;
            sync();
          }
        },
      });
      setScale(st.progress);
      return () => st.kill();
    },
    { scope: ref },
  );

  if (!isPlus) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none invisible fixed inset-x-0 top-0 z-50 h-[2px] opacity-0">
      <div ref={barRef} className="h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
