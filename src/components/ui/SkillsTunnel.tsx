"use client";

/**
 * <SkillsTunnel>: the CV's skills flying out of a hyperspace tunnel (canvas 2D).
 * ~60 word "stars" (every skill, repeated) start deep in the tunnel (z = 1) at a random angle and
 * radius, and travel toward the viewer; each frame they are projected from a vanishing point
 * (x/z, y/z), so they spread out, grow and brighten as they approach, then respawn at the back.
 * A short speed streak trails each word. The active group's words are orange and slightly larger;
 * the group name sits in the centre in Clash Display with its tool count.
 *   - Mouse steers the vanishing point (eased); scroll velocity boosts the warp speed.
 *   - Group pills below; autoplay every CYCLE_MS while on screen and not hovered. Click the
 *     canvas for the next group.
 *   - The loop only runs while on screen; the canvas re-sizes with the card.
 * Reduced motion: no canvas animation; the group name and its skills render as static text.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { getScrollVelocity } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const CYCLE_MS = 4000;
const COUNT = 44;
const pad = (n: number) => String(n).padStart(2, "0");
const ALL = skillGroups.flatMap((g, group) => g.items.map((label) => ({ label, group })));

type Star = { label: string; group: number; a: number; r: number; z: number; pz: number };

export function SkillsTunnel({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const n = skillGroups.length;
  const group = skillGroups[active];

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = false;
    let family = "sans-serif";
    const vp = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let speed = 0.004;

    const spawn = (s: Star, z = 1) => {
      const w = ALL[Math.floor(Math.random() * ALL.length)];
      s.label = w.label;
      s.group = w.group;
      s.a = Math.random() * Math.PI * 2;
      s.r = 0.7 + Math.random() * 0.8;
      s.z = z;
      s.pz = z;
    };
    const count = canvas.clientWidth < 600 ? 26 : COUNT;
    const stars: Star[] = Array.from({ length: count }, () => {
      const s = { label: "", group: 0, a: 0, r: 0, z: 1, pz: 1 };
      spawn(s, 0.08 + Math.random() * 0.92);
      return s;
    });

    const resize = () => {
      W = Math.round(canvas.clientWidth);
      H = Math.round(canvas.clientHeight);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (s: Star, z: number) => {
      const k = 0.16 / z;
      const cx = vp.x * W;
      const cy = vp.y * H;
      return { x: cx + Math.cos(s.a) * s.r * k * W * 0.5, y: cy + Math.sin(s.a) * s.r * k * H * 0.5 };
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || !W) return;
      vp.x += (vp.tx - vp.x) * 0.05;
      vp.y += (vp.ty - vp.y) * 0.05;
      const boost = Math.min(Math.abs(getScrollVelocity()) / 1500, 3);
      speed += (0.004 * (1 + boost) - speed) * 0.08;
      ctx.clearRect(0, 0, W, H);
      const base = W < 600 ? 13 : 18;
      stars.sort((a, b) => b.z - a.z);
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed * (0.6 + (1 - s.z));
        if (s.z <= 0.06) {
          spawn(s);
          continue;
        }
        const p = project(s, s.z);
        const q = project(s, Math.min(1, s.pz + speed * 6));
        if (p.x < -200 || p.x > W + 200 || p.y < -60 || p.y > H + 60) {
          spawn(s);
          continue;
        }
        const near = 1 - s.z; // 0 far … 1 near
        const on = s.group === activeRef.current;
        // Far words stay hidden near the vanishing point so the centre title stays clean.
        const fadeIn = Math.min(1, Math.max(0, (near - 0.25) / 0.3));
        const alpha = fadeIn * (s.z < 0.15 ? s.z / 0.15 : 1);
        if (alpha < 0.02) continue;
        const color = on ? "246,88,2" : "255,255,255";
        // streak
        ctx.strokeStyle = `rgba(${color},${alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // word
        const size = base * (0.35 + near * 1.4) * (on ? 1.15 : 1);
        ctx.font = `600 ${size}px ${family}`;
        ctx.fillStyle = `rgba(${color},${alpha * (on ? 1 : 0.75)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.label.toUpperCase(), p.x, p.y);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      vp.tx = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      vp.ty = 0.5 + ((e.clientY - r.top) / r.height - 0.5) * 0.5;
    };
    const onLeave = () => {
      vp.tx = 0.5;
      vp.ty = 0.5;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled && fontRef.current) family = getComputedStyle(fontRef.current).fontFamily;
    });
    raf = requestAnimationFrame(frame);

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

      <div className="relative h-[380px] md:h-[500px] lg:h-[540px]">
        {!reduce && (
          <canvas
            ref={canvasRef}
            aria-hidden
            onClick={() => setActive((a) => (a + 1) % n)}
            className="absolute inset-0 block size-full cursor-pointer"
          />
        )}
        {/* Centre title */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6">
          <span
            aria-hidden
            className="absolute size-[340px] rounded-full md:size-[560px]"
            style={{ background: "radial-gradient(closest-side, rgba(11,10,10,.97), rgba(11,10,10,.8) 55%, transparent)" }}
          />
          <div key={active} className="relative text-center motion-safe:animate-[tunnel-in_.7s_cubic-bezier(.16,1,.3,1)]">
            <p className="type-small tabular text-accent">
              {pad(active + 1)} / {pad(n)}
            </p>
            <h3 className="mt-2 font-display text-[32px] font-bold uppercase leading-[.95] text-ink md:text-[60px] lg:text-[72px]">
              {group.label}
            </h3>
            <p className="type-small mt-3 text-ink-soft">{pad(group.items.length)} tools</p>
            {reduce && <p className="type-body mt-4 text-ink">{group.items.join(" · ")}</p>}
          </div>
        </div>
      </div>

      <div className="relative border-t border-line px-5 py-5 md:px-10 md:py-6">
        <div role="tablist" aria-label="Skill groups" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:justify-center">
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
