"use client";

/**
 * Process `#process` (DESIGN.md §3.6, portvio Work Process sticky staircase).
 * Desktop: header sticky at 100px; 4 rows, each sticky at 240px with the card in column i
 * (cards 2 and 3 drop 25px), so cards pin left to right like stairs and release together.
 * Tab bar and glyph draw when the card pins. Tablet / phone: a plain list. Reduced motion: no pin.
 */
import { useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { processSection, processSteps, type ProcessStep } from "@/content/process";
import { cn } from "@/lib/cn";

const COL = ["lg:col-start-1", "lg:col-start-2", "lg:col-start-3", "lg:col-start-4"];

function Glyph({ kind }: { kind: ProcessStep["glyph"] }) {
  const p = { pathLength: 1, "data-draw": "" } as const;
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-ink-soft [&_[data-draw]]:[stroke-dasharray:1]"
    >
      {kind === "graph" && (
        <>
          <path {...p} d="M25 85 55 37M66 35l29 30M27 93l23 3M61 92l33-19" />
          <circle {...p} cx="20" cy="90" r="6" />
          <circle {...p} cx="60" cy="30" r="7" />
          <circle {...p} cx="100" cy="70" r="6" />
          <circle {...p} cx="56" cy="96" r="4" />
        </>
      )}
      {kind === "grid" && (
        <>
          <path {...p} d="M12 12h96v96H12z" />
          <path {...p} d="M12 44h96M12 76h96M44 12v96M76 12v96" />
          <path {...p} d="M12 108 108 12" />
        </>
      )}
      {kind === "brackets" && (
        <>
          <path {...p} d="M70 22H34v56h36" />
          <path {...p} d="M50 42h36v56H50" />
          <path {...p} d="M52 60h16" />
        </>
      )}
      {kind === "cycle" && (
        <>
          <path {...p} d="M98 60a38 38 0 1 1-11-26.9" />
          <path {...p} d="M90 18v16H74" />
          <path {...p} d="M40 78l16-16 10 8 16-18" />
          <path {...p} d="M72 52h10v10" />
        </>
      )}
    </svg>
  );
}

function Card({ step }: { step: ProcessStep }) {
  return (
    <article className="border-overlay edge-light relative w-full rounded-xl bg-surface">
      <span
        aria-hidden
        data-tab=""
        className="absolute left-[26px] top-0 h-[5px] w-[50px] origin-left rounded-pill bg-accent"
      />
      <header className="flex h-[90px] items-center gap-3 border-b border-line px-[26px] py-8">
        <span className="type-body text-ink-soft tabular">{step.index}</span>
        <h3 className="type-lead text-ink">{step.title}</h3>
      </header>
      <div
        className="m-[6px] flex flex-col rounded-lg px-5 py-[26px]"
        style={{ background: "linear-gradient(180deg, #303030 0%, #262525 100%)" }}
      >
        <span aria-hidden className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/20" />
          ))}
        </span>
        <div className="grid h-[150px] place-items-center">
          <Glyph kind={step.glyph} />
        </div>
        <p className="type-body text-ink">{step.copy}</p>
      </div>
    </article>
  );
}

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isDesktop }) => {
      const root = ref.current;
      if (!root || reduce || !isPlus) return;
      root.querySelectorAll<HTMLElement>("[data-process-row]").forEach((row) => {
        const tab = row.querySelector<HTMLElement>("[data-tab]");
        const paths = row.querySelectorAll<SVGElement>("[data-draw]");
        const tl = gsap.timeline({ paused: true });
        if (tab) tl.fromTo(tab, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "mask" }, 0);
        if (paths.length)
          tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power3.out", stagger: 0.08 }, 0);
        onceInView(row, () => tl.play(), {
          start: isDesktop ? "top top+=240" : "top 75%",
          settle: () => tl.progress(1),
        });
      });
    },
    { scope: ref },
  );

  return (
    <section id="process" aria-labelledby="process-title" className="section-layer section-pad">
      <div ref={ref} className="container-site">
        <SectionHeader
          eyebrow={processSection.eyebrow}
          title={processSection.title.join(" ")}
          titleId="process-title"
          variant="centred"
          className="heading-gap lg:motion-safe:sticky lg:motion-safe:top-[100px]"
        />
        <div className="flex flex-col gap-4 lg:gap-[50px]">
          {processSteps.map((step, i) => (
            <div
              key={step.index}
              data-process-row=""
              className="relative lg:pointer-events-none lg:grid lg:grid-cols-4 lg:gap-5 lg:motion-safe:sticky lg:motion-safe:top-[240px]"
            >
              <Reveal
                variant="card-tall"
                className={cn("pointer-events-auto", COL[i], (i === 1 || i === 2) && "lg:mt-[25px]")}
              >
                <Card step={step} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
