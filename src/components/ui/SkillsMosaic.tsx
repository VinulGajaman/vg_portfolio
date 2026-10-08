"use client";

/**
 * <SkillsMosaic>: the CV's skills on a wall of 3D flip tiles (canvas 2D) — the split-flap board,
 * LED sign and particle word ideas combined.
 * The active group name is rasterised at grid resolution (stretched to fill the wall height, two
 * lines for long names); tiles inside the letters are lit orange, the rest are dark graphite.
 *   - Flip: each tile turns around its vertical axis (width = |cos πt|, 380ms) and shows its new
 *     face past the halfway point, with a darker edge-on shade, so it reads as a physical tile.
 *   - Change: a diagonal wave (from top-left) flips the wall from the old word to the new one.
 *   - Cursor: tiles within ~2.6 tiles flip to white, then flip back to their face 260ms later.
 *   - Autoplay every CYCLE_MS while on screen and not hovered; pills below jump directly; a click
 *     on the wall goes to the next group. Only draws while on screen.
 * Reduced motion: no flips; the group name renders as static text.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_MS = 4500;
const FLIP_MS = 380;
const pad = (n: number) => String(n).padStart(2, "0");

/** Face: 0 dark, 1 orange (letter), 2 white (cursor). */
type Tile = { from: number; to: number; start: number; base: number; back: number };

const FACE = ["#1c1b1b", "#F65802", "#FFFFFF"];
const FACE_EDGE = ["#121111", "#9c3801", "#9a9a9a"];

