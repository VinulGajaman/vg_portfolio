"use client";

/** Hero STUB (DESIGN.md §3.2). The hero section agent replaces this file entirely. */
import { StickyHero } from "@/components/motion/StickyHero";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Wordmark } from "@/components/ui/Wordmark";
import { hero } from "@/content/site";

export default function Hero() {
  return (
    <StickyHero aria-labelledby="hero-title">
      <div className="absolute inset-0" data-hero-depth="0.31" data-hero-depth-scale="1.06">
        <MediaSlot id="hero-portrait" fill priority preloadMedia className="hidden md:block" />
        <MediaSlot id="hero-portrait-mobile" fill priority className="md:hidden" />
      </div>
      <div className="relative z-[1] flex flex-col gap-[30px]">
        <h1 id="hero-title">
          <span className="sr-only">{hero.srHeading}</span>
          <Wordmark />
        </h1>
        <p className="type-lead max-w-[540px] text-ink">{hero.paragraph}</p>
      </div>
    </StickyHero>
  );
}
