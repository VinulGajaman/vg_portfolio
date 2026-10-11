"use client";

/**
 * <HeroMist>: realistic drifting stage smoke for the hero, built the way film/VFX "smoke cards"
 * work: a few large, soft, procedurally generated smoke puffs (fractal-noise texture with a soft
 * radial falloff) drawn on a canvas in two depth layers (big slow far puffs, smaller near ones),
 * each slowly drifting, rising, rotating and breathing in and out over a 26–42s life. Overlapping puffs read as real volumetric smoke.
 *   - Lit warm (cream → orange) and composited with `screen`, so it only lightens the portrait.
 *   - Desktop: low and around the sides of the wordmark. Phone: left and right of the head and
 *     tagline. Always thinner over the face.
 *   - Interaction is real fluid physics: a small stable-fluids solver (velocity grid with pressure
 *     projection and vorticity confinement) is driven by the pointer, and the smoke image is warped
 *     through the accumulated air displacement on the GPU, so smoke bends around the hand, is
 *     dragged into its wake, curls into eddies and slowly settles back. Nothing fades or spins.
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

/** Raw pixels of each generated texture, so WebGL can upload them without a GPU readback. */
const texPixels = new WeakMap<HTMLCanvasElement, ImageData>();

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
  texPixels.set(c, img);
  return c;
}

/** Smoke textures are expensive to generate, so build them once per page, in idle time. */
const TEX_SEEDS = [7, 1993, 424242];
const texCache: HTMLCanvasElement[] = [];
let texQueued = false;
function ensureTextures() {
  if (texQueued || typeof window === "undefined") return;
  texQueued = true;
  const idle: (cb: () => void) => void =
    "requestIdleCallback" in window
      ? (cb) => window.requestIdleCallback(cb, { timeout: 600 })
      : (cb) => window.setTimeout(cb, 60);
  const next = () => {
    if (texCache.length >= TEX_SEEDS.length) return;
    texCache.push(smokeTexture(TEX_SEEDS[texCache.length], 288));
    idle(next);
  };
  idle(next);
}

/* ---------------- fluid warp (GPU) ---------------- */