export function SkillsMosaic({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const showRef = useRef<(i: number) => void>(() => {});
  const activeRef = useRef(0);
  const n = skillGroups.length;
  const group = skillGroups[active];

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovered || reduce) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [active, inView, hovered, reduce, n]);

  useEffect(() => {
    activeRef.current = active;
    showRef.current(active);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let size = 20;
    let gap = 3;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let raf = 0;
    let visible = false;
    let family = "sans-serif";
    let tiles: Tile[] = [];
    const mouse = { c: -99, r: -99 };

    const mask = (i: number) => {
      const word = skillGroups[i].label.toUpperCase();
      const o = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      o.canvas.width = cols;
      o.canvas.height = rows;
      let lines = [word];
      const widthFit = (ls: string[]) => {
        o.font = `700 100px ${family}`;
        return (100 * cols * 0.9) / Math.max(...ls.map((l) => o.measureText(l).width));
      };
      let fs = widthFit(lines);
      if (word.includes(" ") && word.length > 10) {
        const parts = word.split(" ");
        const cut = Math.ceil(parts.length / 2);
        lines = [parts.slice(0, cut).join(" "), parts.slice(cut).join(" ")];
        fs = widthFit(lines);
      }
      const cap = fs * 0.72;
      const gapL = lines.length > 1 ? 0.25 : 0;
      const sy = (rows * (lines.length > 1 ? 0.8 : 0.62)) / (cap * lines.length * (1 + gapL));
      o.setTransform(1, 0, 0, sy, 0, 0);
      o.font = `700 ${fs}px ${family}`;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const step = cap * (1 + gapL);
      lines.forEach((l, k) => o.fillText(l, cols / 2, rows / 2 / sy + (k - (lines.length - 1) / 2) * step));
      const d = o.getImageData(0, 0, cols, rows).data;
      return Array.from({ length: cols * rows }, (_, k) => (d[k * 4 + 3] > 110 ? 1 : 0));
    };

    const show = (i: number, wave = true) => {
      if (!cols) return;
      const m = mask(i);
      const now = performance.now();
      tiles.forEach((t, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        t.base = m[k];
        // A tile held white by the cursor flips back to the new base on its own.
        if (t.to === 2 || t.to === m[k]) return;
        t.from = t.to;
        t.to = m[k];
        t.start = wave ? now + (c + r * 1.4) * 14 + Math.random() * 60 : now - FLIP_MS;
      });
    };
    showRef.current = (i: number) => show(i, true);

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = W < 600 ? 11 : 18;
      gap = W < 600 ? 2 : 3;
      const p = size + gap;
      cols = Math.floor((W - gap) / p);
      rows = Math.floor((H - gap) / p);
      ox = (W - cols * p + gap) / 2;
      oy = (H - rows * p + gap) / 2;
      tiles = Array.from({ length: cols * rows }, () => ({ from: 0, to: 0, start: 0, base: 0, back: 0 }));
      show(activeRef.current, true);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !cols) return;
      ctx.clearRect(0, 0, W, H);
      const p = size + gap;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const t = tiles[r * cols + c];
          // cursor ripple
          if (Math.hypot(c - mouse.c, r - mouse.r) < 2.6 && now >= t.start + FLIP_MS && t.to !== 2) {
            t.from = t.to;
            t.to = 2;
            t.start = now;
            t.back = now + FLIP_MS + 260;
          } else if (t.to === 2 && t.back && now >= t.back) {
            t.from = 2;
            t.to = t.base;
            t.start = now;
            t.back = 0;
          }
          const prog = Math.min(1, Math.max(0, (now - t.start) / FLIP_MS));
          const face = prog < 0.5 ? t.from : t.to;
          const w = Math.abs(Math.cos(Math.PI * prog));
          const x = ox + c * p;
          const y = oy + r * p;
          const tw = Math.max(0.5, size * w);
          ctx.fillStyle = w < 0.6 ? FACE_EDGE[face] : FACE[face];
          ctx.fillRect(x + (size - tw) / 2, y, tw, size);
          if (face === 1 && w > 0.6) {
            ctx.fillStyle = "rgba(255,255,255,.18)";
            ctx.fillRect(x + (size - tw) / 2, y, tw, Math.max(1, size * 0.18));
          }
        }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.c = (e.clientX - rect.left - ox) / (size + gap);
      mouse.r = (e.clientY - rect.top - oy) / (size + gap);
    };
    const onLeave = () => {
      mouse.c = mouse.r = -99;
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
  }, [reduce]);

  return (
    <div
      ref={boxRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn("border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0b0a0a]", className)}
    >
      <span ref={fontRef} aria-hidden className="pointer-events-none absolute font-display opacity-0">
        A
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 60% at 50% 40%, rgba(246,88,2,.12), transparent)" }}
      />

      <div className="relative p-3 md:p-5">
        {reduce ? (
          <div className="grid h-[280px] place-items-center px-6 text-center md:h-[440px]">
            <p className="font-display text-[40px] font-bold uppercase text-accent md:text-[88px]">{group.label}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden
            onClick={() => setActive((a) => (a + 1) % n)}
            className="block h-[260px] w-full cursor-pointer md:h-[420px] lg:h-[460px]"
          />
        )}
        <h3 className="sr-only">{group.label}</h3>
      </div>

      <div className="relative grid gap-5 border-t border-line px-5 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-10 md:py-8">
        <div>
          <p className="type-small tabular text-accent">
            {pad(active + 1)} / {pad(n)} <span className="text-ink-faint">· {pad(group.items.length)} tools</span>
          </p>
          <ul key={active} className="mt-3 flex flex-wrap gap-2">
            {group.items.map((item, j) => (
              <li
                key={item}
                className="whitespace-nowrap rounded-pill bg-ink px-4 py-2 font-display text-[14px] font-semibold uppercase text-canvas motion-safe:animate-[tile-in_.5s_ease-out_both] md:text-[16px]"
                style={{ animationDelay: `${j * 60}ms` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div role="tablist" aria-label="Skill groups" className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] md:max-w-[360px] md:flex-wrap md:justify-end">
          {skillGroups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={g.label}
              title={g.label}
              onClick={() => setActive(i)}
              className={cn(
                "type-small tabular grid size-10 shrink-0 place-items-center rounded-md border transition-colors duration-300",
                i === active ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-faint pointer-fine:hover:text-ink",
              )}
            >
              {pad(i + 1)}
            </button>
          ))}
        </div>
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
