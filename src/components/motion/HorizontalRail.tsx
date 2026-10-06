"use client";

/**
 * <HorizontalRail>: pinned horizontal rail (DESIGN.md §3.8, U10).
 * Section height = 100svh + travel + dwell, travel = track.scrollWidth − viewport + 2 × gutter,
 * dwell = 0.15 × travel. The stage is sticky (top 0, 100svh): header on top, rail below.
 * gsap.to(track, {x: −travel, ease: "none"}) scrubbed (0.7) from "top top" over `travel`, then
 * the stage holds for the dwell (the tween is the first 1/1.15 ≈ 0.87 of the section).
 * Track skewX = clamp(v/400, −4, 4)° smoothed 0.5s. 2px progress track with an orange fill.
 * <RailPanel> reveals each panel (y 40 → 0, opacity .3 → 1, springHero) at "left 75%" via
 * containerAnimation; useRail() exposes the rail tween for <Counter containerAnimation>.
 * Phone: no pin, a one-column stack. Reduced motion: a vertical grid. `portvio` profile: no skew.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, onceInView, ScrollTrigger, useMotion } from "@/lib/gsap";
import { getScrollVelocity } from "@/lib/scroll";
import { isPlus, SCRUB, SPRING_SAMPLES } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

type RailContextValue = {
  /** The horizontal tween (null on phone / reduced motion, or before it is built). */
  tween: gsap.core.Tween | null;
  /** |scroll velocity| in px/s while the rail moves; 0 otherwise. */
  getVelocity: () => number;
};

const RailContext = createContext<RailContextValue>({ tween: null, getVelocity: () => 0 });

export function useRail() {
  return useContext(RailContext);
}

export type HorizontalRailProps = {
  children: ReactNode;
  /** Header rendered at the top of the stage (padding 100/20). */
  header?: ReactNode;
  gap?: number;
  /** Dwell as a fraction of travel. */
  dwell?: number;
  progress?: boolean;
  className?: string;
  stageClassName?: string;
  trackClassName?: string;
  /** Rendered behind the stage content (e.g. <AmbientGlow>). */
  background?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
};

export function HorizontalRail({
  children,
  header,
  gap = 20,
  dwell = 0.15,
  progress = true,
  className,
  stageClassName,
  trackClassName,
  background,
  id,
  ...aria
}: HorizontalRailProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const [tween, setTween] = useState<gsap.core.Tween | null>(null);

  const getVelocity = useCallback(
    () => (activeRef.current ? Math.abs(getScrollVelocity()) : 0),
    [],
  );

  useMotion(
    ({ reduce, isPhone }) => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || reduce || isPhone) {
        setTween(null);
        return;
      }
      const gutter = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 20;
      const travel = () =>
        Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 2 * gutter());
      const size = () => {
        section.style.height = `${window.innerHeight + travel() * (1 + dwell)}px`;
      };
      size();
      ScrollTrigger.addEventListener("refreshInit", size);

      const fillTo = fillRef.current
        ? (gsap.quickSetter(fillRef.current, "scaleX") as (v: number) => void)
        : null;
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
      const clampSkew = gsap.utils.clamp(-4, 4);

      const t = gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${travel()}`,
          scrub: SCRUB,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            activeRef.current = self.isActive;
            track.style.willChange = self.isActive ? "transform" : "";
            if (!self.isActive) skewTo(0);
          },
          onUpdate: (self) => {
            fillTo?.(self.progress);
            if (isPlus) skewTo(clampSkew(getScrollVelocity() / 400));
          },
        },
      });
      setTween(t);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", size);
        section.style.height = "";
        activeRef.current = false;
        setTween(null);
      };
    },
    { scope: sectionRef, dependencies: [dwell] },
  );

  return (
    <RailContext.Provider value={{ tween, getVelocity }}>
      <section ref={sectionRef} id={id} className={cn("section-layer", className)} {...aria}>
        <div
          className={cn(
            "relative flex flex-col md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-[100svh] md:motion-safe:overflow-hidden",
            stageClassName,
          )}
        >
          {background}
          {header && (
            <div className="container-site relative z-[1] pt-[60px] md:pt-[80px] lg:pt-[100px]">{header}</div>
          )}
          <div className="relative z-[1] px-[var(--gutter)] md:motion-safe:flex md:motion-safe:flex-1 md:motion-safe:items-center">
            <div
              ref={trackRef}
              className={cn(
                "flex flex-col gap-4",
                "md:motion-safe:w-max md:motion-safe:flex-row md:motion-safe:gap-[var(--rail-gap)]",
                "md:motion-reduce:grid md:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3",
                trackClassName,
              )}
              style={{ ["--rail-gap" as string]: `${gap}px` }}
            >
              {children}
            </div>
          </div>
          {progress && (
            <div className="relative z-[1] mx-[var(--gutter)] mb-[40px] mt-[30px] hidden h-[2px] overflow-hidden bg-line md:motion-safe:block">
              <div ref={fillRef} className="h-full w-full origin-left scale-x-0 bg-accent" />
            </div>
          )}
        </div>
      </section>
    </RailContext.Provider>
  );
}

/** A rail panel that reveals as it enters the viewport horizontally (y 40 → 0, opacity .3 → 1). */
export function RailPanel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tween } = useRail();
  useMotion(
    ({ reduce, isPhone }) => {
      const el = ref.current;
      if (!el || reduce) return;
      const anim = gsap.fromTo(
        el,
        { y: 40, opacity: 0.3 },
        {
          y: 0,
          opacity: 1,
          duration: SPRING_SAMPLES.springHero.duration,
          ease: "springHero",
          paused: true,
        },
      );
      if (tween && !isPhone) {
        onceInView(el, () => anim.play(), {
          start: "left 75%",
          containerAnimation: tween,
          settle: () => anim.progress(1),
        });
      } else {
        onceInView(el, () => anim.play(), { settle: () => anim.progress(1) });
      }
    },
    { scope: ref, dependencies: [tween] },
  );
  return (
    <div ref={ref} className={cn("shrink-0", className)}>
      {children}
    </div>
  );
}
