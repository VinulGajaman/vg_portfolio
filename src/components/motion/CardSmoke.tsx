"use client";

/**
 * <CardSmoke>: the hero's realistic smoke (the same procedural smoke-card textures, see
 * <HeroMist>) drifting inside a card. Puffs are born low in the card, rise, drift sideways on a
 * slow curling current, turn, swell and fade over an 8–14s life, so the smoke keeps moving without
 * any pointer interaction. One shared animation loop draws every card that is on screen (30fps on
 * phones), at 0.6× CSS resolution (the smoke is soft, so the difference cannot be seen), into a
 * canvas composited with `screen`. Off for reduced motion.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { getSmokeTextures } from "./HeroMist";
import { cn } from "@/lib/cn";

type Puff = {
  tex: number;
  x: number; // CSS px inside the card
  y: number;
  size: number;
  vx: number; // px/s
  vy: number;
  rot: number;
  vr: number;
  age: number;
  life: number;
  peak: number; // max alpha
  ph: number; // phase of the curling current
};

type Card = {
  ctx: CanvasRenderingContext2D;
  puffs: Puff[];
  W: number;
  H: number;
  on: boolean;
  density: number;
};

const SCALE = 0.6;
const cards = new Set<Card>();
const rand = (a: number, b: number) => a + Math.random() * (b - a);
let raf = 0;
let last = 0;
let skip = false;

/** Puff size scales with the card's short side, so a wide desktop row and a phone card match. */
const base = (c: Card) => Math.min(c.W, c.H * 1.6);

function spawn(c: Card, initial: boolean): Puff {
  return {
    tex: Math.floor(Math.random() * 3),
    x: rand(-0.1, 1.1) * c.W,
    y: (initial ? rand(0.1, 1.1) : rand(0.8, 1.25)) * c.H,
    size: base(c) * rand(0.55, 1.05),
    vx: rand(-28, 28),
    vy: -rand(10, 26),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.22, 0.22),
    age: initial ? rand(0, 9) : 0,
    life: rand(8, 14),
    peak: rand(0.12, 0.23) * c.density,
    ph: rand(0, Math.PI * 2),
  };
}

function paint(c: Card, dt: number, t: number, tex: HTMLCanvasElement[]) {
  const { ctx, W, H } = c;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < c.puffs.length; i++) {
    const p = c.puffs[i];
    p.age += dt;
    if (p.age > p.life) {
      c.puffs[i] = spawn(c, false);
      continue;
    }
    // a slow curling current on top of the puff's own drift
    p.x += (p.vx + Math.sin(t * 0.6 + p.ph + p.y * 0.01) * 18) * dt;
    p.y += (p.vy + Math.cos(t * 0.45 + p.ph * 1.3 + p.x * 0.008) * 8) * dt;
    p.rot += p.vr * dt;
    p.size *= 1 + 0.035 * dt; // smoke spreads as it rises
    const a = p.peak * Math.sin(Math.PI * (p.age / p.life)) ** 1.2;
    const img = tex[p.tex] ?? tex[0];
    if (a < 0.005 || !img) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }
}

function tick(now: number) {
  let any = false;
  cards.forEach((c) => (any ||= c.on));
  if (!any) {
    raf = 0;
    return;
  }
  raf = requestAnimationFrame(tick);
  if (document.hidden) {
    last = now;
    return;
  }
  if (window.innerWidth < 768 && (skip = !skip)) return; // phones: 30fps
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const tex = getSmokeTextures();
  if (!tex.length) return;
  cards.forEach((c) => c.on && c.W && paint(c, dt, now / 1000, tex));
}

function kick() {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(tick);
}

export function CardSmoke({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || reduce) return;
    getSmokeTextures();
    const card: Card = { ctx, puffs: [], W: 0, H: 0, on: false, density };

    // Keep the puffs on resize (an accordion opening only adds room); match the count to the area.
    const size = () => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H || (W === card.W && H === card.H)) return;
      card.W = W;
      card.H = H;
      canvas.width = Math.max(1, Math.round(W * SCALE));
      canvas.height = Math.max(1, Math.round(H * SCALE));
      const n = Math.max(6, Math.round((W / base(card)) * 5 * Math.min(1.6, H / base(card) + 0.4)));
      while (card.puffs.length < n) card.puffs.push(spawn(card, true));
      card.puffs.length = n;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      card.on = e.isIntersecting;
      if (card.on) kick();
    });
    io.observe(canvas);
    cards.add(card);
    return () => {
      cards.delete(card);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce, density]);

  if (reduce) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full mix-blend-screen", className)}
    />
  );
}
