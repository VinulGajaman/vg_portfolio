"use client";

/**
 * Selected Work `#work` (DESIGN.md §3.7, U9). Stacking deck via <StackCards>: each card is sticky
 * at 100 + i·24px and scales back (.94, dim .55, image 1.08) as the next arrives; the last dwells.
 * Hover (fine pointer): hover image / preview crossfade + zoom, cover follows the pointer ±12px,
 * title roll, cursor "view", button fill from anywhere on the card.
 */
import { useRef } from "react";
import { StackCards } from "@/components/motion/StackCards";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { RollText } from "@/components/motion/RollText";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Tag } from "@/components/ui/Tag";
import { Chip } from "@/components/ui/Chip";
import { useMedia } from "@/components/providers/MediaProvider";
import { gsap, useMotion } from "@/lib/gsap";
import { projects, work, type Project } from "@/content/projects";
import { ctaLabels } from "@/content/site";
import { cn } from "@/lib/cn";

function HoverLayer({ slug }: { slug: string }) {
  const preview = useMedia(`work-${slug}-preview`);
  const hover = useMedia(`work-${slug}-hover`);
  const id = preview ? `work-${slug}-preview` : hover ? `work-${slug}-hover` : null;
  if (!id) return null;
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-0 transition-[opacity,scale] duration-[630ms] ease-spring-ui motion-reduce:hidden pointer-fine:group-hover:scale-110 pointer-fine:group-hover:opacity-100"
    >
      <MediaSlot id={id} fill alt="" sizes="(min-width: 1200px) 840px, 100vw" />
    </div>
  );
}

function WorkCard({ project, index }: { project: Project; index: number }) {
  const imageRight = index % 2 === 0;
  return (
    <TransitionLink
      href={`/work/${project.slug}`}
      transitionTitle={project.title}
      data-cursor="view"
      data-cursor-label="View"
      data-roll-parent=""
      data-work-card=""
      className={cn(
        "group stack-shadow border-overlay relative flex flex-col overflow-hidden rounded-2xl bg-surface",
        "lg:h-[min(640px,calc(100svh-260px))]",
        imageRight ? "lg:flex-row" : "lg:flex-row-reverse",
      )}
    >
      {/* Info column */}
      <div className="relative z-[1] flex flex-col justify-between gap-8 p-[30px] lg:w-[520px] lg:shrink-0">
        <div className="flex items-start justify-between gap-4">
          <ul className="flex min-w-0 flex-1 flex-wrap gap-[6px]">
            {project.tags.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
          <span className="type-number shrink-0 text-ink">{project.year}</span>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="type-h2 text-ink">
            {project.title.split(" ").map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                <RollText size="lg">{w}</RollText>
              </span>
            ))}
          </h3>
          <p className="type-body text-ink">{project.description}</p>
          <p className="type-small text-ink-soft">{project.company}</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <ul className="flex flex-wrap gap-[6px]">
            {project.stack.map((s) => (
              <li key={s}>
                <Chip>{s}</Chip>
              </li>
            ))}
          </ul>
          <PrimaryButton variant="white" asSpan className="shrink-0">
            {ctaLabels.project}
          </PrimaryButton>
        </div>
      </div>

      {/* Image well: top on phone / tablet, side on desktop (zig-zag) */}
      <div className="relative order-first m-[6px] aspect-[4/3] overflow-hidden rounded-xl md:aspect-[16/10] lg:order-none lg:aspect-auto lg:flex-1">
        <div data-stack-image="" className="absolute inset-0">
          <div data-follow="" className="absolute -inset-3">
            <ParallaxImage speed={0.1} className="absolute inset-0">
              <MediaSlot
                id={`work-${project.slug}-cover`}
                fill
                alt=""
                sizes="(min-width: 1200px) 840px, 100vw"
              />
            </ParallaxImage>
            <HoverLayer slug={project.slug} />
          </div>
        </div>
      </div>
    </TransitionLink>
  );
}

export default function Work() {
  const ref = useRef<HTMLDivElement>(null);

  // Cover follows the pointer slightly, opposite direction (±12px, quickTo 0.8s power3.out).
  useMotion(
    ({ fine, reduce }) => {
      const root = ref.current;
      if (!root || !fine || reduce) return;
      const cleanups: (() => void)[] = [];
      root.querySelectorAll<HTMLElement>("[data-work-card]").forEach((card) => {
        const follow = card.querySelector<HTMLElement>("[data-follow]");
        if (!follow) return;
        const xTo = gsap.quickTo(follow, "x", { duration: 0.8, ease: "power3.out" });
        const yTo = gsap.quickTo(follow, "y", { duration: 0.8, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const r = card.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          xTo(-nx * 12);
          yTo(-ny * 12);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        card.addEventListener("pointermove", move, { passive: true });
        card.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      });
      return () => cleanups.forEach((c) => c());
    },
    { scope: ref },
  );

  return (
    <section id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div ref={ref} className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" />
        <Divider variant="solid" draw className="heading-gap mt-[30px] md:mt-10" />
        {/* Short dwell: with the Impact rail hidden, 40svh left a ~500px blank before Experience. */}
        <StackCards dwell="15svh">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </StackCards>
      </div>
    </section>
  );
}
