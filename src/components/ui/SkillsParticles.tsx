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
 *   - Transition: each change fires a ~650ms glitch on the canvas while the particles swarm —
 *     red / cyan channel split, horizontal slices shifted sideways, orange noise bars — and the
 *     skill chips decode from random glyphs (the glitch-signal design's effect).
 *   - Manual (nothing covers the word): click / tap the left or right half of the stage for
 *     previous / next (the custom cursor shows "← Prev" / "Next →"), drag / swipe sideways
 *     (> 40px; particles fly off in the swipe direction), left / right keys when focused, or a
 *     progress segment. Touch: a finger moving over the word pushes the particles like the mouse.
 *   - Progress: seven slim segments; the active one fills over CYCLE_MS and its animationend
 *     advances (autoplay), paused off-screen and on hover; any manual move restarts it.
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
import { Decode } from "@/components/ui/Decode";

const CYCLE_MS = 4000;
const MAX = 2600;

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  a: number;
  ta: number;
  o: boolean;
};

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
  const dirRef = useRef(1);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const n = skillGroups.length;
  const group = skillGroups[active];
  const running = inView && !hovered && !reduce;

  const go = (dir: 1 | -1) => {
    dirRef.current = dir;
    setActive((a) => (a + dir + n) % n);
  };
  const goTo = (i: number) => {
    dirRef.current = i >= active ? 1 : -1;
    setActive(i);
  };

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      lines.forEach((l, i) =>
        o.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * lh),
      );
      const data = o.getImageData(0, 0, W, H).data;
      const gap = W < 600 ? 3 : 5;
      const pts: [number, number][] = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap)
          if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
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
        parts.push({
          x: Math.random() * W,
          y: H + 20,
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
          a: 0,
          ta: 0,
          o: Math.random() < 0.12,
        });
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
        p.vx += (Math.random() - 0.5) * 10 - dirRef.current * 9;
        p.vy += (Math.random() - 0.5) * 10;
      });
    };
    let glitchAt = -1e9;
    morphRef.current = (text: string) => {
      const changed = text !== textRef.current;
      textRef.current = text;
      morph(text);
      if (changed) glitchAt = performance.now();
    };
    // Reusable buffer for slice shifting
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d")!;

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      morph(textRef.current);
    };

    const size = () => (W < 600 ? 1.6 : 2.2);
    const GLITCH_MS = 650;
    const draw = (color: boolean, ox: number, fill?: string) => {
      const s = size();
      ctx.fillStyle = fill ?? (color ? "#F65802" : "#FFFFFF");
      for (const p of parts) {
        if (p.o !== color || p.a < 0.02) continue;
        ctx.globalAlpha = p.a;
        ctx.fillRect(p.x + ox, p.y, s, s);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const R = 90;
      for (const p of parts) {
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
      }

      ctx.clearRect(0, 0, W, H);
      const t = (performance.now() - glitchAt) / GLITCH_MS;
      const k = t >= 0 && t < 1 ? Math.sin(t * Math.PI) : 0;

      if (k > 0) {
        // channel split
        const split = 10 * k;
        ctx.globalCompositeOperation = "lighter";
        draw(false, -split, "#ff2a3d");
        draw(true, -split, "#ff2a3d");
        draw(false, split, "#20e3ff");
        draw(true, split, "#20e3ff");
        ctx.globalCompositeOperation = "source-over";
      }
      draw(false, 0);
      draw(true, 0);
      ctx.globalAlpha = 1;

      if (k > 0 && Math.random() < 0.8) {
        // slices: copy a band out, clear it, paste it shifted sideways
        const bands = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < bands; i++) {
          const y = Math.random() * H;
          const h = 4 + Math.random() * 34;
          const shift = (Math.random() - 0.5) * 120 * k;
          const sy = Math.floor(y * dpr);
          const sh = Math.max(1, Math.floor(h * dpr));
          if (buf.width !== canvas.width || buf.height !== sh) {
            buf.width = canvas.width;
            buf.height = sh;
          }
          bctx.clearRect(0, 0, buf.width, buf.height);
          bctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, sy, canvas.width, sh);
          ctx.drawImage(buf, Math.round(shift * dpr), sy);
          ctx.restore();
        }
        // noise bars
        const bars = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < bars; i++) {
          ctx.fillStyle = Math.random() < 0.6 ? `rgba(246,88,2,${0.5 * k})` : `rgba(255,255,255,${0.25 * k})`;
          ctx.fillRect(0, Math.random() * H, W, 1 + Math.random() * 2);
        }
      }
    };

    // Mouse, pen and touch all push the particles; a finger lifts / cancels → they spring back.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    const stage = canvas.parentElement ?? canvas;
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onLeave);

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
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onLeave);
    };
  }, [reduce]);

  // Morph + chip entrance on every change
  useEffect(() => {
    morphRef.current(group.label);
    const chips = chipsRef.current?.children;
    if (chips && !reduce)
      gsap.fromTo(
        chips,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.04 },
      );
  }, [group.label, reduce]);

  return (
    <div
      ref={boxRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label="Skills"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      className={cn(
        "border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0f0e0e] outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "radial-gradient(50% 80% at 50% 40%, rgba(246,88,2,.10), transparent)",
        }}
      />
      {/* Hidden probe that resolves the Clash Display font-family for the canvas */}
      <span
        ref={fontRef}
        aria-hidden
        className="pointer-events-none absolute font-display opacity-0"
      >
        A
      </span>

      <div
        className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          swipeRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const st = swipeRef.current;
          swipeRef.current = null;
          if (!st) return;
          const dx = e.clientX - st.x;
          const dy = e.clientY - st.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
            go(dx < 0 ? 1 : -1);
          else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
            const r = e.currentTarget.getBoundingClientRect();
            go(e.clientX - r.left < r.width / 2 ? -1 : 1);
          }
        }}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      >
        {reduce ? (
          <p className="grid h-[260px] place-items-center px-6 text-center font-display text-[40px] font-semibold uppercase leading-none text-ink md:h-[380px] md:text-[80px]">
            {group.label}
          </p>
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden
            className="block h-[260px] w-full md:h-[380px] lg:h-[420px]"
          />
        )}
        <h3 className="sr-only">{group.label}</h3>

        {/* Hint (top-right, clear of the word) */}
        <span className="type-small pointer-events-none absolute right-5 top-4 text-ink-faint md:right-8 md:top-6">
          <span className="pointer-fine:hidden">Swipe or tap a side</span>
          <span className="hidden pointer-fine:inline">
            Click a side or drag
          </span>
        </span>

        {/* Invisible halves: only drive the custom cursor label (clicks bubble to the stage) */}
        <span
          aria-hidden
          data-cursor="open"
          data-cursor-label="← Prev"
          className="absolute inset-y-0 left-0 w-1/2"
        />
        <span
          aria-hidden
          data-cursor="open"
          data-cursor-label="Next →"
          className="absolute inset-y-0 right-0 w-1/2"
        />
      </div>

      <div className="relative border-t border-line px-5 py-6 md:px-10 md:py-8">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Progress segments: the active one fills as the autoplay timer; click to jump */}
          <div
            className="flex flex-1 gap-1.5"
            role="group"
            aria-label="Skill groups"
          >
            {skillGroups.map((g, i) => (
              <button
                key={g.label}
                type="button"
                aria-label={g.label}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className="group/seg relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-line transition-[height] duration-300 pointer-fine:group-hover/seg:h-[5px]">
                  <span
                    key={i === active ? `on-${active}` : "off"}
                    onAnimationEnd={i === active ? () => go(1) : undefined}
                    className={cn(
                      "absolute inset-0 origin-left rounded-full bg-accent",
                      i < active ? "opacity-40" : i > active ? "scale-x-0" : "",
                    )}
                    style={
                      i === active
                        ? {
                            animation: reduce
                              ? "none"
                              : `skill-progress ${CYCLE_MS}ms linear forwards`,
                            animationPlayState: running ? "running" : "paused",
                          }
                        : undefined
                    }
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
        <ul ref={chipsRef} key={active} className="mt-5 flex flex-wrap gap-2">
          {group.items.map((item, j) => (
            <li
              key={item}
              className="whitespace-nowrap rounded-pill bg-ink px-4 py-2 font-display text-[14px] font-semibold uppercase text-canvas md:text-[16px]"
            >
              <Decode text={item} delay={60 + j * 70} enabled={!reduce} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
