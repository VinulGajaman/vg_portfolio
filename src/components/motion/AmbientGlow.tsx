"use client";

/**
 * <AmbientGlow>: gradient-mesh glow fields (DESIGN.md §1.6.2, U17).
 * 2–3 radial blobs, radial-gradient(closest-side, rgba(246,88,2,.10), transparent), 600–900px
 * across; softness comes from the gradient (no filter). Each drifts on a 24–32s ease-in-out
 * alternate loop (translate ±6vw / ±4vh, scale 1 → 1.15) plus scroll parallax 0.15. Opacity
 * never exceeds .12. Loops pause while the section is off-screen. Static under reduced motion.
 * Place inside a positioned section; it fills it and sits behind the content.
 */
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type GlowBlob = {
  /** Centre, % of the section. */
  x: number;
  y: number;
  /** Diameter, px (600–900). */
  size: number;
  /** Loop length, s (24–32). */
  duration?: number;
  /** Drift end offsets. */
  dx?: string;
  dy?: string;
  /** Peak alpha of the gradient (≤ .12). */
  alpha?: number;
};

const PRESETS: Record<"a" | "b" | "c", GlowBlob[]> = {
  a: [
    { x: 18, y: 30, size: 820, duration: 28, dx: "6vw", dy: "4vh" },
    { x: 82, y: 70, size: 700, duration: 32, dx: "-6vw", dy: "-4vh", alpha: 0.08 },
  ],
  b: [
    { x: 75, y: 25, size: 900, duration: 30, dx: "-6vw", dy: "4vh" },
    { x: 20, y: 80, size: 640, duration: 24, dx: "6vw", dy: "-4vh", alpha: 0.08 },
  ],
  c: [
    { x: 50, y: 20, size: 760, duration: 26, dx: "6vw", dy: "4vh" },
    { x: 15, y: 75, size: 620, duration: 30, dx: "4vw", dy: "-4vh", alpha: 0.08 },
    { x: 88, y: 60, size: 680, duration: 32, dx: "-6vw", dy: "-3vh", alpha: 0.07 },
  ],
};

export type AmbientGlowProps = {
  blobs?: GlowBlob[];
  preset?: keyof typeof PRESETS;
  /** Scroll parallax factor (0.15). */
  parallax?: number;
  className?: string;
};

export function AmbientGlow({ blobs, preset = "a", parallax = 0.15, className }: AmbientGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const list = blobs ?? PRESETS[preset];

  // Pause the CSS loops off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.style.setProperty("--glow-state", e.isIntersecting ? "running" : "paused");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      const layer = layerRef.current;
      if (!el || !layer || reduce || !parallax) return;
      gsap.fromTo(
        layer,
        { y: () => parallax * window.innerHeight * 0.5 },
        {
          y: () => -parallax * window.innerHeight * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [parallax] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ ["--glow-state" as string]: "paused" } as CSSProperties}
    >
      <div ref={layerRef} className="absolute inset-0">
        {list.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full motion-safe:[animation:glow-drift_var(--glow-dur)_ease-in-out_infinite_alternate]"
            style={
              {
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                marginLeft: -b.size / 2,
                marginTop: -b.size / 2,
                background: `radial-gradient(closest-side, rgba(246,88,2,${Math.min(b.alpha ?? 0.1, 0.12)}), transparent)`,
                ["--glow-dur"]: `${b.duration ?? 28}s`,
                ["--gx"]: b.dx ?? "6vw",
                ["--gy"]: b.dy ?? "-4vh",
                animationPlayState: "var(--glow-state)",
                animationDelay: `${-i * 7}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
