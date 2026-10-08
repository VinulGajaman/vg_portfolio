"use client";

/**
 * <SkillsRings>: the CV's skills as a tower of spinning 3D text rings, one ring per group.
 * Each ring holds its group name (orange, Clash) plus its skills, repeated to fill ≥ 12 slots
 * around the circle. Every frame the slots are projected: x = sin(a)·R, depth = cos(a); words at
 * the front are large and bright, at the back small, faint and slightly raised (a tilted ellipse).
 *   - Rings spin in alternating directions at slightly different speeds.
 *   - Hover a ring (mouse): it eases to a slow crawl and its words turn white / orange; the others
 *     dim. Scroll velocity briefly speeds every ring up.
 *   - Entrance: rings fade and rise in one by one once in view. Only animates while on screen.
 * Reduced motion: static rows (group name + skills) with no spin.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { getScrollVelocity } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

const MIN_SLOTS = 12;
const pad = (n: number) => String(n).padStart(2, "0");

const RINGS = skillGroups.map((g, i) => {
  const base = [{ text: `${pad(i + 1)} ${g.label}`, label: true }, ...g.items.map((t) => ({ text: t, label: false }))];
  const words = [...base];
  while (words.length < MIN_SLOTS) words.push(...base);
  return { words, dir: i % 2 ? -1 : 1, speed: 0.16 + (i % 3) * 0.03 };
});

export function SkillsRings({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<number | null>(null);
  const wordRefs = useRef<HTMLSpanElement[][]>(RINGS.map(() => []));
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;
    const angle = RINGS.map((_, i) => i * 0.7);
    const rate = RINGS.map(() => 1);
    const appear = RINGS.map(() => 0);
    let raf = 0;
    let visible = false;
    let shown = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!visible) return;
      shown += dt;
      const R = Math.min(root.clientWidth * 0.42, 560);
      const tilt = R * 0.1;
      const boost = 1 + Math.min(Math.abs(getScrollVelocity()) / 800, 4);
      const h = hoverRef.current;
      RINGS.forEach((ring, r) => {
        const target = h === r ? 0.12 : boost;
        rate[r] += (target - rate[r]) * 0.06;
        angle[r] += ring.dir * ring.speed * rate[r] * dt;
        appear[r] += ((shown > r * 0.12 ? 1 : 0) - appear[r]) * 0.08;
        const row = rowRefs.current[r];
        if (row) {
          row.style.opacity = String(appear[r] * (h === null || h === r ? 1 : 0.35));
          row.style.transform = `translateY(${(1 - appear[r]) * 24}px)`;
        }
        const m = ring.words.length;
        ring.words.forEach((_, k) => {
          const el = wordRefs.current[r][k];
          if (!el) return;
          const a = angle[r] + (k * Math.PI * 2) / m;
          const depth = Math.cos(a); // 1 front, −1 back
          const d = (depth + 1) / 2;
          const x = Math.sin(a) * R;
          const y = -depth * tilt * 0.35;
          el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.55 + d * 0.55).toFixed(3)})`;
          el.style.opacity = (0.08 + 0.92 * d * d).toFixed(3);
          el.style.zIndex = String(Math.round(d * 100));
        });
      });
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  if (reduce) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        {skillGroups.map((g, i) => (
          <p key={g.label} className="font-display text-[18px] font-semibold uppercase text-ink md:text-[24px]">
            <span className="text-accent">
              {pad(i + 1)} {g.label}
            </span>{" "}
            · {g.items.join(" · ")}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      onPointerLeave={() => setHover(null)}
      className={cn("relative overflow-hidden py-6 md:py-10", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(40% 60% at 50% 50%, rgba(246,88,2,.09), transparent)" }}
      />
      {RINGS.map((ring, r) => (
        <div
          key={r}
          ref={(el) => {
            rowRefs.current[r] = el;
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(r)}
          onClick={() => setHover((h) => (h === r ? null : r))}
          className="relative h-[52px] cursor-default opacity-0 md:h-[72px] lg:h-[84px]"
        >
          {ring.words.map((w, k) => (
            <span
              key={k}
              ref={(el) => {
                if (el) wordRefs.current[r][k] = el;
              }}
              aria-hidden
              className={cn(
                "absolute left-1/2 top-1/2 whitespace-nowrap font-display font-semibold uppercase leading-none transition-colors duration-500 will-change-transform",
                "text-[18px] md:text-[30px] lg:text-[38px]",
                w.label ? "text-accent" : hover === r ? "text-ink" : "text-ink-soft",
              )}
            >
              {w.text}
            </span>
          ))}
        </div>
      ))}
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
