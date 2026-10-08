"use client";

/**
 * <SkillsFlashlight>: the CV's full skills list as a dark wall lit by a flashlight
 * (skills idea, final round #1).
 * A card (#121111, radius 16, 1px line, edge light) holds a typographic wall: per group a small
 * "01 · Group" label and the skills in Clash uppercase (20 / 28 / 34px) joined by " / ".
 *   - Base layer: the wall in near-invisible ink (#2c2b2b) — real text for screen readers.
 *   - Lit layer: an identical, aria-hidden copy in white with orange labels and separators,
 *     masked to a soft circle (radius 180 / 120px on phone) at the lens position.
 *   - Lens: follows the mouse with lerp .12 per frame plus a thin orange ring and a warm glow;
 *     when idle (not hovered, and on touch devices) it drifts on a slow Lissajous path so the
 *     effect is always alive. A tap moves the lens to that spot.
 *   - Entrance: the groups rise y 24 → 0 and fade in, stagger .07.
 * The lens only animates while the card is on screen. Reduced motion: the lit layer is shown
 * unmasked (fully readable) and nothing moves.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");

function Wall({ lit }: { lit?: boolean }) {
  return (
    <div className="flex flex-col gap-5 p-6 md:gap-6 md:p-10 lg:p-12">
      {skillGroups.map((g, i) => (
        <div key={g.label} data-wall-group="">
          <p
            className={cn(
              "type-small mb-1.5 uppercase tracking-[.08em] tabular",
              lit ? "text-accent" : "text-[#3a3939]",
            )}
          >
            {pad(i + 1)} · {g.label}
          </p>
          <p
            className={cn(
              "font-display text-[20px] font-semibold uppercase leading-[1.12] md:text-[28px] lg:text-[34px]",
              lit ? "text-ink" : "text-[#2c2b2b]",
            )}
          >
            {g.items.map((item, j) => (
              <span key={item}>
                {j > 0 && <span className={lit ? "text-accent" : undefined}> / </span>}
                <span className="whitespace-nowrap">{item}</span>
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SkillsFlashlight({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, fine, isPhone }) => {
      const box = boxRef.current;
      const lit = litRef.current;
      const ring = ringRef.current;
      if (!box || !lit || !ring) return;
      if (reduce) {
        lit.style.maskImage = "none";
        lit.style.webkitMaskImage = "none";
        ring.style.display = "none";
        return;
      }

      const R = isPhone ? 120 : 180;
      const pos = { x: box.clientWidth / 2, y: box.clientHeight / 2 };
      const target = { ...pos };
      let pointer = false;
      let visible = false;
      let t = 0;

      const apply = () => {
        const m = `radial-gradient(circle ${R}px at ${pos.x}px ${pos.y}px, #000 55%, transparent 100%)`;
        lit.style.maskImage = m;
        lit.style.webkitMaskImage = m;
        ring.style.transform = `translate(${pos.x - R}px, ${pos.y - R}px)`;
      };
      ring.style.width = ring.style.height = `${R * 2}px`;
      apply();

      const tick = (_time: number, delta: number) => {
        if (!visible) return;
        if (!pointer) {
          t += delta / 1000;
          const W = box.clientWidth;
          const H = box.clientHeight;
          target.x = W * (0.5 + 0.36 * Math.sin(t * 0.35));
          target.y = H * (0.5 + 0.34 * Math.sin(t * 0.55 + 1.2));
        }
        const k = 1 - Math.pow(1 - 0.12, delta / 16.67);
        pos.x += (target.x - pos.x) * k;
        pos.y += (target.y - pos.y) * k;
        apply();
      };
      gsap.ticker.add(tick);

      const local = (e: PointerEvent) => {
        const r = box.getBoundingClientRect();
        target.x = e.clientX - r.left;
        target.y = e.clientY - r.top;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer = true;
        local(e);
      };
      const onLeave = () => {
        pointer = false;
      };
      const onTap = (e: PointerEvent) => {
        if (e.pointerType === "mouse") return;
        local(e);
      };
      if (fine) {
        box.addEventListener("pointermove", onMove);
        box.addEventListener("pointerleave", onLeave);
      }
      box.addEventListener("pointerdown", onTap);

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(box);

      // Animate the base and lit copies in lockstep so the lens always lines up with the wall.
      const base = box.querySelectorAll("[data-flash-base] [data-wall-group]");
      const litGroups = lit.querySelectorAll("[data-wall-group]");
      gsap.set([base, litGroups], { y: 24, autoAlpha: 0 });
      const intro = gsap
        .timeline({ paused: true })
        .to(base, { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0)
        .to(litGroups, { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0);
      const st = onceInView(box, () => intro.play(), { settle: () => intro.progress(1) });

      return () => {
        gsap.ticker.remove(tick);
        box.removeEventListener("pointermove", onMove);
        box.removeEventListener("pointerleave", onLeave);
        box.removeEventListener("pointerdown", onTap);
        io.disconnect();
        st.kill();
      };
    },
    { scope: boxRef },
  );

  return (
    <div
      ref={boxRef}
      className={cn(
        "border-overlay edge-light relative select-none overflow-hidden rounded-2xl bg-[#121111]",
        className,
      )}
    >
      {/* Base wall (readable by screen readers) */}
      <div data-flash-base="">
        <Wall />
      </div>

      {/* Warm glow + ring under the lens */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-full border border-accent/50"
        style={{ background: "radial-gradient(circle, rgba(246,88,2,.10), transparent 70%)" }}
      />

      {/* Lit copy, masked to the lens */}
      <div
        ref={litRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: "radial-gradient(circle 0px at 50% 50%, #000, transparent)" }}
      >
        <Wall lit />
      </div>

      <span className="type-small pointer-events-none absolute bottom-5 right-6 text-ink-faint md:right-10">
        <span className="pointer-fine:hidden">Tap to explore</span>
        <span className="hidden pointer-fine:inline">Move to explore</span>
      </span>
    </div>
  );
}
