"use client";

/**
 * <PinnedZoom>: portvio's showreel pinned zoom (DESIGN.md §3.10).
 * 400svh wrapper: a sticky 100svh stage + 300svh of scroll. One scrubbed timeline
 * ("top top" → "bottom bottom", scrub 0.7). Progress 0 → 0.85:
 *   frame scale .2 → 1, inner media scale 1.8 → 1 (net .36 → 1),
 *   left label x −83.33vw → 0, right label x +83.33vw → 0,
 *   frame clip-path inset(0 round 20px) → inset(0 round 12px);
 * 0.85 → 1 holds (dwell). Label chars play <RevealText chars> at progress 0.1 (again on every pass).
 * Video: brightness(.7) (a static 30% black layer), plays only while the stage is in view; the frame is a button that
 * toggles play/pause (cursor "play"). The stage and labels ignore the pointer.
 * Reduced motion: no pin, static full-size frame (radius 20), labels above and below, no
 * autoplay (poster + native controls). `portvio` profile: linear 0 → 1, no radius change.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { isPlus, SCRUB } from "@/lib/motion-tokens";
import { RevealText } from "./RevealText";
import { cn } from "@/lib/cn";

export type PinnedZoomProps = {
  /** Frame content, normally <MediaSlot id="showreel" fill autoPlay={false} />. */
  children: ReactNode;
  left: string;
  right: string;
  id?: string;
  headingId?: string;
  className?: string;
  /** Accessible names for the play toggle. */
  playLabel?: string;
  pauseLabel?: string;
};

export function PinnedZoom({
  children,
  left,
  right,
  id,
  headingId,
  className,
  playLabel = "Play showreel",
  pauseLabel = "Pause showreel",
}: PinnedZoomProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLButtonElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);
  const [charsOn, setCharsOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const reduce = useReducedMotion();

  const video = () => frameRef.current?.querySelector("video") ?? null;

  useMotion(
    ({ reduce: rm }) => {
      const wrap = wrapRef.current;
      const frame = frameRef.current;
      const clip = clipRef.current;
      const inner = innerRef.current;
      const l = leftRef.current;
      const r = rightRef.current;
      if (!wrap || !frame || !clip || !inner || !l || !r) return;
      if (rm) {
        const v = video();
        if (v) {
          v.controls = true;
          v.autoplay = false;
          v.pause();
        }
        return () => {
          if (v) v.controls = false;
        };
      }
      const end = isPlus ? 0.85 : 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Labels reveal at 0.1 and rewind when the section is scrolled back to its start,
            // so they play again on the next pass.
            if (self.progress >= 0.1) setCharsOn(true);
            else if (self.progress < 0.02) setCharsOn(false);
          },
          onToggle: (self) => {
            const wc = self.isActive ? "transform" : "";
            frame.style.willChange = wc;
            inner.style.willChange = wc;
          },
        },
      });
      tl.fromTo(frame, { scale: 0.2 }, { scale: 1, duration: end, force3D: true }, 0)
        .fromTo(inner, { scale: 1.8 }, { scale: 1, duration: end, force3D: true }, 0)
        .fromTo(l, { x: () => -0.8333 * window.innerWidth }, { x: 0, duration: end }, 0)
        .fromTo(r, { x: () => 0.8333 * window.innerWidth }, { x: 0, duration: end }, 0);
      if (isPlus) {
        tl.fromTo(
          clip,
          { clipPath: "inset(0% 0% 0% 0% round 20px)" },
          { clipPath: "inset(0% 0% 0% 0% round 12px)", duration: end },
          0,
        );
        tl.to({}, { duration: 1 - end });
      }
    },
    { scope: wrapRef },
  );

  // Play only while the stage is in view (and the visitor has not paused it).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      const v = video();
      if (!v) return;
      if (e.isIntersecting && !userPaused.current) {
        v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        v.pause();
        setPlaying(false);
      }
    });
    io.observe(stage);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => {
    const v = video();
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  };

  // Phone: smaller labels so "SHOWREEL" and "//2026©" meet without overlapping at 360–430px widths.
  const labelClass = "type-h2 whitespace-nowrap max-md:text-[22px]";

  return (
    <section id={id} aria-labelledby={headingId} className={cn("section-layer", className)}>
      <div ref={wrapRef} className="relative h-[400svh] motion-reduce:h-auto">
        <div
          ref={stageRef}
          className={cn(
            "pointer-events-none sticky top-0 h-[100svh] overflow-hidden",
            "motion-reduce:pointer-events-auto motion-reduce:static motion-reduce:flex motion-reduce:h-auto motion-reduce:flex-col motion-reduce:gap-6 motion-reduce:px-[var(--gutter)] motion-reduce:py-[60px]",
          )}
        >
          <h2
            id={headingId}
            className={cn(
              "absolute inset-0 z-[2] flex items-center justify-center gap-[clamp(40px,9.3vw,134px)] mix-blend-hard-light",
              "motion-reduce:static motion-reduce:contents",
            )}
          >
            <span ref={leftRef} className={cn(labelClass, "motion-reduce:order-1")}>
              <RevealText as="span" mode="chars" trigger="manual" play={charsOn} className="inline-block">
                {left}
              </RevealText>
            </span>
            <span ref={rightRef} className={cn(labelClass, "motion-reduce:order-3 motion-reduce:self-end")}>
              <RevealText as="span" mode="chars" trigger="manual" play={charsOn} className="inline-block">
                {right}
              </RevealText>
            </span>
          </h2>
          <button
            ref={frameRef}
            type="button"
            onClick={toggle}
            aria-label={playing ? pauseLabel : playLabel}
            data-cursor="play"
            data-cursor-label={playing ? "Pause" : "Play"}
            className={cn(
              "pointer-events-auto absolute inset-0 block origin-center",
              "motion-reduce:relative motion-reduce:order-2 motion-reduce:aspect-video motion-reduce:w-full",
            )}
          >
            <div
              ref={clipRef}
              className="absolute inset-0 overflow-hidden rounded-[20px]"
              style={{ clipPath: "inset(0% 0% 0% 0% round 20px)" }}
            >
              <div ref={innerRef} className="absolute inset-0">
                {children}
              </div>
              {/* brightness(.7) as a static 30% black layer: identical result, compositor only */}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/30" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
