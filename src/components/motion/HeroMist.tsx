"use client";

/**
 * <HeroMist>: realistic drifting stage smoke for the hero, as a WebGL fragment shader.
 * Domain-warped fractal noise (fbm of fbm) gives curling, billowing smoke that rises slowly; a
 * second, finer layer adds wisps. The smoke is lit warm (cream at the glow core → orange → deep red)
 * and densest low in the frame, so it reads as haze caught in the backlight. The pointer stirs it:
 * a velocity-driven swirl that pushes the noise field around the cursor and decays back.
 *   - Rendered at half resolution (DPR ≤ 1) and composited with mix-blend-mode: screen, so it only
 *     ever lightens and never darkens the portrait.
 *   - Runs only while the hero is on screen and not covered; off for reduced motion or no WebGL.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // 0..1, y up
uniform vec2 uVel;       // pointer velocity (smoothed)
uniform float uStir;     // 0..1 how much the pointer is stirring
uniform float uDensity;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++){ v += a*noise(p); p = r*p*2.02 + 3.1; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x*aspect, uv.y);
  float t = uTime;

  // Pointer swirl: rotate and push the field around the cursor, scaled by stir amount.
  vec2 m = vec2(uMouse.x*aspect, uMouse.y);
  vec2 d = p - m;
  float r = length(d);
  float fall = exp(-r*r*9.0) * uStir;
  float ang = fall * 2.4;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p = m + rot*d - uVel*fall*0.35;

  // Rising, slowly drifting smoke: fbm warped by fbm.
  vec2 q = p*1.6 + vec2(0.0, -t*0.06);
  vec2 w = vec2(fbm(q + vec2(t*0.03, 0.0)), fbm(q + vec2(5.2, 1.3) - vec2(0.0, t*0.04)));
  float smoke = fbm(q + 2.2*w + vec2(-t*0.02, 0.0));
  float wisps = fbm(p*4.0 + 3.0*w - vec2(0.0, t*0.09));

  float s = smoothstep(0.28, 0.85, smoke) * 1.15 + smoothstep(0.45, 0.85, wisps) * 0.35;

  // Densest low in the frame and around the backlight, thinning towards the top.
  float low = smoothstep(1.05, 0.05, uv.y);
  float core = exp(-pow(distance(uv, vec2(0.52, 0.62)) * 1.6, 2.0));
  s *= (0.35 + 0.65*low) * (0.6 + 0.6*core) * uDensity;
  s *= 1.0 - fall*0.55; // the cursor parts the smoke a little

  // Warm backlit colour: cream in the glow, orange, deep red at the edges.
  vec3 col = mix(vec3(0.55, 0.10, 0.03), vec3(1.0, 0.42, 0.12), core);
  col = mix(col, vec3(1.0, 0.82, 0.62), core*core*0.5);
  gl_FragColor = vec4(col * s, 1.0);
}
`;

export function HeroMist({ className, density = 0.8 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uTime = U("uTime"), uMouse = U("uMouse"), uVel = U("uVel");
    const uStir = U("uStir"), uDensity = U("uDensity");

    const scale = 0.5 * Math.min(1, window.devicePixelRatio || 1);
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Pointer: smoothed position + velocity; stir rises with movement and decays.
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0, stir: 0 };
    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1 - (e.clientY - r.top) / r.height;
      mouse.vx = (nx - mouse.tx) * 30;
      mouse.vy = (ny - mouse.ty) * 30;
      mouse.tx = nx;
      mouse.ty = ny;
      mouse.stir = Math.min(1, mouse.stir + Math.hypot(mouse.vx, mouse.vy) * 0.25);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    let covered = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    const onCovered = (e: Event) => (covered = Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("vg:hero-covered", onCovered);

    let raf = 0;
    const start = performance.now();
    let last = start;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || covered || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.vx *= 0.92;
      mouse.vy *= 0.92;
      mouse.stir = Math.max(0, mouse.stir - dt * 0.5);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uVel, mouse.vx, mouse.vy);
      gl.uniform1f(uStir, mouse.stir);
      gl.uniform1f(uDensity, density);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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
