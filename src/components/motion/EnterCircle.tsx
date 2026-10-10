"use client";

/**
 * <EnterCircle>: the splash's "draw a circle to enter" gesture (enter idea 2).
 * A 160px orbit ring with a glowing dot circling it as a hint. Press and drag around the centre:
 * the accumulated angle fills an orange arc (either direction), the VG mark in the middle turns
 * with the stroke, and one full loop (≥ 330°) enters. Releasing early rewinds the arc smoothly.
 * Keyboard: the ring is a button, Enter / Space completes it.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const SIZE = 160;
const R = 64;
const C = 2 * Math.PI * R;
const GOAL = 330; // degrees

export function EnterCircle({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  });

  useEffect(() => {
    const root = rootRef.current;
    const arc = arcRef.current;
    const mark = markRef.current;
    const hint = hintRef.current;
    const label = labelRef.current;
    if (!root || !arc || !mark || !hint || !label) return;
    const st = { deg: 0, spin: 0 };
    let done = false;
    let drawing = false;
    let lastAngle = 0;

    const render = () => {
      const p = Math.min(1, Math.abs(st.deg) / 360);
      arc.style.strokeDashoffset = String(C * (1 - p));
      // draw in the direction the user goes
      arc.style.transform = `rotate(-90deg) scaleY(${st.deg < 0 ? -1 : 1})`;
      mark.style.transform = `rotate(${st.spin}deg)`;
      label.style.opacity = String(1 - p * 0.8);
    };
    render();

    // idle hint: a glowing dot orbiting the ring
    const orbit = gsap.to(hint, { rotation: 360, svgOrigin: `${SIZE / 2} ${SIZE / 2}`, duration: 3.2, ease: "none", repeat: -1 });

    const finish = () => {
      if (done) return;
      done = true;
      drawing = false;
      orbit.kill();
      gsap.to(hint, { autoAlpha: 0, duration: 0.2 });
      gsap.to(st, { deg: st.deg < 0 ? -360 : 360, spin: st.spin + 90, duration: 0.3, ease: "power3.out", onUpdate: render });
      gsap.fromTo(root, { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", onComplete: () => doneRef.current() });
    };

    const angleOf = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    };
    const onDown = (e: PointerEvent) => {
      if (done) return;
      e.stopPropagation();
      gsap.killTweensOf(st);
      root.setPointerCapture(e.pointerId);
      drawing = true;
      lastAngle = angleOf(e);
      gsap.to(hint, { autoAlpha: 0, duration: 0.25 });
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing || done) return;
      const a = angleOf(e);
      let d = a - lastAngle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      lastAngle = a;
      st.deg += d;
      st.spin += d * 0.5;
      render();
      if (Math.abs(st.deg) >= GOAL) finish();
    };
    const onUp = () => {
      if (!drawing || done) return;
      drawing = false;
      gsap.to(st, { deg: 0, duration: 0.8, ease: "power3.inOut", onUpdate: render });
      gsap.to(hint, { autoAlpha: 1, duration: 0.4, delay: 0.6 });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("keydown", onKey);
    return () => {
      orbit.kill();
      gsap.killTweensOf([st, hint, root]);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <button
        ref={rootRef}
        type="button"
        aria-label="Draw a circle to enter the site"
        className="relative grid cursor-grab touch-none select-none place-items-center rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white/60"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
          {/* track */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" strokeDasharray="2 6" />
          {/* progress arc */}
          <circle
            ref={arcRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#F65802"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C}
            style={{ transformOrigin: "50% 50%", filter: "drop-shadow(0 0 6px rgba(246,88,2,.8))" }}
          />
          {/* idle hint: orbiting dot */}
          <g ref={hintRef}>
            <circle cx={SIZE / 2} cy={SIZE / 2 - R} r="4" fill="#F65802" style={{ filter: "drop-shadow(0 0 8px rgba(246,88,2,.9))" }} />
          </g>
        </svg>
        <span ref={markRef} className="block will-change-transform">
          <LogoMark size={44} />
        </span>
      </button>
      <span
        ref={labelRef}
        aria-hidden
        className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-white/55"
      >
        Draw a circle to enter
      </span>
    </div>
  );
}
