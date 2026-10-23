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
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { CardText, type ProjectCardProps } from "./CardText";

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

export function SmokeCard({ project: p, number, size = "sm", sizes = "(min-width: 1024px) 40vw, 100vw", className }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

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
      <CardText p={p} number={number} size={size} revealed={revealed} reduce={reduce} />
    </TransitionLink>
  );
}
