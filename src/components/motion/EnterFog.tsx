"use client";

/**
 * <EnterFog>: the splash's "wipe the fog" gesture (enter idea 4).
 * A small glass pane (360 × 220, smaller on phones) misted over like cold glass. Behind it, a crisp
 * glowing VG mark. Wiping with the mouse or a finger clears the condensation in soft streaks
 * (a feathered brush drawn along the stroke with `destination-out`); the fog slowly creeps back
 * when you pause. Once ~55% of the pane is clear, the rest of the mist evaporates, the mark
 * glows and the site enters. A ghost "wipe" stroke hints at the gesture until the first touch.
 * Keyboard: the pane is a button, Enter / Space clears it.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const GOAL = 0.55;

/** Paint a fresh layer of condensation onto the canvas. */
function paintFog(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = alpha;
  // base mist: warm grey, a little denser at the edges like breath on glass
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.7);
  g.addColorStop(0, "rgba(200,188,182,.42)");
  g.addColorStop(1, "rgba(215,205,200,.6)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // droplet texture: many tiny soft dots
  for (let i = 0; i < (w * h) / 90; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.6 + 0.3;
    ctx.fillStyle = `rgba(255,250,245,${Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function EnterFog({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const paneRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  });

  useEffect(() => {
    const pane = paneRef.current;
    const canvas = canvasRef.current;
    const hint = hintRef.current;
    const mark = markRef.current;
    if (!pane || !canvas || !hint || !mark) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = pane.clientWidth;
    const H = pane.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);
    paintFog(ctx, W, H);

    let done = false;
    let wiping = false;
    let last: { x: number; y: number } | null = null;
    let lastWipe = 0;
    const BRUSH = Math.max(26, W * 0.085);

    // ghost hint: a soft stroke sweeping across the glass
    const ghost = gsap
      .timeline({ repeat: -1, repeatDelay: 0.8, delay: 0.6 })
      .fromTo(hint, { x: -W * 0.3, autoAlpha: 0 }, { x: -W * 0.3, autoAlpha: 1, duration: 0.25 })
      .to(hint, { x: W * 0.3, duration: 1.1, ease: "power2.inOut" })
      .to(hint, { autoAlpha: 0, duration: 0.3 });

    const wipeTo = (x: number, y: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const from = last ?? { x, y };
      const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (BRUSH * 0.25)));
      for (let i = 1; i <= steps; i++) {
        const px = from.x + ((x - from.x) * i) / steps;
        const py = from.y + ((y - from.y) * i) / steps;
        const g = ctx.createRadialGradient(px, py, 0, px, py, BRUSH);
        g.addColorStop(0, "rgba(0,0,0,.9)");
        g.addColorStop(0.55, "rgba(0,0,0,.55)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, BRUSH, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      last = { x, y };
      lastWipe = performance.now();
    };

    const cleared = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0;
      let n = 0;
      for (let i = 3; i < data.length; i += 4 * 23) {
        n++;
        if (data[i] < 70) clear++;
      }
      return clear / n;
    };

    const finish = () => {
      if (done) return;
      done = true;
      ghost.kill();
      gsap.to(hint, { autoAlpha: 0, duration: 0.2 });
      gsap.to(canvas, { autoAlpha: 0, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(mark, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out", onComplete: () => doneRef.current() });
    };

    // condensation creeps back slowly while idle
    let raf = 0;
    const regrow = () => {
      raf = requestAnimationFrame(regrow);
      if (done || wiping || performance.now() - lastWipe < 900) return;
      paintFog(ctx, W, H, 0.012);
    };
    raf = requestAnimationFrame(regrow);

    const local = (e: PointerEvent) => {
      const r = pane.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    let checkAt = 0;
    const onDown = (e: PointerEvent) => {
      if (done) return;
      e.stopPropagation();
      pane.setPointerCapture(e.pointerId);
      wiping = true;
      ghost.pause();
      gsap.to(hint, { autoAlpha: 0, duration: 0.2 });
      last = null;
      const p = local(e);
      wipeTo(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      if (done) return;
      // wiping needs a press: the press is the gesture browsers require before allowing sound
      if (!wiping) return;
      const p = local(e);
      wipeTo(p.x, p.y);
      const now = performance.now();
      if (now - checkAt > 140) {
        checkAt = now;
        if (cleared() >= GOAL) finish();
      }
    };
    const onUp = () => {
      wiping = false;
      last = null;
      if (!done && cleared() >= GOAL) finish();
    };
    const onLeave = () => {
      last = null;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    pane.addEventListener("pointerdown", onDown);
    pane.addEventListener("pointermove", onMove);
    pane.addEventListener("pointerup", onUp);
    pane.addEventListener("pointercancel", onUp);
    pane.addEventListener("pointerleave", onLeave);
    pane.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      ghost.kill();
      gsap.killTweensOf([hint, canvas, mark]);
      pane.removeEventListener("pointerdown", onDown);
      pane.removeEventListener("pointermove", onMove);
      pane.removeEventListener("pointerup", onUp);
      pane.removeEventListener("pointercancel", onUp);
      pane.removeEventListener("pointerleave", onLeave);
      pane.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <button
        ref={paneRef}
        type="button"
        aria-label="Wipe the fogged glass to enter the site"
        className="relative h-[180px] w-[290px] cursor-crosshair touch-none select-none overflow-hidden rounded-[28px] border border-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:h-[220px] md:w-[360px]"
      >
        {/* what's behind the glass */}
        <span aria-hidden className="absolute inset-0 grid place-items-center bg-[#100d0c]">
          <span className="absolute inset-0" style={{ background: "radial-gradient(45% 60% at 50% 50%, rgba(246,88,2,.45), transparent 75%)" }} />
          <span ref={markRef} className="relative block">
            <LogoMark size={64} />
          </span>
        </span>
        {/* condensation */}
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
        {/* glass highlight */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        {/* ghost wipe hint */}
        <span ref={hintRef} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -ml-6 -mt-6 grid size-12 place-items-center opacity-0">
          <span className="size-9 rounded-full bg-white/50 blur-[6px]" />
        </span>
      </button>
      <span aria-hidden className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-white/55">
        Wipe the glass to enter
      </span>
    </div>
  );
}
