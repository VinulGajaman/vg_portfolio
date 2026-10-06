/** 404 (DESIGN.md §3.13): a centred stack ~130px below the nav, then the footer. */
import { notFound as copy } from "@/content/site";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";

export default function NotFound() {
  return (
    <section className="section-layer flex min-h-[70svh] flex-col items-center px-[var(--gutter)] pb-[100px] pt-[200px] text-center md:pt-[216px]">
      <RevealText as="h1" mode="chars" trigger="intro" delay={0.2} className="type-h2">
        {copy.title}
      </RevealText>
      <Reveal as="p" trigger="intro" delay={0.4} className="type-lead mt-4 text-ink">
        {copy.lead}
      </Reveal>
      <Reveal as="p" trigger="intro" delay={0.5} className="type-body mt-3 max-w-[360px] text-ink-soft">
        {copy.body}
      </Reveal>
      <Reveal trigger="intro" delay={0.6} className="mt-10">
        <PrimaryButton href="/" transitionTitle="Home">
          {copy.cta}
        </PrimaryButton>
      </Reveal>
    </section>
  );
}
