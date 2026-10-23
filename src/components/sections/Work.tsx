"use client";

/**
 * Selected Work `#work`: every project in a carousel the visitor moves by hand: swipe on touch,
 * drag with the mouse, the arrow buttons, or the keyboard on the focused track. Never autoplays and
 * never follows the page scroll, so the section keeps the same height however many projects there
 * are. Native horizontal scrolling with snap points; an orange progress line and a counter show
 * where you are. Cards are <WorkCard> (blueprint or smoke design). The /work page lists them all.
 */
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { WorkCard } from "@/components/work/WorkCard";
import { useReducedMotion } from "@/lib/hooks";
import { projects, work } from "@/content/projects";
import { cn } from "@/lib/cn";

const GAP = 20;
const pad = (i: number) => String(i + 1).padStart(2, "0");

function Arrow({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir > 0 ? "Next projects" : "Previous projects"}
      className="pressable grid size-12 place-items-center rounded-full border border-white/15 text-ink transition-[background-color,border-color,color,opacity] duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", dir < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const dragged = useRef(false);
  const [at, setAt] = useState({ i: 0, start: true, end: false });

  const slideStep = () => {
    const slide = trackRef.current?.querySelector<HTMLElement>("[data-slide]");
    return slide ? slide.offsetWidth + GAP : 1;
  };

  // Progress line, counter and arrow states follow the scroll position.
  const onScroll = () => {
    const t = trackRef.current;
    const thumb = thumbRef.current;
    if (!t || !thumb) return;
    const max = t.scrollWidth - t.clientWidth;
    const r = max > 0 ? t.scrollLeft / max : 0;
    const size = Math.min(1, t.clientWidth / t.scrollWidth);
    thumb.style.width = `${size * 100}%`;
    thumb.style.left = `${r * (1 - size) * 100}%`;
    const i = Math.min(projects.length - 1, Math.round(t.scrollLeft / slideStep()));
    const next = { i, start: t.scrollLeft < 4, end: t.scrollLeft > max - 4 };
    setAt((cur) => (cur.i === next.i && cur.start === next.start && cur.end === next.end ? cur : next));
  };

  // Size the progress line on load and whenever the track resizes.
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(t);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onScroll only reads refs
  }, []);

  const step = (d: 1 | -1) =>
    trackRef.current?.scrollBy({ left: d * slideStep(), behavior: reduce ? "auto" : "smooth" });

  const endDrag = () => {
    drag.current = null;
    delete trackRef.current?.dataset.dragging; // snapping resumes and settles on a card
  };

  return (
    <section id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" />
        <Divider variant="solid" draw className="heading-gap mt-[30px] md:mt-10" />

        {/* The track: native horizontal scroll with snap; the mouse can drag it too */}
        <div
          ref={trackRef}
          role="region"
          aria-label="Projects"
          tabIndex={0}
          onScroll={onScroll}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            const t = trackRef.current;
            if (!t || e.pointerType !== "mouse" || e.button !== 0) return;
            drag.current = { x: e.clientX, left: t.scrollLeft };
            dragged.current = false;
          }}
          onPointerMove={(e) => {
            const t = trackRef.current;
            const d = drag.current;
            if (!t || !d) return;
            const dx = e.clientX - d.x;
            if (!dragged.current && Math.abs(dx) > 5) {
              dragged.current = true;
              t.dataset.dragging = "";
            }
            if (dragged.current) t.scrollLeft = d.left - dx;
          }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={(e) => {
            if (!dragged.current) return;
            dragged.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2 outline-none [scrollbar-width:none] data-dragging:cursor-grabbing data-dragging:snap-none data-dragging:select-none focus-visible:ring-1 focus-visible:ring-accent/60 [&::-webkit-scrollbar]:hidden"
          style={{ gap: GAP }}
        >
          {projects.map((p, i) => (
            <div key={p.slug} data-slide="" className="w-[84vw] shrink-0 snap-start sm:w-[58vw] md:w-[42vw] lg:w-[min(31vw,460px)]">
              <WorkCard
                project={p}
                number={pad(i)}
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 42vw, 84vw"
                className="aspect-[4/5] w-full"
              />
            </div>
          ))}
        </div>

        {/* Controls: counter, progress line, arrows */}
        <div className="mt-8 flex items-center gap-5 md:mt-10 md:gap-8">
          <span className="type-small tabular shrink-0 text-ink">
            {pad(at.i)} <span className="text-ink-soft">/ {pad(projects.length - 1)}</span>
          </span>
          <span aria-hidden className="relative h-px flex-1 bg-line">
            <span ref={thumbRef} className="absolute inset-y-0 left-0 bg-accent transition-[left,width] duration-150 ease-out" style={{ width: "30%" }} />
          </span>
          <div className="flex shrink-0 gap-2">
            <Arrow dir={-1} disabled={at.start} onClick={() => step(-1)} />
            <Arrow dir={1} disabled={at.end} onClick={() => step(1)} />
          </div>
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <PrimaryButton href="/work" transitionTitle="All Projects">
            {work.viewAll}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