const VERT = `
attribute vec2 a;
varying vec2 vUv;
void main(){ vUv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }
`;
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uSmoke;
uniform sampler2D uDisp;
uniform vec2 uRes;   // css px
uniform float uMax;  // px encoded by a full byte swing
void main(){
  vec2 d = (texture2D(uDisp, vUv).rg - 0.5) * 2.0 * uMax;   // px, screen space (y down)
  vec2 uv = vUv - vec2(d.x, -d.y) / uRes;                    // smoke at x moved to x + d
  gl_FragColor = texture2D(uSmoke, uv);                      // already premultiplied
}
`;
/** Puff pass: each puff is a rotated textured quad drawn into an offscreen framebuffer. */
const PUFF_VERT = `
attribute vec2 a;
uniform vec2 uRes;   // css px
uniform vec2 uC;     // centre, css px (y down)
uniform float uS;    // size, css px
uniform float uRot;
varying vec2 vT;
void main(){
  vT = a * 0.5 + 0.5;
  float c = cos(uRot), s = sin(uRot);
  vec2 p = vec2(c * a.x - s * a.y, s * a.x + c * a.y) * (uS * 0.5) + uC;
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
}
`;
const PUFF_FRAG = `
precision mediump float;
varying vec2 vT;
uniform sampler2D uTex;
uniform float uA;
void main(){
  vec4 t = texture2D(uTex, vT);
  float a = t.a * uA;
  gl_FragColor = vec4(t.rgb * a, a);
}
`;
const MAX_D = 180; // px

/* ---------------- component ---------------- */

export function HeroMist({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;

    // Smoke is painted off-screen, then warped through the air simulation onto the visible canvas.
    const src = document.createElement("canvas");
    const sctx = src.getContext("2d");
    if (!sctx) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });

    ensureTextures();
    const texes = texCache;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // Phone (portrait screens): smoke sits on the left and right of the head and tagline (upper
    // middle); desktop: low and around the sides of the wordmark.
    let isPhone = canvas.clientWidth < 700;
    const phone = () => isPhone;
    const COUNT = Math.round((phone() ? 10 : 14) * Math.min(1.5, density));

    const spawn = (initial: boolean): Puff => {
      const side = Math.random();
      const mob = phone();
      const x = mob
        ? side < 0.5 ? rand(-0.25, 0.25) : rand(0.6, 1.2)
        : side < 0.4 ? rand(-0.15, 0.35) : side < 0.8 ? rand(0.65, 1.15) : rand(0.25, 0.75);
      // Depth layers: big slow far puffs and a few smaller, slightly faster near ones.
      const near = Math.random() < 0.3;
      return {
        tex: Math.floor(Math.random() * TEX_SEEDS.length),
        x,
        y: mob ? rand(0.12, 0.62) : rand(0.45, 1.05),
        size: (mob ? 1.7 : 1) * (near ? rand(0.3, 0.45) : rand(0.5, 0.85)),
        vx: (near ? rand(13.5, 27) : rand(5.6, 15.7)) * (Math.random() < 0.5 ? -1 : 1),
        vy: -(near ? rand(6.7, 13.4) : rand(2.2, 7.8)),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.056, 0.056),
        age: initial ? rand(0, 24) : 0,
        life: rand(20, 32),
        // phones: puffs are spread over a narrow screen, so they need a little more presence
        peak: (near ? rand(0.13, 0.2) : rand(0.17, 0.29)) * density * (mob ? 1.45 : 1),
      };
    };
    const puffs: Puff[] = Array.from({ length: COUNT }, () => spawn(true));

    /* ----- GL setup ----- */
    let prog: WebGLProgram | null = null;
    let tSmoke: WebGLTexture | null = null;
    let tDisp: WebGLTexture | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let puffProg: WebGLProgram | null = null;
    let fbo: WebGLFramebuffer | null = null;
    let triBuf: WebGLBuffer | null = null;
    let quadBuf: WebGLBuffer | null = null;
    let aWarp = 0;
    let aPuff = 0;
    const pu: Record<string, WebGLUniformLocation | null> = {};
    const puffTex: (WebGLTexture | null)[] = [];
    if (gl) {
      const sh = (type: number, code: string) => {
        const o = gl.createShader(type)!;
        gl.shaderSource(o, code);
        gl.compileShader(o);
        return o;
      };
      const link = (v: string, f: string) => {
        const pr0 = gl.createProgram()!;
        gl.attachShader(pr0, sh(gl.VERTEX_SHADER, v));
        gl.attachShader(pr0, sh(gl.FRAGMENT_SHADER, f));
        gl.linkProgram(pr0);
        return gl.getProgramParameter(pr0, gl.LINK_STATUS) ? pr0 : null;
      };
      prog = link(VERT, FRAG);
      puffProg = link(PUFF_VERT, PUFF_FRAG);
      if (!puffProg) prog = null; // both passes are needed for the GPU path
    }
    const ctx2d = !prog ? canvas.getContext("2d") : null; // fallback: plain smoke, no warp
    if (gl && prog && puffProg) {
      gl.useProgram(prog);
      triBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      quadBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      aWarp = gl.getAttribLocation(prog, "a");
      aPuff = gl.getAttribLocation(puffProg, "a");
      for (const n of ["uRes", "uC", "uS", "uRot", "uA", "uTex"]) pu[n] = gl.getUniformLocation(puffProg, n);
      const mk = (unit: number) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      tSmoke = mk(0);
      tDisp = mk(1);
      gl.uniform1i(gl.getUniformLocation(prog, "uSmoke"), 0);
      gl.uniform1i(gl.getUniformLocation(prog, "uDisp"), 1);
      gl.uniform1f(gl.getUniformLocation(prog, "uMax"), MAX_D);
      uRes = gl.getUniformLocation(prog, "uRes");
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.clearColor(0, 0, 0, 0);
      fbo = gl.createFramebuffer();
    }
    /** Upload each smoke texture once, as soon as it has been generated (idle time). */
    const syncPuffTextures = () => {
      if (!gl) return;
      while (puffTex.length < texes.length) {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const src0 = texes[puffTex.length];
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texPixels.get(src0) ?? src0);
        puffTex.push(t);
      }
    };

    /* ----- air simulation (stable fluids on a coarse grid) ----- */
    let W = 0;
    let H = 0;
    let cell = 16;
    let gw = 0;
    let gh = 0;
    let S = 0;
    let u = new Float32Array(0);
    let v = u;
    let u0 = u;
    let v0 = u;
    let dx = u; // accumulated displacement, px
    let dy = u;
    let dx0 = u;
    let dy0 = u;
    let pr = u;
    let dv = u;
    let curl = u;
    let bytes = new Uint8Array(0);
    const IX = (i: number, j: number) => i + S * j;

    const bnd = (x: Float32Array) => {
      for (let i = 1; i <= gw; i++) {
        x[IX(i, 0)] = x[IX(i, 1)];
        x[IX(i, gh + 1)] = x[IX(i, gh)];
      }
      for (let j = 1; j <= gh; j++) {
        x[IX(0, j)] = x[IX(1, j)];
        x[IX(gw + 1, j)] = x[IX(gw, j)];
      }
    };
    const advect = (out: Float32Array, srcF: Float32Array, U: Float32Array, V: Float32Array, dt: number) => {
      for (let j = 1; j <= gh; j++) {
        for (let i = 1; i <= gw; i++) {
          const k = IX(i, j);
          let x = i - dt * U[k];
          let y = j - dt * V[k];
          x = x < 0.5 ? 0.5 : x > gw + 0.5 ? gw + 0.5 : x;
          y = y < 0.5 ? 0.5 : y > gh + 0.5 ? gh + 0.5 : y;
          const i0 = x | 0;
          const j0 = y | 0;
          const s1 = x - i0;
          const t1 = y - j0;
          const a = IX(i0, j0);
          out[k] =
            (1 - s1) * ((1 - t1) * srcF[a] + t1 * srcF[a + S]) + s1 * ((1 - t1) * srcF[a + 1] + t1 * srcF[a + S + 1]);
        }
      }
      bnd(out);
    };
    const project = () => {
      for (let j = 1; j <= gh; j++) {
        for (let i = 1; i <= gw; i++) {
          const k = IX(i, j);
          dv[k] = -0.5 * (u[k + 1] - u[k - 1] + v[k + S] - v[k - S]);
          pr[k] = 0;
        }
      }
      bnd(dv);
      bnd(pr);
      for (let it = 0; it < 12; it++) {
        for (let j = 1; j <= gh; j++) {
          for (let i = 1; i <= gw; i++) {
            const k = IX(i, j);
            pr[k] = (dv[k] + pr[k - 1] + pr[k + 1] + pr[k - S] + pr[k + S]) * 0.25;
          }
        }
        bnd(pr);
      }
      for (let j = 1; j <= gh; j++) {
        for (let i = 1; i <= gw; i++) {
          const k = IX(i, j);
          u[k] -= 0.5 * (pr[k + 1] - pr[k - 1]);
          v[k] -= 0.5 * (pr[k + S] - pr[k - S]);
        }
      }
      bnd(u);
      bnd(v);
    };
    const vorticity = (dt: number, eps: number) => {
      for (let j = 1; j <= gh; j++) {
        for (let i = 1; i <= gw; i++) {
          const k = IX(i, j);
          curl[k] = 0.5 * (v[k + 1] - v[k - 1] - (u[k + S] - u[k - S]));
        }
      }
      for (let j = 2; j < gh; j++) {
        for (let i = 2; i < gw; i++) {
          const k = IX(i, j);
          const nx = 0.5 * (Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]));
          const ny = 0.5 * (Math.abs(curl[k + S]) - Math.abs(curl[k - S]));
          const len = Math.hypot(nx, ny) + 1e-5;
          u[k] += dt * eps * (ny / len) * curl[k];
          v[k] -= dt * eps * (nx / len) * curl[k];
        }
      }
    };

    const ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0, active: 0 };

    let airT = 0;
    const simulate = (dt: number) => {
      airT += dt;
      // 0. ambient air: slow, large swirls that keep the smoke billowing and curling on its own
      const A = 1.6;
      for (let j = 1; j <= gh; j++) {
        for (let i = 1; i <= gw; i++) {
          const k = IX(i, j);
          u[k] += dt * A * Math.sin(j * 0.31 + airT * 0.7) * Math.cos(i * 0.19 - airT * 0.45);
          v[k] += dt * A * Math.cos(i * 0.27 + airT * 0.55) * Math.sin(j * 0.23 - airT * 0.38);
        }
      }
      // 1. the hand moves the air (cells / s), as a soft gaussian brush
      if (ptr.active > 0) {
        const R = phone() ? 4.5 : 3.5;
        const ci = ptr.x / cell + 1;
        const cj = ptr.y / cell + 1;
        const fu = ptr.vx / cell;
        const fv = ptr.vy / cell;
        for (let j = Math.max(1, Math.floor(cj - 2 * R)); j <= Math.min(gh, Math.ceil(cj + 2 * R)); j++) {
          for (let i = Math.max(1, Math.floor(ci - 2 * R)); i <= Math.min(gw, Math.ceil(ci + 2 * R)); i++) {
            const g = Math.exp(-((i - ci) ** 2 + (j - cj) ** 2) / (R * R)) * ptr.active;
            const k = IX(i, j);
            u[k] += (fu - u[k]) * g * 0.5;
            v[k] += (fv - v[k]) * g * 0.5;
          }
        }
        ptr.active = Math.max(0, ptr.active - dt * 6);
      }
      // 2. eddies, incompressible flow, self-advection, air drag
      vorticity(dt, 5);
      project();
      u0.set(u);
      v0.set(v);
      advect(u, u0, u0, v0, dt);
      advect(v, v0, u0, v0, dt);
      const drag = Math.exp(-dt * 1.3);
      for (let k = 0; k < u.length; k++) {
        u[k] *= drag;
        v[k] *= drag;
      }
      project();
      // 3. the smoke's displacement follows the air, is carried by it, and relaxes back
      for (let k = 0; k < u.length; k++) {
        dx[k] += u[k] * cell * dt;
        dy[k] += v[k] * cell * dt;
      }
      dx0.set(dx);
      dy0.set(dy);
      advect(dx, dx0, u, v, dt);
      advect(dy, dy0, u, v, dt);
      const relax = Math.exp(-dt * 0.55);
      for (let k = 0; k < dx.length; k++) {
        dx[k] = Math.max(-MAX_D, Math.min(MAX_D, dx[k] * relax));
        dy[k] = Math.max(-MAX_D, Math.min(MAX_D, dy[k] * relax));
      }
    };

    const uploadDisp = () => {
      if (!gl || !tDisp) return;
      for (let j = 0; j < gh; j++) {
        for (let i = 0; i < gw; i++) {
          const k = IX(i + 1, j + 1);
          const o = (j * gw + i) * 4;
          bytes[o] = 128 + Math.round((dx[k] / MAX_D) * 127);
          bytes[o + 1] = 128 + Math.round((dy[k] / MAX_D) * 127);
          bytes[o + 2] = 0;
          bytes[o + 3] = 255;
        }
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tDisp);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gw, gh, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    };

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (!W || !H) return;
      isPhone = W < 700;
      // half-resolution smoke: it is soft, and the compositor stretches it for free
      src.width = canvas.width = Math.max(1, Math.round(W / 2));
      src.height = canvas.height = Math.max(1, Math.round(H / 2));
      sctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
      ctx2d?.setTransform(1, 0, 0, 1, 0, 0);
      cell = phone() ? 10 : 16;
      gw = Math.max(8, Math.round(W / cell));
      gh = Math.max(8, Math.round(H / cell));
      S = gw + 2;
      const n = S * (gh + 2);
      u = new Float32Array(n);
      v = new Float32Array(n);
      u0 = new Float32Array(n);
      v0 = new Float32Array(n);
      dx = new Float32Array(n);
      dy = new Float32Array(n);
      dx0 = new Float32Array(n);
      dy0 = new Float32Array(n);
      pr = new Float32Array(n);
      dv = new Float32Array(n);
      curl = new Float32Array(n);
      bytes = new Uint8Array(gw * gh * 4);
      if (gl && prog && puffProg) {
        gl.useProgram(prog);
        gl.uniform2f(uRes, W, H);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tSmoke);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tSmoke, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        uploadDisp();
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const moveTo = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const now = performance.now();
      if (ptr.t && now - ptr.t < 100) {
        const dtm = Math.max(8, now - ptr.t) / 1000;
        const cap = (n: number) => Math.max(-2500, Math.min(2500, n));
        ptr.vx = cap((x - ptr.x) / dtm);
        ptr.vy = cap((y - ptr.y) / dtm);
        ptr.active = 1;
      }
      ptr.x = x;
      ptr.y = y;
      ptr.t = now;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") moveTo(e.clientX, e.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      ptr.x = t.clientX - r.left; // start a new stroke without a velocity jump
      ptr.y = t.clientY - r.top;
      ptr.t = performance.now();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) moveTo(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let visible = true;
    let covered = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const onCovered = (e: Event) => (covered = Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("vg:hero-covered", onCovered);

    type Draw = (p: Puff, alpha: number, size: number) => void;
    const draw2d: Draw = (p, a, size) => {
      const tex = texes[p.tex] ?? texes[0];
      if (!tex) return;
      sctx.save();
      sctx.globalAlpha = a;
      sctx.translate(p.x * W, p.y * H);
      sctx.rotate(p.rot);
      sctx.drawImage(tex, -size / 2, -size / 2, size, size);
      sctx.restore();
    };
    const drawGl: Draw = (p, a, size) => {
      if (!gl) return;
      const tex = puffTex[p.tex] ?? puffTex[0];
      if (!tex) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform2f(pu.uC, p.x * W, p.y * H);
      gl.uniform1f(pu.uS, size);
      gl.uniform1f(pu.uRot, p.rot);
      gl.uniform1f(pu.uA, a);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const paintSmoke = (dt: number, drawPuff: Draw) => {
      const k = W / 1440;
      const face = phone() ? { x: 0.5, y: 0.24, r: 0.3 } : { x: 0.52, y: 0.4, r: 0.35 };
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        p.age += dt;
        if (p.age > p.life || p.x < -0.6 || p.x > 1.6) {
          puffs[i] = spawn(false);
          continue;
        }
        p.x += (p.vx * k * dt) / W;
        p.y += (p.vy * k * dt) / H;
        p.rot += p.vr * dt;
        // breathe in / out over its life, thinner over the face (upper middle)
        const t = p.age / p.life;
        const env = Math.sin(Math.PI * Math.min(1, t)) ** 1.2;
        const overFace = Math.max(0, 1 - Math.hypot(p.x - face.x, (p.y - face.y) * 1.6) / face.r);
        const a = p.peak * env * (1 - overFace * 0.65);
        if (a < 0.005) continue;
        drawPuff(p, a, p.size * W);
      }
    };

    let raf = 0;
    let last = performance.now();
    let cost = 0; // EMA of the work time per update (ms)
    let frames = 0;
    let halfRate = isPhone;
    let skip = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || covered || document.hidden || !W) {
        last = now;
        return;
      }
      if (halfRate && (skip = !skip)) return; // every other frame
      const dt = Math.min(1 / 20, (now - last) / 1000);
      last = now;
      const t0 = performance.now();
      if (gl && prog && puffProg) {
        syncPuffTextures();
        simulate(dt);
        uploadDisp();
        // 1. puffs -> framebuffer, blended like CSS "screen" (premultiplied)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(puffProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.enableVertexAttribArray(aPuff);
        gl.vertexAttribPointer(aPuff, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(pu.uRes, W, H);
        gl.uniform1i(pu.uTex, 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        paintSmoke(dt, drawGl);
        gl.disable(gl.BLEND);
        // 2. warp the framebuffer through the air displacement onto the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
        gl.enableVertexAttribArray(aWarp);
        gl.vertexAttribPointer(aWarp, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tSmoke);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tDisp);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else if (ctx2d) {
        sctx.clearRect(0, 0, W, H);
        sctx.globalCompositeOperation = "screen";
        paintSmoke(dt, draw2d);
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.drawImage(src, 0, 0);
      }
      cost = cost * 0.9 + (performance.now() - t0) * 0.1;
      if (++frames > 45 && !halfRate && cost > 7) halfRate = true; // slow device: drop to 30fps
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
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
