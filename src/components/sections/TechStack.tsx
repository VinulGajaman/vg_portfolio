"use client";

/**
 * Tech Stack `#stack` (DESIGN.md §3.4, portvio Partners). Decorative logo marquee (aria-hidden,
 * 50px/s with velocity skew) plus the interactive <SkillsIndex> panel below it.
 */
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { SkillsIndex } from "@/components/ui/SkillsIndex";
import { useMedia } from "@/components/providers/MediaProvider";
import { stack, stackTiles, type StackTile } from "@/content/stack";

function Tile({ tile }: { tile: StackTile }) {
  const logo = useMedia(tile.logo);
  return (
    <div className="group border-overlay edge-light flex h-[120px] w-[160px] flex-col items-center justify-center gap-3 rounded-lg bg-surface after:transition-colors after:duration-[180ms] after:ease-out hover:after:border-accent/40 md:h-[160px] md:w-[220px] lg:h-[200px] lg:w-[280px]">
      {logo ? (
        <>
          <MediaSlot
            id={tile.logo}
            alt=""
            className="h-7 w-[96px] text-ink opacity-70 transition-[opacity,color] duration-[180ms] ease-out group-hover:text-accent group-hover:opacity-100 md:h-10 md:w-[140px]"
          />
          <span className="type-small text-[12px] text-ink-soft">{tile.name}</span>
        </>
      ) : (
        <span className="px-3 text-center font-display text-[18px] font-semibold md:text-[24px] leading-[1.1] text-ink opacity-70 transition-[opacity,color] duration-[180ms] ease-out group-hover:text-accent group-hover:opacity-100">
          {tile.name}
        </span>
      )}
    </div>
  );
}

export default function TechStack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="section-layer px-0 pb-10 pt-[60px]">
      <Reveal delay={0.2} className="flex items-center justify-between gap-4 px-[var(--gutter)]">
        <Eyebrow animate={false}>{stack.eyebrow}</Eyebrow>
        <h2 id="stack-title" className="type-body text-ink max-md:sr-only">
          {stack.centre}
        </h2>
        <ArrowIcon kind="hooked" size={24} className="text-ink" />
      </Reveal>

      <div aria-hidden className="mt-8">
        <Marquee speed={50} gap={6} mask="tiles">
          {stackTiles.map((t) => (
            <li key={t.logo}>
              <Tile tile={t} />
            </li>
          ))}
        </Marquee>
      </div>

      <div className="container-site mt-10">
        <SkillsIndex />
      </div>
    </section>
  );
}
