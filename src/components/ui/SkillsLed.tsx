"use client";

/**
 * <SkillsLed>: the CV's skills on a dot-matrix LED sign (canvas 2D).
 * The active group's line "01 LANGUAGES ✦ JAVA ✦ TYPESCRIPT ✦ …" is rasterised offscreen at the
 * sign's row count (Clash Display; the group label drawn in one channel, the skills in another),
 * then drawn as a grid of round LEDs that scrolls right-to-left: label LEDs glow orange, skill
 * LEDs white, unlit LEDs stay as faint dots so the panel always reads as hardware.
 *   - When the line has fully crossed the sign, the next group starts (autoplay); a pill click
 *     jumps immediately. The line pauses while the mouse is over the sign.
 *   - Mouse: LEDs within ~70px of the cursor brighten (lit ones bloom, unlit ones glow faintly).
 *   - The loop only runs while on screen; the grid re-fits on resize.
 * Reduced motion: no canvas; the group name and its skills render as static text.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const ROWS = 20;
const SPEED = 120; // px per second
const pad = (n: number) => String(n).padStart(2, "0");

export function SkillsLed({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const loadRef = useRef<(i: number) => void>(() => {});
  const n = skillGroups.length;
  const group = skillGroups[active];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let pitch = 10;
    let cols = 0;
    let raf = 0;
    let visible = false;
    let hover = false;
    let family = "sans-serif";
    const mouse = { x: -999, y: -999 };
    // strip: 0 off, 1 skill (white), 2 label (orange); stored column-major
    let strip = new Uint8Array(0);
    let stripCols = 0;
    let offset = 0;
    let current = 0;
    let last = performance.now();

    let first = true;
    const build = (i: number, keepOffset = false) => {
      const g = skillGroups[i];
      const label = `${pad(i + 1)} ${g.label.toUpperCase()}`;
      const rest = `  ✦  ${g.items.map((s) => s.toUpperCase()).join("  ✦  ")}  ✦`;
      const o = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const size = ROWS * 0.92;
      o.font = `700 ${size}px ${family}`;
      const wl = Math.ceil(o.measureText(label).width);
      const wr = Math.ceil(o.measureText(rest).width);
      const w = wl + wr + 4;
      o.canvas.width = w;
      o.canvas.height = ROWS;
      o.font = `700 ${size}px ${family}`;
      o.textBaseline = "middle";
      o.fillStyle = "#f00";
      o.fillText(label, 0, ROWS / 2 + 1);
      o.fillStyle = "#0f0";
      o.fillText(rest, wl, ROWS / 2 + 1);
      const d = o.getImageData(0, 0, w, ROWS).data;
      strip = new Uint8Array(w * ROWS);
      for (let x = 0; x < w; x++)
        for (let y = 0; y < ROWS; y++) {
          const k = (y * w + x) * 4;
          if (d[k + 3] < 110) continue;
          strip[x * ROWS + y] = d[k] > d[k + 1] ? 2 : 1;
        }
      stripCols = w;
      current = i;
      // First line starts already on the sign; later lines enter from the right edge.
      if (!keepOffset) offset = first ? -Math.round(cols * 0.08) : -cols;
      first = false;
    };
    loadRef.current = (i: number) => {
      if (cols) build(i);
    };

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pitch = H / (ROWS + 2);
      cols = Math.ceil(W / pitch);
      build(current, stripCols > 0); // re-fit without restarting the line
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!visible || !cols) return;
      if (!hover) offset += (SPEED * dt) / pitch;
      if (offset > stripCols) {
        const next = (current + 1) % n;
        build(next);
        setActive(next);
      }
      ctx.clearRect(0, 0, W, H);
      const r = pitch * 0.36;
      const top = pitch;
      const base = Math.floor(offset);
      for (let c = 0; c < cols; c++) {
        const sc = base + c;
        const x = c * pitch + pitch / 2 - (offset - base) * pitch;
        for (let y = 0; y < ROWS; y++) {
          const v = sc >= 0 && sc < stripCols ? strip[sc * ROWS + y] : 0;
          const cy = top + y * pitch + pitch / 2;
          const dx = x - mouse.x;
          const dy = cy - mouse.y;
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 70);
          if (v === 0) ctx.fillStyle = `rgba(255,255,255,${0.05 + near * 0.12})`;
          else if (v === 2) ctx.fillStyle = `rgba(246,${88 + near * 70},${2 + near * 40},1)`;
          else ctx.fillStyle = `rgba(255,255,255,${0.82 + near * 0.18})`;
          ctx.beginPath();
          ctx.arc(x, cy, v ? r * (1 + near * 0.25) : r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      hover = true;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
      hover = false;
    };
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
  }, [reduce, n]);

  const pick = (i: number) => {
    setActive(i);
    loadRef.current(i);
  };

  return (
    <div className={cn("border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0b0a0a]", className)}>
      <span ref={fontRef} aria-hidden className="pointer-events-none absolute font-display opacity-0">
        A
      </span>

      {/* Sign housing */}
      <div className="relative m-3 overflow-hidden rounded-xl border border-line bg-[#070606] md:m-5">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,.04), transparent 40%), radial-gradient(60% 80% at 50% 50%, rgba(246,88,2,.06), transparent)" }}
        />
        {reduce ? (
          <div className="grid h-[200px] place-items-center px-6 text-center md:h-[280px]">
            <p className="font-display text-[32px] font-bold uppercase text-accent md:text-[56px]">{group.label}</p>
          </div>
        ) : (
          <canvas ref={canvasRef} aria-hidden className="block h-[180px] w-full md:h-[260px] lg:h-[300px]" />
        )}
      </div>

      <div className="relative px-5 pb-6 pt-2 md:px-8 md:pb-8">
        <div role="tablist" aria-label="Skill groups" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap">
          {skillGroups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => pick(i)}
              className={cn(
                "type-small shrink-0 rounded-pill border px-3.5 py-1.5 transition-colors duration-300",
                i === active ? "border-accent text-ink" : "border-line text-ink-faint pointer-fine:hover:text-ink-soft",
              )}
            >
              <span className={cn("tabular", i === active && "text-accent")}>{pad(i + 1)}</span> {g.label}
            </button>
          ))}
        </div>
        <ul className="mt-5 flex flex-wrap gap-2">
          {group.items.map((item) => (
            <li
              key={item}
              className="whitespace-nowrap rounded-pill border border-line px-4 py-2 font-display text-[14px] font-semibold uppercase text-ink md:text-[16px]"
            >
              {item}
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
