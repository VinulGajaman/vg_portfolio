"use client";

/**
 * <SmokeCard>: a project card whose cover is born from smoke. The first time the card comes into
 * view, three smoke-shaped masks (/textures/smoke-mask.webp, a billowy cloud with a solid core)
 * grow from nothing until they cover the card, so the cover appears through billowing smoke while
 * an orange smoke veil (<CardSmoke>) over it thins away and the title decodes into place.
 * Afterwards the veil returns on hover (faintly always on phones) and the cover slowly zooms.
 * Reduced motion: the card is simply shown.
 */
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { CardSmoke } from "@/components/motion/CardSmoke";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Tag } from "@/components/ui/Tag";
import { Decode } from "@/components/ui/Decode";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import type { Project } from "@/content/projects";
import { ctaLabels } from "@/content/site";
import { cn } from "@/lib/cn";

const MASK = "url(/textures/smoke-mask.webp)";
/** Three smoke clouds; `--m` grows them from 0% until they cover the card. */
const MASK_PROPS: Record<string, string> = {
  "--m": "0%",
  "image": `${MASK}, ${MASK}, ${MASK}`,
  "repeat": "no-repeat",
  "position": "22% 78%, 80% 24%, 50% 50%",
  "size": "var(--m), calc(var(--m) * 0.85), calc(var(--m) * 1.2)",
};
function setMask(el: HTMLElement, on: boolean) {
  for (const [k, v] of Object.entries(MASK_PROPS)) {
    if (k.startsWith("--")) el.style.setProperty(k, v);
    else for (const pre of ["mask-", "-webkit-mask-"]) el.style.setProperty(pre + k, on ? v : k === "image" ? "none" : "");
  }
}

export function SmokeCard({
  project: p,
  number,
  size = "sm",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  className,
}: {
  project: Project;
  number: string;
  size?: "lg" | "sm";
  sizes?: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const shown = revealed || reduce;

  useEffect(() => {
    const card = ref.current;
    const media = card?.querySelector<HTMLElement>("[data-smoke-media]");
    const veil = card?.querySelector<HTMLElement>("[data-smoke-veil]");
    if (!card || !media || !veil || reduce) return;
    const rest = parseFloat(getComputedStyle(veil).opacity) || 0;
    setMask(media, true);
    gsap.set(veil, { opacity: 1 });
    let tl: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setRevealed(true);
        tl = gsap
          .timeline()
          .to(media, { "--m": "460%", duration: 2.2, ease: "power2.inOut" }, 0)
          .call(() => setMask(media, false))
          .to(veil, { opacity: rest, duration: 2.4, ease: "power2.out", clearProps: "opacity" }, 0.7);
      },
      { threshold: 0.35 },
    );
    io.observe(card);
    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, [reduce]);

  return (
    <TransitionLink
      ref={ref}
      href={`/work/${p.slug}`}
      transitionTitle={p.title}
      data-cursor="view"
      data-cursor-label="View"
      className={cn("group border-overlay relative block overflow-hidden rounded-2xl bg-canvas-deep", className)}
    >
      <div data-smoke-media="" className="absolute inset-0">
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out pointer-fine:group-hover:scale-[1.06]">
          <MediaSlot id={`work-${p.slug}-cover`} fill alt="" sizes={sizes} />
        </div>
      </div>
      <div
        data-smoke-veil=""
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 max-md:opacity-40 pointer-fine:group-hover:opacity-70"
      >
        <CardSmoke density={size === "lg" ? 1.6 : 1.3} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas-deep/95 via-canvas-deep/35 to-transparent" />

      <span className="type-small tabular absolute left-5 top-5 rounded-full border border-white/15 bg-canvas/55 px-3 py-1 text-ink backdrop-blur-md md:left-6 md:top-6">
        {number}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-[6px]">
          {p.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          <span className="type-number ml-auto text-ink">{p.year}</span>
        </div>
        <h3 className={cn(size === "lg" ? "type-h2" : "type-statement", "text-ink transition-opacity duration-500", !shown && "opacity-0")}>
          <Decode text={p.title} enabled={revealed && !reduce} delay={500} />
        </h3>
        {size === "lg" && <p className="type-body max-w-[540px] text-ink-soft max-md:hidden">{p.description}</p>}
        <span className="type-ui flex items-center gap-2 text-ink">
          {ctaLabels.project}
          <svg viewBox="0 0 24 24" aria-hidden className="size-4 text-accent transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </TransitionLink>
  );
}
