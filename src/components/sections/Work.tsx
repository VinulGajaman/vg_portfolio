"use client";

/**
 * Selected Work `#work`: a cinematic project reel that keeps the same height however many projects
 * there are. One stage shows the active project; a numbered index lists them all.
 *   - Switching: click / tap an index entry or rail number, the stage arrows, swipe or drag the
 *     stage, ←/→ on the index, or autoplay (AUTO_S, an orange progress line on the active entry;
 *     runs only while the section is on screen, never for reduced motion; any switch restarts it).
 *   - Transition: the old cover splits into SLICES vertical strips that slide away, alternately up
 *     and down, over the new cover settling from a slight zoom; the title decodes (<Decode>) and the
 *     text rises in. Reduced motion: a plain crossfade.
 *   - Desktop (lg): index on the left, stage on the right with the text over the cover.
 *     Phone / tablet: stage on top, the text under it (all blocks share one grid cell, so the
 *     height never jumps), and a row of numbers below.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Tag } from "@/components/ui/Tag";
import { Decode } from "@/components/ui/Decode";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { projects, work, type Project } from "@/content/projects";
import { ctaLabels } from "@/content/site";
import { cn } from "@/lib/cn";

const AUTO_S = 7;
const SLICES = 7;
const n = projects.length;
const wrap = (i: number) => ((i % n) + n) % n;
const pad = (i: number) => String(i + 1).padStart(2, "0");

function Cover({ slug }: { slug: string }) {
  return <MediaSlot id={`work-${slug}-cover`} fill alt="" sizes="(min-width: 1200px) 900px, 100vw" />;
}

/** One project's text. Every block sits in the same grid cell; only the active one is visible. */
function Info({ p, on, reduce, overlay }: { p: Project; on: boolean; reduce: boolean; overlay?: boolean }) {
  return (
    <div
      data-work-info={on ? "on" : undefined}
      aria-hidden={!on}
      className={cn(
        "flex flex-col gap-4 [grid-area:1/1] transition-opacity duration-300",
        on ? "opacity-100" : "invisible opacity-0",
        overlay && "max-w-[620px]",
      )}
    >
      <div data-fx="" className="flex flex-wrap items-center gap-[6px]">
        {p.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <span className="type-number ml-auto text-ink lg:ml-3">{p.year}</span>
      </div>
      <h3 className="type-h2 text-ink">{on ? <Decode key={p.slug} text={p.title} enabled={!reduce} /> : p.title}</h3>
      <p data-fx="" className={cn("type-body max-w-[560px]", overlay ? "text-ink" : "text-ink-soft")}>
        {p.description}
      </p>
      <div data-fx="" className="pointer-events-auto pt-2">
        <PrimaryButton variant="white" href={`/work/${p.slug}`} transitionTitle={p.title}>
          {ctaLabels.project}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir > 0 ? "Next project" : "Previous project"}
      className="pressable grid size-11 place-items-center rounded-full border border-white/15 bg-canvas/55 text-ink backdrop-blur-md transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink"
    >
      <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", dir < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const activeRef = useRef(0);
  const dirRef = useRef(1);
  const sectionRef = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const first = useRef(true);

  const go = useCallback((to: number, dir?: number) => {
    const next = wrap(to);
    const cur = activeRef.current;
    if (next === cur) return;
    dirRef.current = dir ?? (next > cur ? 1 : -1);
    activeRef.current = next;
    setPrev(cur);
    setActive(next);
  }, []);
  const step = useCallback((d: 1 | -1) => go(activeRef.current + d, d), [go]);

  // Autoplay only while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The switch: slices of the old cover slide away, the new cover settles, the text rises in.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ctx = gsap.context(() => {
      const base = baseRef.current;
      if (base) {
        if (reduce) gsap.fromTo(base, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none" });
        else gsap.fromTo(base, { scale: 1.14 }, { scale: 1, duration: 1.5, ease: "expo.out" });
      }
      const strips = slicesRef.current ? Array.from(slicesRef.current.children) : [];
      if (strips.length) {
        gsap.to(strips, {
          yPercent: (i) => (i % 2 ? 104 : -104),
          duration: 0.95,
          ease: "expo.inOut",
          stagger: { each: 0.045, from: dirRef.current > 0 ? "start" : "end" },
          onComplete: () => setPrev(null),
        });
      }
      if (!reduce) {
        const fx = sectionRef.current?.querySelectorAll('[data-work-info="on"] [data-fx]');
        if (fx?.length) gsap.from(fx, { y: 18, autoAlpha: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, delay: 0.3 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [active, reduce]);

  const playing = inView && !reduce;
  const progress = (cls: string) =>
    reduce ? null : (
      <span
        key={`p${active}`}
        aria-hidden
        className={cn("absolute left-0 origin-left bg-accent animate-[work-progress_linear_forwards]", cls)}
        style={{ animationDuration: `${AUTO_S}s`, animationPlayState: playing ? "running" : "paused" } as CSSProperties}
        onAnimationEnd={() => step(1)}
      />
    );

  const p = projects[active];

  return (
    <section ref={sectionRef} id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" />
        <Divider variant="solid" draw className="heading-gap mt-[30px] md:mt-10" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,11fr)] lg:gap-12">
          {/* Desktop index: every project, the active one lit with the autoplay progress line */}
          <nav
            aria-label="Projects"
            data-lenis-prevent=""
            className="hidden overflow-y-auto lg:block lg:h-0 lg:min-h-full"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") step(1);
              else if (e.key === "ArrowUp" || e.key === "ArrowLeft") step(-1);
              else return;
              e.preventDefault();
            }}
          >
            <ul>
              {projects.map((q, i) => {
                const on = i === active;
                return (
                  <li key={q.slug}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={on || undefined}
                      className="group relative grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-baseline gap-4 py-6 text-left outline-none"
                    >
                      <span className={cn("type-small tabular transition-colors duration-300", on ? "text-accent" : "text-ink-soft")}>
                        {pad(i)}
                      </span>
                      <span
                        className={cn(
                          "type-lead truncate transition-[color,translate] duration-500",
                          on ? "translate-x-2 text-ink" : "text-ink-soft group-hover:text-ink group-focus-visible:text-ink",
                        )}
                      >
                        {q.title}
                      </span>
                      <span className="type-small tabular text-ink-soft">{q.year}</span>
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
                      {on && progress("bottom-0 h-px w-full")}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-6">
            {/* Stage */}
            <div
              className="@container relative aspect-[4/3] touch-pan-y select-none overflow-hidden rounded-2xl bg-surface md:aspect-[16/10]"
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={(e) => (drag.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={(e) => {
                const d = drag.current;
                drag.current = null;
                if (!d) return;
                const dx = e.clientX - d.x;
                if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - d.y) * 1.2) {
                  swiped.current = true;
                  step(dx < 0 ? 1 : -1);
                }
              }}
              onPointerCancel={() => (drag.current = null)}
              onClickCapture={(e) => {
                if (!swiped.current) return;
                swiped.current = false;
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <TransitionLink
                href={`/work/${p.slug}`}
                transitionTitle={p.title}
                tabIndex={-1}
                aria-hidden
                data-cursor="view"
                data-cursor-label="View"
                className="absolute inset-0 block"
              >
                <div key={active} ref={baseRef} className="absolute inset-0">
                  <Cover slug={p.slug} />
                </div>
                {prev !== null && !reduce && (
                  <div key={`s${prev}-${active}`} ref={slicesRef} className="pointer-events-none absolute inset-0">
                    {Array.from({ length: SLICES }, (_, i) => (
                      <div
                        key={i}
                        className="absolute inset-y-0 overflow-hidden"
                        style={{ left: `calc(100cqw * ${i} / ${SLICES})`, width: `calc(100cqw / ${SLICES} + 1px)` }}
                      >
                        <div className="absolute inset-y-0" style={{ left: `calc(-100cqw * ${i} / ${SLICES})`, width: "100cqw" }}>
                          <Cover slug={projects[prev].slug} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TransitionLink>

              {/* Desktop: text over the cover */}
              <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-canvas-deep/90 via-canvas-deep/35 to-transparent lg:block" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-10 lg:grid">
                {projects.map((q, i) => (
                  <Info key={q.slug} p={q} on={i === active} reduce={reduce} overlay />
                ))}
              </div>

              {/* Counter + arrows */}
              <span className="type-small tabular pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-canvas/55 px-3 py-1 text-ink backdrop-blur-md md:left-6 md:top-6">
                {pad(active)} / {pad(n - 1)}
              </span>
              <div className="absolute right-4 top-4 flex gap-2 md:right-6 md:top-6">
                <Arrow dir={-1} onClick={() => step(-1)} />
                <Arrow dir={1} onClick={() => step(1)} />
              </div>
            </div>

            {/* Phone / tablet: text under the stage, then the numbers */}
            <div className="grid lg:hidden">
              {projects.map((q, i) => (
                <Info key={q.slug} p={q} on={i === active} reduce={reduce} />
              ))}
            </div>
            <div className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] lg:hidden">
              {projects.map((q, i) => {
                const on = i === active;
                return (
                  <button
                    key={q.slug}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show ${q.title}`}
                    aria-current={on || undefined}
                    className={cn(
                      "type-small tabular relative h-9 shrink-0 overflow-hidden rounded-full border px-4 transition-colors duration-300",
                      on ? "border-accent/60 text-ink" : "border-line text-ink-soft",
                    )}
                  >
                    {on && progress("inset-y-0 w-full opacity-25")}
                    <span className="relative">{pad(i)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
