"use client";

/**
 * <EnterHold>: the splash's "hold to enter" gesture (enter idea 3).
 * The VG orb (96px) inside a ring. Press and hold: the orb presses in, an orange ring charges
 * around it over HOLD_S, eight sparks around it are drawn into the centre and the glow builds.
 * Release early and the charge drains; fully charged it releases with a shockwave pulse and
 * enters. Keyboard: hold Enter / Space (or a quick press completes it).
 * Touch: browsers count the finger lifting as the sound-unlocking gesture, so if the hold
 * completes while the finger is still down the music starts on release (SoundToggle's unlock).
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const HOLD_S = 1.1;
const SIZE = 150;
const R = 62;
const C = 2 * Math.PI * R;
const SPARKS = 8;

export function EnterHold({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const arc = root.querySelector<SVGCircleElement>("[data-arc]")!;
    const orb = root.querySelector<HTMLElement>("[data-orb]")!;
    const glow = root.querySelector<HTMLElement>("[data-glow]")!;
    const wave = root.querySelector<HTMLElement>("[data-wave]")!;
    const sparks = Array.from(root.querySelectorAll<HTMLElement>("[data-spark]"));
    const label = root.parentElement?.querySelector<HTMLElement>("[data-label]");
    const st = { p: 0 };
    let done = false;

    const render = () => {
      const p = st.p;
      arc.style.strokeDashoffset = String(C * (1 - p));
      orb.style.transform = `scale(${1 - 0.08 * Math.sin(Math.min(1, p) * Math.PI * 0.5)})`;
      glow.style.opacity = String(0.25 + p * 0.75);
      glow.style.transform = `scale(${1 + p * 0.35})`;
      sparks.forEach((s, i) => {
        const a = (i / SPARKS) * Math.PI * 2;
        const d = (R + 18) * (1 - p * 0.85);
        s.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`;
        s.style.opacity = String(0.35 + p * 0.65);
      });
      if (label) label.style.opacity = String(1 - p * 0.7);
    };
    render();

    // idle: the sparks breathe slowly so it feels alive
    const idle = gsap.to(sparks, { scale: 1.6, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.12 });

    let charge: gsap.core.Tween | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      charge?.kill();
      idle.kill();
      st.p = 1;
      render();
      gsap.set(wave, { scale: 1, autoAlpha: 0.9 });
      gsap.to(wave, { scale: 2.4, autoAlpha: 0, duration: 0.7, ease: "power2.out" });
      gsap.to(orb, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", onComplete: () => doneRef.current() });
    };
    const start = () => {
      if (done) return;
      charge?.kill();
      charge = gsap.to(st, { p: 1, duration: HOLD_S * (1 - st.p), ease: "none", onUpdate: render, onComplete: finish });
    };
    const stop = () => {
      if (done) return;
      charge?.kill();
      charge = gsap.to(st, { p: 0, duration: 0.5, ease: "power2.out", onUpdate: render });
    };

    const onDown = (e: PointerEvent) => {
      e.stopPropagation();
      root.setPointerCapture(e.pointerId);
      start();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) start();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") finish(); // keyboard users shouldn't need to hold
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", stop);
    root.addEventListener("pointercancel", stop);
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("keyup", onKeyUp);
    return () => {
      charge?.kill();
      idle.kill();
      gsap.killTweensOf([st, wave, orb]);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", stop);
      root.removeEventListener("pointercancel", stop);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <button
        ref={rootRef}
        type="button"
        aria-label="Press and hold to enter the site"
        className="relative grid cursor-pointer touch-none select-none place-items-center rounded-full outline-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-white/60"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* glow */}
        <span
          data-glow=""
          aria-hidden
          className="absolute inset-[18%] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.55), transparent)" }}
        />
        {/* shockwave */}
        <span data-wave="" aria-hidden className="invisible absolute inset-[22%] rounded-full border-2 border-accent opacity-0" />
        {/* ring */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full -rotate-90 overflow-visible" aria-hidden>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
          <circle
            data-arc=""
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#F65802"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C}
            style={{ filter: "drop-shadow(0 0 6px rgba(246,88,2,.8))" }}
          />
        </svg>
        {/* sparks */}
        {Array.from({ length: SPARKS }, (_, i) => (
          <span key={i} data-spark="" aria-hidden className="absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] size-1 rounded-full bg-accent shadow-[0_0_8px_rgba(246,88,2,.9)]" />
        ))}
        {/* orb */}
        <span data-orb="" className="relative block will-change-transform">
          <LogoMark size={52} />
        </span>
      </button>
      <span data-label="" aria-hidden className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-white/55">
        Hold to enter
      </span>
    </div>
  );
}
