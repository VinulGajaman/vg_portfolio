"use client";

/**
 * <EnterSlide>: the splash's "slide to enter" gesture (enter idea 1).
 * A slim glass track (260 × 60) with an orange knob. Drag the knob to the end (≥ 88%) to enter;
 * release earlier and it springs back. The orange fill follows the knob, the shimmering label
 * fades as you slide, and the knob nudges right every few seconds while idle to invite the
 * gesture. Keyboard: the knob is a button, Enter / Space / → completes it.
 * The pointer up at the end of the drag is the user gesture that lets the music start.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const TRACK = 260;
const KNOB = 48;
const PAD = 6;
const MAX = TRACK - KNOB - PAD * 2;

export function EnterSlide({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const knobRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  });

  useEffect(() => {
    const knob = knobRef.current;
    const fill = fillRef.current;
    const label = labelRef.current;
    if (!knob || !fill || !label) return;
    const pos = { x: 0 };
    let done = false;
    let drag: { start: number; from: number } | null = null;

    const render = () => {
      knob.style.transform = `translateX(${pos.x}px)`;
      fill.style.transform = `scaleX(${(pos.x + KNOB + PAD) / TRACK})`;
      label.style.opacity = String(Math.max(0, 1 - (pos.x / MAX) * 1.6));
    };
    render();

    const finish = () => {
      if (done) return;
      done = true;
      nudge.kill();
      gsap.to(pos, {
        x: MAX,
        duration: 0.35,
        ease: "power3.out",
        onUpdate: render,
        onComplete: () => doneRef.current(),
      });
    };

    // idle invitation: a small nudge to the right every few seconds
    const nudge = gsap
      .timeline({ repeat: -1, repeatDelay: 2.2, delay: 1.2 })
      .to(pos, { x: 22, duration: 0.45, ease: "power2.out", onUpdate: render })
      .to(pos, { x: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", onUpdate: render });

    const onDown = (e: PointerEvent) => {
      if (done) return;
      e.stopPropagation();
      nudge.pause();
      gsap.killTweensOf(pos);
      knob.setPointerCapture(e.pointerId);
      drag = { start: e.clientX, from: pos.x };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || done) return;
      pos.x = Math.max(0, Math.min(MAX, drag.from + e.clientX - drag.start));
      render();
    };
    const onUp = () => {
      if (!drag || done) return;
      drag = null;
      if (pos.x >= MAX * 0.88) finish();
      else {
        gsap.to(pos, { x: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", onUpdate: render });
        nudge.restart(true);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        finish();
      }
    };
    knob.addEventListener("pointerdown", onDown);
    knob.addEventListener("pointermove", onMove);
    knob.addEventListener("pointerup", onUp);
    knob.addEventListener("pointercancel", onUp);
    knob.addEventListener("keydown", onKey);
    return () => {
      nudge.kill();
      gsap.killTweensOf(pos);
      knob.removeEventListener("pointerdown", onDown);
      knob.removeEventListener("pointermove", onMove);
      knob.removeEventListener("pointerup", onUp);
      knob.removeEventListener("pointercancel", onUp);
      knob.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative h-[60px] select-none overflow-hidden rounded-full border border-white/15 bg-white/[.03] backdrop-blur-md",
        className,
      )}
      style={{ width: TRACK }}
    >
      {/* orange fill that follows the knob */}
      <span
        ref={fillRef}
        aria-hidden
        className="absolute inset-0 origin-left rounded-full"
        style={{ background: "linear-gradient(90deg, rgba(246,88,2,.05), rgba(246,88,2,.45))" }}
      />
      {/* shimmering label */}
      <span
        ref={labelRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center pl-10 font-display text-[13px] font-semibold uppercase tracking-[0.22em] text-transparent motion-safe:animate-[shimmer-text_2.6s_linear_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,.35) 40%, #fff 50%, rgba(255,255,255,.35) 60%, rgba(255,255,255,.35) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
      >
        Slide to enter
      </span>
      {/* knob */}
      <button
        ref={knobRef}
        type="button"
        aria-label="Slide to enter the site"
        className="absolute left-[6px] top-[6px] grid size-12 cursor-grab touch-none place-items-center rounded-full bg-accent text-accent-ink shadow-[0_0_24px_rgba(246,88,2,.55)] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
