"use client";

/**
 * <StickyHero>: portvio's signature sticky hero + shrink (DESIGN.md §3.2, §2.6).
 * section#hero: sticky top 0, 100svh (min 640), overflow hidden, z 1. Every later section is
 * z 2 with a canvas background, so it slides over the hero.
 * Shrink: trigger #about "top bottom" → "bottom bottom", scrub 0.7, linear:
 *   inner scale 1 → .7, y 0 → −80 (origin 50% 50%)
 *   upgrades: clip-path inset(0 round 0px) → inset(0 round 24px), dim layer 0 → .45
 *   layered depth: every [data-hero-depth="0.31"] child gets extra y = rate × T,
 *   T = 80 + 0.1 × D (D = the shrink range); [data-hero-depth-scale="1.06"] also scales.
 * Drift: outer wrapper y = −0.1 × scrollY via quickSetter from a ScrollTrigger onUpdate.
 * Covered: once #about's bottom is 100vh past the viewport top the hero gets
 * visibility:hidden and fires `vg:hero-covered` (marquee and video pause).
 * Reduced motion: still sticky, no scale, drift, dim or depth. `portvio` profile: shrink and
 * drift only.
 */
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { isPlus, SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type StickyHeroProps = {
  children: ReactNode;
  /** The section that slides over the hero and drives the shrink. */
  coverSelector?: string;
  id?: string;
  "aria-labelledby"?: string;
  className?: string;
  /** Classes for the content layer (default: flex column, justify-end, padding 0 gutter 50). */
  contentClassName?: string;
};

export function StickyHero({
  children,
  coverSelector = "#about",
  id = "hero",
  className,
  contentClassName,
  ...aria
}: StickyHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce }) => {
      const section = sectionRef.current;
      const outer = outerRef.current;
      const inner = innerRef.current;
      const clip = clipRef.current;
      const dim = dimRef.current;
      const cover = document.querySelector<HTMLElement>(coverSelector);
      if (!section || !outer || !inner || !clip || !dim) return;

      // Covered → hide and pause (runs in every mode, it is a performance rule).
      const setCovered = (v: boolean) => {
        section.style.visibility = v ? "hidden" : "";
        window.dispatchEvent(new CustomEvent("vg:hero-covered", { detail: v }));
      };
      const coveredST = cover
        ? ScrollTrigger.create({
            trigger: cover,
            start: "bottom -100%",
            onEnter: () => setCovered(true),
            onLeaveBack: () => setCovered(false),
          })
        : null;

      if (reduce || !cover) {
        return () => {
          coveredST?.kill();
          setCovered(false);
        };
      }

      const range = () => cover.offsetHeight;
      const T = () => 80 + 0.1 * range();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: cover,
          start: "top bottom",
          end: "bottom bottom",
          scrub: SCRUB,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            inner.style.willChange = self.isActive ? "transform" : "";
          },
        },
      });
      tl.fromTo(inner, { scale: 1, y: 0 }, { scale: 0.7, y: -80, force3D: true }, 0);
      if (isPlus) {
        tl.fromTo(
          clip,
          { clipPath: "inset(0px 0px 0px 0px round 0px)" },
          { clipPath: "inset(0px 0px 0px 0px round 24px)" },
          0,
        ).fromTo(dim, { opacity: 0 }, { opacity: 0.45 }, 0);
        section.querySelectorAll<HTMLElement>("[data-hero-depth]").forEach((layer) => {
          const rate = parseFloat(layer.dataset.heroDepth ?? "0") || 0;
          const endScale = parseFloat(layer.dataset.heroDepthScale ?? "1") || 1;
          tl.fromTo(
            layer,
            { y: 0, scale: 1 },
            { y: () => rate * T(), scale: endScale, force3D: true },
            0,
          );
        });
      }

      const setY = gsap.quickSetter(outer, "y", "px") as (v: number) => void;
      const drift = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setY(-0.1 * self.scroll()),
      });
      setY(-0.1 * drift.scroll());

      return () => {
        coveredST?.kill();
        drift.kill();
        setCovered(false);
        gsap.set(outer, { y: 0 });
      };
    },
    { scope: sectionRef, dependencies: [coverSelector] },
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn("sticky top-0 z-[1] h-[100svh] min-h-[640px] overflow-hidden bg-canvas", className)}
      {...aria}
    >
      <div ref={outerRef} className="absolute inset-0">
        <div ref={innerRef} className="absolute inset-0 origin-center">
          <div
            ref={clipRef}
            className={cn(
              "relative flex h-full w-full flex-col justify-end overflow-hidden px-[var(--gutter)] pb-[50px]",
              contentClassName,
            )}
            style={{ clipPath: "inset(0px 0px 0px 0px round 0px)" }}
          >
            {children}
          </div>
          <div ref={dimRef} aria-hidden className="pointer-events-none absolute inset-0 bg-canvas opacity-0" />
        </div>
      </div>
    </section>
  );
}
