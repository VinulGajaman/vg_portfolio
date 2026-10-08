"use client";

/**
 * <SkillsRadar>: the CV's skills on an airport-style radar scope (canvas 2D), a nod to the AASL
 * airport access-control work. The scope is split into seven sectors, one per group; every skill
 * is a blip placed inside its group's sector (deterministic radius / angle jitter).
 *   - A sweep beam (orange wedge with a fading trail) turns once every SWEEP_S. When it passes a
 *     blip, the blip flashes and its label appears, then both decay until the next pass.
 *   - Legend (right on desktop, below on phone): groups with counts. Hovering a group (or a
 *     sector on the scope) lights that sector, keeps its labels on and dims the rest.
 *   - Range rings, crosshair, sector ticks and a slow scan-line shimmer give the CRT feel.
 *   - Only animates while on screen. Reduced motion: no sweep; all blips and labels shown.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const SWEEP_S = 6;
const N = skillGroups.length;
const SECTOR = (Math.PI * 2) / N;
const pad = (n: number) => String(n).padStart(2, "0");

/** Seeded pseudo-random so blip positions are stable between renders. */
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const BLIPS = skillGroups.flatMap((g, gi) =>
  g.items.map((label, j) => {
    const m = g.items.length;
    const a = -Math.PI / 2 + gi * SECTOR + SECTOR * (0.18 + (0.64 * (j + 0.5)) / m) + (rand(gi * 31 + j) - 0.5) * 0.08;
    const r = 0.3 + 0.62 * ((j % 3) / 2.2 + rand(gi * 7 + j * 3) * 0.25);
    return { label, group: gi, a, r: Math.min(0.92, r) };
  }),
);

export function SkillsRadar({ className }: { className?: string }) {
  const [focus, setFocus] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const focusRef = useRef<number | null>(null);

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let S = 0;
    let raf = 0;
    let visible = false;
    let family = "sans-serif";
    let beam = -Math.PI / 2;
    let last = performance.now();
    const glow: number[] = BLIPS.map(() => (reduce ? 1 : 0));

    const resize = () => {
      S = Math.round(canvas.clientWidth);
      canvas.width = S * dpr;
      canvas.height = S * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const c = S / 2;
      const R = c * 0.94;
      const f = focusRef.current;
      ctx.clearRect(0, 0, S, S);

      // scope background
      const bg = ctx.createRadialGradient(c, c, 0, c, c, R);
      bg.addColorStop(0, "rgba(246,88,2,.07)");
      bg.addColorStop(1, "rgba(246,88,2,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();

      // focused sector
      if (f !== null) {
        const a0 = -Math.PI / 2 + f * SECTOR;
        ctx.fillStyle = "rgba(246,88,2,.10)";
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, a0, a0 + SECTOR);
        ctx.closePath();
        ctx.fill();
      }

      // rings, spokes, crosshair
      ctx.strokeStyle = "rgba(255,255,255,.08)";
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(c, c, (R * k) / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let k = 0; k < N; k++) {
        const a = -Math.PI / 2 + k * SECTOR;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.stroke();

      // sector names on the rim
      ctx.font = `600 ${Math.max(9, S * 0.018)}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      skillGroups.forEach((g, k) => {
        const a = -Math.PI / 2 + (k + 0.5) * SECTOR;
        ctx.fillStyle = f === k ? "#F65802" : "rgba(255,255,255,.35)";
        ctx.fillText(`${pad(k + 1)} ${g.label.toUpperCase()}`, c + Math.cos(a) * R * 1.0, c + Math.sin(a) * R * 1.0 - 0);
      });

      // sweep
      if (!reduce) {
        beam += ((Math.PI * 2) / SWEEP_S) * dt;
        const trail = 1.1;
        const steps = 24;
        for (let s = 0; s < steps; s++) {
          const a1 = beam - (trail * s) / steps;
          const a2 = beam - (trail * (s + 1)) / steps;
          ctx.fillStyle = `rgba(246,88,2,${0.22 * (1 - s / steps) ** 2})`;
          ctx.beginPath();
          ctx.moveTo(c, c);
          ctx.arc(c, c, R, a2, a1);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(246,88,2,.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.lineTo(c + Math.cos(beam) * R, c + Math.sin(beam) * R);
        ctx.stroke();
      }

      // blips
      const fs = Math.max(10, S * 0.021);
      BLIPS.forEach((b, i) => {
        if (!reduce) {
          const diff = (((beam - b.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (diff < 0.06) glow[i] = 1;
          else glow[i] = Math.max(0, glow[i] - dt / (SWEEP_S * 0.8));
        }
        const lit = f === b.group ? 1 : f !== null ? glow[i] * 0.25 : glow[i];
        const x = c + Math.cos(b.a) * b.r * R;
        const y = c + Math.sin(b.a) * b.r * R;
        ctx.fillStyle = `rgba(246,88,2,${0.25 + lit * 0.75})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + lit * 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (lit > 0.85) {
          ctx.strokeStyle = `rgba(246,88,2,${(lit - 0.85) * 4})`;
          ctx.beginPath();
          ctx.arc(x, y, 6 + (1 - lit) * 60, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (lit > 0.05) {
          ctx.font = `600 ${fs}px ${family}`;
          ctx.textAlign = Math.cos(b.a) >= 0 ? "left" : "right";
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, lit * 1.3)})`;
          ctx.fillText(b.label.toUpperCase(), x + (Math.cos(b.a) >= 0 ? 9 : -9), y);
        }
      });

      // centre
      ctx.fillStyle = "#F65802";
      ctx.beginPath();
      ctx.arc(c, c, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (visible && S) draw(now);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - r.left - S / 2;
      const dy = e.clientY - r.top - S / 2;
      if (Math.hypot(dx, dy) > S * 0.47) return setFocus(null);
      const a = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
      setFocus(Math.floor(a / SECTOR) % N);
    };
    const onLeave = () => setFocus(null);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      if (fontRef.current) family = getComputedStyle(fontRef.current).fontFamily;
      resize();
      ro.observe(canvas);
      raf = requestAnimationFrame(frame);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      className={cn(
        "border-overlay edge-light relative grid items-center gap-8 overflow-hidden rounded-2xl bg-[#0b0a0a] p-5 md:p-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14",
        className,
      )}
    >
      <span ref={fontRef} aria-hidden className="pointer-events-none absolute font-display opacity-0">
        A
      </span>
      {/* CRT scan lines */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)" }}
      />

      <canvas ref={canvasRef} aria-hidden className="relative mx-auto block aspect-square w-full max-w-[640px]" />

      <div className="relative">
        <p className="type-small flex items-center gap-2 text-ink-soft">
          <span className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
          Scanning stack · {BLIPS.length} contacts
        </p>
        <ul className="mt-5 flex flex-col">
          {skillGroups.map((g, i) => (
            <li
              key={g.label}
              onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(i)}
              onPointerLeave={() => setFocus(null)}
              onClick={() => setFocus((f) => (f === i ? null : i))}
              className={cn(
                "flex cursor-default items-baseline gap-4 border-b border-line py-3 transition-colors duration-300",
                focus === i ? "text-ink" : "text-ink-soft",
              )}
            >
              <span className={cn("type-small tabular", focus === i ? "text-accent" : "text-ink-faint")}>{pad(i + 1)}</span>
              <span className="flex-1 font-display text-[16px] font-semibold uppercase md:text-[19px]">{g.label}</span>
              <span className="type-small tabular text-ink-faint">{pad(g.items.length)}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="sr-only">
        {skillGroups.map((g) => (
          <li key={g.label}>
            {g.label}: {g.items.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
