"use client";

/**
 * Tech Stack `#stack` (DESIGN.md §3.4, portvio Partners). Decorative logo marquee (aria-hidden,
 * 50px/s with velocity skew; inline monochrome marks from content/stack-logos.ts) plus the skills block below it (see SKILLS_VARIANT).
 */
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { SkillsCarousel } from "@/components/ui/SkillsCarousel";
import { SkillsFlashlight } from "@/components/ui/SkillsFlashlight";
import { stack, stackTiles, type StackTile } from "@/content/stack";
import { stackLogos } from "@/content/stack-logos";
import { cn } from "@/lib/cn";

function Tile({ tile }: { tile: StackTile }) {
  const logo = stackLogos[tile.logo];
  // Logo and label share the text tile's look: white at .7, orange at full opacity on hover.
  const tint =
    "text-ink opacity-70 transition-[opacity,color] duration-[180ms] ease-out group-hover:text-accent group-hover:opacity-100";
  return (
    <div className="group border-overlay edge-light flex h-[120px] w-[160px] flex-col items-center justify-center gap-3 rounded-lg bg-surface after:transition-colors after:duration-[180ms] after:ease-out hover:after:border-accent/40 md:h-[160px] md:w-[220px] md:gap-4 lg:h-[200px] lg:w-[280px]">
      {logo ? (
        <>
          <svg
            viewBox={logo.viewBox}
            fill="currentColor"
            aria-hidden
            className={cn("h-9 w-auto md:h-12 lg:h-14", tint)}
            dangerouslySetInnerHTML={{ __html: logo.body }}
          />
          <span
            className={cn(
              "whitespace-nowrap font-display text-[14px] font-semibold leading-[1.1] md:text-[17px] lg:text-[20px]",
              tint,
            )}
          >
            {tile.name}
          </span>
        </>
      ) : (
        <span className={cn("px-3 text-center font-display text-[18px] font-semibold leading-[1.1] md:text-[24px]", tint)}>
          {tile.name}
        </span>
      )}
    </div>
  );
}

/**
 * Skills section variant while Vinul compares ideas. "carousel" (the 3D ring) is Vinul's
 * pick; the others are final-round candidates. Delete the losers once one is chosen.
 */
const SKILLS_VARIANT: "carousel" | "flashlight" = "flashlight";
const Skills = { carousel: SkillsCarousel, flashlight: SkillsFlashlight }[SKILLS_VARIANT];

export default function TechStack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="section-layer px-0 pb-10 pt-[60px]">
      <Reveal delay={0.2} className="flex items-center justify-between gap-4 px-[var(--gutter)]">
        <Eyebrow animate={false}>{stack.eyebrow}</Eyebrow>
        {/* Visually removed per Vinul; kept for screen readers as the section's heading. */}
        <h2 id="stack-title" className="sr-only">
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

      <div className="container-site mt-12 md:mt-16">
        <Skills />
      </div>
    </section>
  );
}
