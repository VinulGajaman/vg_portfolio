"use client";

/**
 * <SkillsParticles>: the CV's skills as particle typography. A dark card (#0f0e0e, radius 16,
 * 1px line, edge light) with a canvas where ~2,600 particles (white, 12% orange) spell the active
 * group name in Clash Display; below it the group pills and the group's skills as chips.
 *   - Morph: on change the text is rasterised offscreen, sampled every 5px (3px on phone) and the
 *     particles get new targets plus a random kick, so they burst and swarm into the next word.
 *     Spare particles fade out and sink. Spring 0.055, damping 0.84 per frame.
 *   - Pointer: the mouse repels particles within 90px; they spring back when it leaves.
 *     Click / tap the canvas for the next group.
 *   - Autoplay every CYCLE_MS while on screen and not hovered. Long names wrap to two lines when a
 *     single line would be too small. Chips rise in (y 14, stagger .04) on each change.
 *   - The loop only runs while the card is on screen; it re-samples on resize and font load.
 * Reduced motion: no canvas; the group name renders as Clash text and nothing cycles.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_MS = 4000;
const MAX = 2600;
const pad = (n: number) => String(n).padStart(2, "0");

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; a: number; ta: number; o: boolean };

export function SkillsParticles({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);
  const morphRef = useRef<(text: string) => void>(() => {});
  const textRef = useRef(skillGroups[0].label);
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

  // Particle engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const parts: P[] = [];
    const mouse = { x: -9999, y: -9999 };
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = false;
    let family = "sans-serif";

    const fit = (o: CanvasRenderingContext2D, lines: string[]) => {
      let size = H * (lines.length > 1 ? 0.36 : 0.56);
      o.font = `600 ${size}px ${family}`;
      const widest = Math.max(...lines.map((l) => o.measureText(l).width));
      if (widest > W * 0.92) size *= (W * 0.92) / widest;
      return size;
    };

    const sample = (text: string) => {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const word = text.toUpperCase();
      let lines = [word];
      let size = fit(o, lines);
      if (size < H * 0.3 && word.includes(" ")) {
        const parts2 = word.split(" ");
        const cut = Math.ceil(parts2.length / 2);
        lines = [parts2.slice(0, cut).join(" "), parts2.slice(cut).join(" ")];
        size = fit(o, lines);
      }
      o.font = `600 ${size}px ${family}`;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const lh = size * 1.02;
      lines.forEach((l, i) => o.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * lh));
      const data = o.getImageData(0, 0, W, H).data;
      const gap = W < 600 ? 3 : 5;
      const pts: [number, number][] = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      return pts.slice(0, MAX);
    };

    const morph = (text: string) => {
      if (!W || !H) return;
      const pts = sample(text);
      while (parts.length < pts.length)
        parts.push({ x: Math.random() * W, y: H + 20, vx: 0, vy: 0, tx: 0, ty: 0, a: 0, ta: 0, o: Math.random() < 0.12 });
      parts.forEach((p, i) => {
        if (i < pts.length) {
          p.tx = pts[i][0];
          p.ty = pts[i][1];
          p.ta = 1;
        } else {
          p.tx = Math.random() * W;
          p.ty = H + 30;
          p.ta = 0;
        }
        p.vx += (Math.random() - 0.5) * 10;
        p.vy += (Math.random() - 0.5) * 10;
      });
    };
    morphRef.current = (text: string) => {
      textRef.current = text;
      morph(text);
    };

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      morph(textRef.current);
    };

    const size = () => (W < 600 ? 1.6 : 2.2);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const s = size();
      const R = 90;
      for (const color of [false, true]) {
        ctx.fillStyle = color ? "#F65802" : "#FFFFFF";
        for (const p of parts) {
          if (p.o !== color) continue;
          p.vx = (p.vx + (p.tx - p.x) * 0.055) * 0.84;
          p.vy = (p.vy + (p.ty - p.y) * 0.055) * 0.84;
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.a += (p.ta - p.a) * 0.08;
          if (p.a < 0.02) continue;
          ctx.globalAlpha = p.a;
          ctx.fillRect(p.x, p.y, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !fontRef.current) return;
      family = getComputedStyle(fontRef.current).fontFamily;
      resize();
      ro.observe(canvas);
      raf = requestAnimationFrame(loop);
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

  // Morph + chip entrance on every change
  useEffect(() => {
    morphRef.current(group.label);
    const chips = chipsRef.current?.children;
    if (chips && !reduce)
      gsap.fromTo(chips, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.04 });
  }, [group.label, reduce]);

  return (
    <div
      ref={boxRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0f0e0e]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{ background: "radial-gradient(50% 80% at 50% 40%, rgba(246,88,2,.10), transparent)" }}
      />
      {/* Hidden probe that resolves the Clash Display font-family for the canvas */}
      <span ref={fontRef} aria-hidden className="pointer-events-none absolute font-display opacity-0">
        A
      </span>

      <div className="relative">
        {reduce ? (
          <p className="grid h-[260px] place-items-center px-6 text-center font-display text-[40px] font-semibold uppercase leading-none text-ink md:h-[380px] md:text-[80px]">
            {group.label}
          </p>
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden
            onClick={() => setActive((a) => (a + 1) % n)}
            className="block h-[260px] w-full cursor-pointer md:h-[380px] lg:h-[420px]"
          />
        )}
        <h3 className="sr-only">{group.label}</h3>
      </div>

      <div className="relative border-t border-line px-5 py-6 md:px-10 md:py-8">
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
        <ul ref={chipsRef} key={active} className="mt-5 flex flex-wrap gap-2">
          {group.items.map((item) => (
            <li
              key={item}
              className="whitespace-nowrap rounded-pill bg-ink px-4 py-2 font-display text-[14px] font-semibold uppercase text-canvas md:text-[16px]"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
