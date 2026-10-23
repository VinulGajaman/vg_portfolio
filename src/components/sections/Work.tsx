"use client";

/**
 * Selected Work `#work`: an infinite, center-focus project slider. The active card sits large in
 * the middle; its neighbours are smaller and dimmed on each side (a click on one brings it to the
 * middle). It advances by itself one card every AUTO_MS, looping forever, and can be moved by hand:
 * swipe on touch, drag with the mouse, or the arrows. Any manual move restarts the timer; it pauses
 * while being dragged and while off screen. Reduced motion: no autoplay, instant moves.
 * Infinite without clones: `idx` is an unbounded index and only the cards around it are rendered,
 * each positioned at k × step on a track that slides by CSS transform, so it never has to jump.
 * Cards are <WorkCard> (blueprint or smoke design); the /work page lists every project.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { WorkCard } from "@/components/work/WorkCard";
import { useReducedMotion } from "@/lib/hooks";
import { projects, work } from "@/content/projects";
import { cn } from "@/lib/cn";

const AUTO_MS = 2300;
const WINDOW = 3; // cards rendered on each side of the active one
const n = projects.length;
const wrap = (i: number) => ((i % n) + n) % n;
const pad = (i: number) => String(i + 1).padStart(2, "0");

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir > 0 ? "Next project" : "Previous project"}
      className="pressable grid size-12 place-items-center rounded-full border border-white/15 text-ink transition-[background-color,border-color,color] duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink"
    >
      <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", dir < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; t: number; dx: number; active: boolean } | null>(null);
  const dragged = useRef(false);

  // Autoplay: one step every AUTO_MS while on screen; any change of idx restarts the wait.
  useEffect(() => {
    if (!inView || dragging || reduce) return;
    const t = window.setTimeout(() => !document.hidden && setIdx((i) => i + 1), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [idx, inView, dragging, reduce]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = () => {
    const t = trackRef.current;
    const card = t?.querySelector<HTMLElement>("[data-slide]");
    if (!t || !card) return 1;
    return card.offsetWidth + parseFloat(getComputedStyle(t).getPropertyValue("--g"));
  };
  const setDx = (px: number) => trackRef.current?.style.setProperty("--dx", `${px}px`);

  const ks = Array.from({ length: WINDOW * 2 + 1 }, (_, j) => idx - WINDOW + j);

  return (
    <section id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" />
        <Divider variant="solid" draw className="heading-gap mt-[30px] md:mt-10" />
      </div>

      {/* Stage: full width so the side cards reach the screen edges */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        className="@container relative touch-pan-y select-none overflow-hidden py-4"
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, active: false };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (!d.active) {
            if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
            d.active = true;
            dragged.current = true;
            setDragging(true);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
          d.dx = dx;
          setDx(dx);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d?.active) return;
          const s = step();
          const v = d.dx / Math.max(1, performance.now() - d.t); // px per ms
          let moves = Math.round(-d.dx / s);
          if (moves === 0 && (Math.abs(d.dx) > 40 || Math.abs(v) > 0.4)) moves = d.dx < 0 ? 1 : -1;
          setDragging(false);
          setDx(0);
          setIdx((i) => i + moves);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
          setDx(0);
        }}
        onClickCapture={(e) => {
          if (!dragged.current) return;
          dragged.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          ref={trackRef}
          className={cn(
            "relative [--g:14px] [--w:72vw] md:[--g:28px] md:[--w:44vw] lg:[--g:32px] lg:[--w:min(34vw,470px)]",
            !dragging && !reduce && "transition-transform duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)]",
          )}
          style={
            {
              height: "calc(var(--w) * 1.25)",
              transform: `translate3d(calc(50cqw - (var(--w) + var(--g)) * ${idx} - var(--w) / 2 + var(--dx, 0px)), 0, 0)`,
            } as CSSProperties
          }
        >
          {ks.map((k) => {
            const off = k - idx;
            const p = projects[wrap(k)];
            return (
              <div
                key={k}
                data-slide=""
                className={cn(
                  "absolute top-0 h-full w-[var(--w)] origin-center",
                  !reduce && "transition-[scale,opacity,filter] duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)]",
                  off === 0 ? "scale-100 opacity-100" : Math.abs(off) === 1 ? "scale-[.86] opacity-45 brightness-75" : "scale-[.75] opacity-0",
                )}
                style={{ left: `calc((var(--w) + var(--g)) * ${k})` }}
                onClickCapture={(e) => {
                  if (off === 0 || dragged.current) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(k);
                }}
              >
                <WorkCard
                  project={p}
                  number={pad(wrap(k))}
                  active={off === 0}
                  sizes="(min-width: 1024px) 470px, (min-width: 768px) 44vw, 72vw"
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="container-site mt-8 flex items-center justify-between gap-4 md:mt-10">
        <PrimaryButton href="/work" transitionTitle="All Projects">
          {work.viewAll}
        </PrimaryButton>
        <div className="flex shrink-0 gap-2">
          <Arrow dir={-1} onClick={() => setIdx((i) => i - 1)} />
          <Arrow dir={1} onClick={() => setIdx((i) => i + 1)} />
        </div>
      </div>
    </section>
  );
}
