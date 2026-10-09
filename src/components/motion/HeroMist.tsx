"use client";

/**
 * <HeroMist>: realistic drifting stage smoke for the hero, built the way film/VFX "smoke cards"
 * work: a few large, soft, procedurally generated smoke puffs (fractal-noise texture with a soft
 * radial falloff) drawn on a canvas, each slowly drifting sideways, rising, rotating and breathing
 * in and out over a 20–35s life. Overlapping puffs read as real volumetric smoke.
 *   - Lit warm (cream → orange) and composited with `screen`, so it only lightens the portrait.
 *   - Concentrated in the lower half and around the sides of the frame (around the wordmark),
 *     thinner over the face.
 *   - The pointer pushes nearby puffs with its velocity (they drift away and settle).
 *   - Rendered at ≤ 1× DPR; runs only while the hero is on screen and not covered.
 *   - Off for reduced motion.
 * Canvas 2D (no WebGL) so it renders identically on every GPU / browser.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

type Puff = {
  tex: number;
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  size: number; // 0..1 of width
  vx: number; // px/s at 1440 wide
  vy: number;
  rot: number;
  vr: number;
  age: number;
  life: number;
  peak: number; // max alpha
  px: number; // push velocity from the pointer (px/s)
  py: number;
};

/* ---------------- procedural smoke texture ---------------- */

function makeNoise(seed: number) {
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number, x: number, y: number) => (h & 1 ? -x : x) + (h & 2 ? -y : y);
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = perm[X] + Y;
    const b = perm[X + 1] + Y;
    const l1 = grad(perm[a], x, y) + u * (grad(perm[b], x - 1, y) - grad(perm[a], x, y));
    const l2 = grad(perm[a + 1], x, y - 1) + u * (grad(perm[b + 1], x - 1, y - 1) - grad(perm[a + 1], x, y - 1));
    return l1 + v * (l2 - l1); // ≈ −1..1
  };
}

function smokeTexture(seed: number, size = 256): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const n = makeNoise(seed);
  const fbm = (x: number, y: number) => {
    let v = 0;
    let a = 0.5;
    let f = 1;
    for (let o = 0; o < 6; o++) {
      v += a * n(x * f, y * f);
      f *= 2.03;
      a *= 0.5;
    }
    return v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      // domain warp for billowy curls
      const wx = fbm(nx * 3 + 11, ny * 3 + 7);
      const wy = fbm(nx * 3 - 5, ny * 3 + 3);
      const v = fbm(nx * 3.2 + wx * 1.4, ny * 3.2 + wy * 1.4) * 0.5 + 0.5;
      const r = Math.sqrt(nx * nx + ny * ny) * 2; // 0 centre … 1 edge
      const fall = Math.max(0, 1 - r);
      const a = Math.pow(fall, 1.6) * Math.max(0, Math.min(1, (v - 0.32) * 2.2));
      const i = (y * size + x) * 4;
      // warm backlit smoke: cream core → orange edges
      img.data[i] = 255;
      img.data[i + 1] = Math.round(175 + 70 * v);
      img.data[i + 2] = Math.round(135 + 80 * v);
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ---------------- component ---------------- */

export function HeroMist({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const texes = [smokeTexture(7), smokeTexture(1993), smokeTexture(424242)];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const COUNT = Math.round((canvas.clientWidth < 700 ? 11 : 20) * Math.min(1.5, density));

    const spawn = (initial: boolean): Puff => {
      const side = Math.random();
      // mostly lower half, biased to the sides around the wordmark
      const x = side < 0.4 ? rand(-0.15, 0.35) : side < 0.8 ? rand(0.65, 1.15) : rand(0.25, 0.75);
      return {
        tex: Math.floor(Math.random() * texes.length),
        x,
        y: rand(0.45, 1.05),
        size: rand(0.38, 0.75),
        vx: rand(6, 22) * (Math.random() < 0.5 ? -1 : 1),
        vy: -rand(3, 10),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.05, 0.05),
        age: initial ? rand(0, 20) : 0,
        life: rand(20, 35),
        peak: rand(0.32, 0.55) * density,
        px: 0,
        py: 0,
      };
    };
    const puffs: Puff[] = Array.from({ length: COUNT }, () => spawn(true));

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(1, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // pointer velocity pushes nearby puffs
    const ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = performance.now();
      const dt = Math.max(16, now - ptr.t) / 1000;
      ptr.vx = (x - ptr.x) / dt;
      ptr.vy = (y - ptr.y) / dt;
      if (ptr.t === 0 || Math.abs(ptr.vx) > 5000) ptr.vx = ptr.vy = 0;
      ptr.x = x;
      ptr.y = y;
      ptr.t = now;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    let covered = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const onCovered = (e: Event) => (covered = Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("vg:hero-covered", onCovered);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || covered || document.hidden || !W) return;
      const k = W / 1440;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";
      ptr.vx *= 0.9;
      ptr.vy *= 0.9;

      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        p.age += dt;
        if (p.age > p.life || p.x < -0.6 || p.x > 1.6) {
          puffs[i] = spawn(false);
          continue;
        }
        const cx = p.x * W;
        const cy = p.y * H;
        const s = p.size * W;
        // pointer push (within the puff's radius)
        const dx = cx - ptr.x;
        const dy = cy - ptr.y;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / (s * 0.6));
        if (near > 0) {
          p.px += ptr.vx * near * 0.035;
          p.py += ptr.vy * near * 0.035;
        }
        p.px *= 0.97;
        p.py *= 0.97;
        p.x += ((p.vx * k + p.px) * dt) / W;
        p.y += ((p.vy * k + p.py) * dt) / H;
        p.rot += p.vr * dt;

        // breathe in / out over its life, thinner over the face (upper middle)
        const t = p.age / p.life;
        const env = Math.sin(Math.PI * Math.min(1, t)) ** 1.2;
        const overFace = Math.max(0, 1 - Math.hypot(p.x - 0.52, (p.y - 0.4) * 1.6) / 0.35);
        const a = p.peak * env * (1 - overFace * 0.65);
        if (a < 0.005) continue;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(cx, cy);
        ctx.rotate(p.rot);
        ctx.drawImage(texes[p.tex], -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("vg:hero-covered", onCovered);
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
