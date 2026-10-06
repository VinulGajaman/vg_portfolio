"use client";

/**
 * Case-study title row + banner (DESIGN.md §4.1 items 1 and 3, §4.2).
 *  Title    x −30 → 0 + autoAlpha (1.007s springHero, delay .2) wrapping <RevealText chars>
 *  Summary  <BlurText> per word from .48s
 *  Banner   <MaskReveal> (bottom clip, inner 1.3 → 1) at .8s, then <ScrollZoom> 1.2 → 1 with
 *           parallax while scrolling (U11)
 * All wait for the intro gate, which opens 0.35s into a <PageTransition> reveal.
 */
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { DUR, SPRING_SAMPLES } from "@/lib/motion-tokens";
import { useIntro } from "@/lib/store";
import { RevealText } from "@/components/motion/RevealText";
import { BlurText } from "@/components/motion/BlurText";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { ScrollZoom } from "@/components/motion/ScrollZoom";
import { MediaSlot } from "@/components/ui/MediaSlot";

export function CaseHero({ title, summary }: { title: string; summary: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const introOpen = useRef(false);

  useMotion(
    ({ reduce }) => {
      const el = ref.current;
      if (!el) return;
      const tl = gsap.timeline({ paused: true });
      if (reduce) {
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.reduced, ease: "out" });
      } else {
        tl.fromTo(
          el,
          { autoAlpha: 0, x: -30 },
          {
            autoAlpha: 1,
            x: 0,
            duration: SPRING_SAMPLES.springHero.duration,
            ease: "springHero",
            force3D: true,
            clearProps: "transform",
          },
          0.2,
        );
      }
      tlRef.current = tl;
      if (introOpen.current) tl.play();
    },
    { scope: ref },
  );

  useIntro(() => {
    introOpen.current = true;
    tlRef.current?.play();
  });

  return (
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start lg:gap-10">
      <div ref={ref} data-reveal="" className="max-w-[1000px]">
        <RevealText as="h1" mode="chars" trigger="intro" delay={0.2} stagger={0.02} className="type-h2">
          {title}
        </RevealText>
      </div>
      <BlurText
        trigger="intro"
        delay={0.48}
        stagger={0.05}
        className="type-body max-w-[400px] text-ink-soft lg:pt-2"
      >
        {summary}
      </BlurText>
    </div>
  );
}

/** Banner: 1400 × 900 box (≈ 600px visible on load), radius 16. */
export function CaseBanner({ slug, title }: { slug: string; title: string }) {
  return (
    <MaskReveal
      radius={16}
      trigger="intro"
      delay={0.8}
      className="aspect-[4/5] w-full bg-placeholder md:aspect-[14/9]"
    >
      <ScrollZoom from={1.2} parallax className="h-full w-full">
        <MediaSlot
          id={`work-${slug}-banner`}
          fill
          priority
          sizes="(min-width: 1440px) 1400px, calc(100vw - 40px)"
          alt={`${title} banner`}
        />
      </ScrollZoom>
    </MaskReveal>
  );
}
