"use client";

/**
 * About `#about` (DESIGN.md §3.3). Drives the hero shrink (its height is the shrink range) and
 * carries the slanted dark <Curtain> (skewY 0 → 7°, y 0 → −220) as its first child; content at z 4.
 */
import { Curtain } from "@/components/motion/Curtain";
import { Reveal } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ScrollFillText } from "@/components/motion/ScrollFillText";
import { Counter } from "@/components/motion/Counter";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Divider } from "@/components/ui/Divider";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useMedia } from "@/components/providers/MediaProvider";
import { about, ctaLabels } from "@/content/site";

export default function About() {
  const cv = useMedia("cv-pdf");

  return (
    <section id="about" aria-labelledby="about-title" className="section-layer px-[var(--gutter)] py-[40px]">
      <Curtain />
      <div className="relative z-[4] mx-auto flex max-w-[1440px] flex-col gap-[50px] lg:flex-row lg:items-start lg:gap-[100px]">
        {/* Portrait: desktop left, tablet top, phone last */}
        <Reveal variant="from-left" delay={0.2} className="order-last w-full md:order-first lg:w-[450px] lg:shrink-0">
          <div className="group relative h-[420px] overflow-hidden rounded-2xl md:h-[400px] lg:h-[550px]">
            <ParallaxImage speed={0.1} className="absolute inset-0">
              <div className="absolute inset-0 transition-[scale] duration-[630ms] ease-spring-ui pointer-fine:group-hover:scale-[1.04]">
                <MediaSlot id={about.media} fill sizes="(min-width: 1200px) 450px, 100vw" />
              </div>
            </ParallaxImage>
          </div>
        </Reveal>

        {/* Copy column */}
        <div className="flex min-w-0 flex-1 flex-col lg:max-w-[850px]">
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <Reveal delay={0.3} className="mt-5">
            <ScrollFillText as="h2" id="about-title" className="type-statement">
              {about.statement.map((s, i) =>
                "accent" in s && s.accent ? (
                  <span key={i} className="text-accent">
                    {s.text}
                  </span>
                ) : (
                  <span key={i}>{s.text}</span>
                ),
              )}
            </ScrollFillText>
          </Reveal>

          <ul className="mt-[50px] flex flex-col gap-[35px]">
            {about.stats.map((s, i) => (
              <li key={s.label} className="flex flex-col gap-[35px]">
                <Reveal delay={i === 0 ? 0.3 : 0.4} className="flex max-w-[390px] items-center justify-between gap-4">
                  <span className="flex items-center gap-4">
                    <span className="type-number inline-flex min-w-[118px] justify-center rounded-lg bg-surface px-3 py-[10px] text-ink">
                      <Counter to={s.value} suffix={s.suffix} duration={1.4} />
                    </span>
                    <span className="type-ui text-ink">{s.label}</span>
                  </span>
                  <ArrowIcon kind="hooked" size={24} className="shrink-0 rotate-90 text-ink" />
                </Reveal>
                <Divider draw className="max-w-[400px]" />
              </li>
            ))}
          </ul>

          <Reveal
            delay={0.3}
            className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <p className="type-lead max-w-[540px] text-ink-soft">{about.paragraph}</p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <PrimaryButton href="#contact">{ctaLabels.contact}</PrimaryButton>
              {cv && (
                <PrimaryButton variant="white" href={cv.src} download>
                  {ctaLabels.cv}
                </PrimaryButton>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
