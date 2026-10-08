"use client";

/**
 * <SkillsAscii>: the CV's skills as ASCII typography (canvas 2D, monospace grid).
 * The active group name is rasterised at grid resolution; every cell inside the letters shows a
 * character of the group's own skills ("JAVA · TYPESCRIPT · …" repeated), so the giant word is
 * literally written with its tools. Cells outside are faint flickering glyphs (".:-=+*").
 *   - Change: every cell scrambles through random glyphs, then settles at a time that sweeps left
 *     to right (plus jitter), so the new word resolves like a decode.
 *   - Mouse: cells within ~5 cells of the cursor glitch to random orange glyphs.
 *   - Autoplay every CYCLE_MS while on screen and not hovered; pills below jump directly; a click
 *     on the grid goes to the next group. Drawn at ~30fps, only while on screen.
 * Reduced motion: no canvas; the group name and its skills render as static text.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_MS = 4200;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>?";
const DUST = ".:-=+*·";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const pad = (n: number) => String(n).padStart(2, "0");
const rnd = (s: string) => s[Math.floor(Math.random() * s.length)];

export function SkillsAscii({ className }: { className?: string }) {
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
    let cw = 12;
    let ch = 15;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let visible = false;
    let family = "sans-serif";
    let lastDraw = 0;
    const mouse = { c: -99, r: -99 };
    // per cell
    let target: string[] = []; // settled char ("" = outside the letters)
    let settleAt = new Float64Array(0);
    let dust: string[] = [];

    const layout = (i: number, animate: boolean) => {
      if (!cols || !rows) return;
      const g = skillGroups[i];
      const word = g.label.toUpperCase();
      const o = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      o.canvas.width = cols;
      o.canvas.height = rows;
      // Fit the word to the grid width, then stretch it vertically so the letters fill the grid
      // height (ASCII-art style) however wide the word is. Long names split onto two lines.
      let lines = [word];
      const widthFit = (ls: string[]) => {
        o.font = `700 100px ${family}`;
        const widest = Math.max(...ls.map((l) => o.measureText(l).width));
        return (100 * cols * 0.94) / widest;
      };
      let size = widthFit(lines);
      if (word.includes(" ") && word.length > 12) {
        const parts = word.split(" ");
        const cut = Math.ceil(parts.length / 2);
        lines = [parts.slice(0, cut).join(" "), parts.slice(cut).join(" ")];
        size = widthFit(lines);
      }
      const cap = size * 0.72;
      const block = rows * (lines.length > 1 ? 0.78 : 0.6);
      const lineGap = lines.length > 1 ? 0.18 : 0;
      const sy = block / (cap * lines.length * (1 + lineGap));
      o.setTransform(1, 0, 0, sy, 0, 0);
      o.font = `700 ${size}px ${family}`;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const step = cap * (1 + lineGap);
      const cy = rows / 2 / sy;
      lines.forEach((l, k) => o.fillText(l, cols / 2, cy + (k - (lines.length - 1) / 2) * step));
      const d = o.getImageData(0, 0, cols, rows).data;
      const fill = (g.items.join(" · ") + " · ").toUpperCase();
      const now = performance.now();
      let k = 0;
      target = new Array(cols * rows);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (d[idx * 4 + 3] > 100) {
            const chr = fill[k++ % fill.length];
            target[idx] = chr === " " ? "·" : chr;
          } else target[idx] = "";
          settleAt[idx] = animate ? now + (c / cols) * 650 + Math.random() * 350 : 0;
        }
    };
    showRef.current = (i: number) => layout(i, true);

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = W < 600 ? 5 : 9;
      ch = Math.round(cw * 1.35);
      cols = Math.floor(W / cw);
      rows = Math.floor(H / ch);
      settleAt = new Float64Array(cols * rows);
      dust = Array.from({ length: cols * rows }, () => rnd(DUST));
      layout(activeRef.current, true);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !cols || now - lastDraw < 33) return;
      lastDraw = now;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `600 ${Math.round(cw * 1.15)}px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // flicker some dust
      for (let i = 0; i < 40; i++) dust[Math.floor(Math.random() * dust.length)] = rnd(DUST);
      for (let r = 0; r < rows; r++) {
        const y = r * ch + ch / 2 + (H - rows * ch) / 2;
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x = c * cw + cw / 2 + (W - cols * cw) / 2;
          const near = Math.hypot(c - mouse.c, (r - mouse.r) * 1.35) < 5;
          const t = target[idx];
          if (near) {
            ctx.fillStyle = "rgba(246,88,2,.95)";
            ctx.fillText(rnd(GLYPHS), x, y);
          } else if (now < settleAt[idx]) {
            ctx.fillStyle = t ? "rgba(246,88,2,.8)" : "rgba(255,255,255,.18)";
            ctx.fillText(rnd(GLYPHS), x, y);
          } else if (t) {
            ctx.fillStyle = "#fff";
            ctx.fillText(t, x, y);
          } else {
            ctx.fillStyle = "rgba(255,255,255,.07)";
            ctx.fillText(dust[idx], x, y);
          }
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      mouse.c = (e.clientX - rect.left - (W - cols * cw) / 2) / cw;
      mouse.r = (e.clientY - rect.top - (H - rows * ch) / 2) / ch;
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
        style={{ background: "radial-gradient(50% 60% at 50% 40%, rgba(246,88,2,.08), transparent)" }}
      />

      <div className="relative">
        {reduce ? (
          <div className="grid h-[280px] place-items-center px-6 text-center md:h-[420px]">
            <p className="font-display text-[40px] font-bold uppercase text-ink md:text-[80px]">{group.label}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden
            onClick={() => setActive((a) => (a + 1) % n)}
            className="block h-[280px] w-full cursor-crosshair md:h-[420px] lg:h-[460px]"
          />
        )}
        <h3 className="sr-only">{group.label}</h3>
      </div>

      <div className="relative border-t border-line px-5 py-5 md:px-10 md:py-6">
        <div role="tablist" aria-label="Skill groups" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap">
          {skillGroups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "type-small shrink-0 rounded-pill border px-3.5 py-1.5 transition-colors duration-300",
                i === active ? "border-accent text-ink" : "border-line text-ink-faint pointer-fine:hover:text-ink-soft",
              )}
            >
              <span className={cn("tabular", i === active && "text-accent")}>{pad(i + 1)}</span> {g.label}
            </button>
          ))}
        </div>
        <p className="mt-4 font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[13px] text-ink-soft md:text-[14px]">
          <span className="text-accent">&gt;</span> {group.items.join(" · ")}
        </p>
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
