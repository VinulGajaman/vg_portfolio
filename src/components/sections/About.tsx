/** About STUB (DESIGN.md §3.3). The about section agent replaces this file entirely. */
import { Curtain } from "@/components/motion/Curtain";
import { ScrollFillText } from "@/components/motion/ScrollFillText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { about, ctaLabels } from "@/content/site";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-layer px-[var(--gutter)] py-[40px]">
      <Curtain />
      <div className="relative z-[4] mx-auto flex max-w-[1400px] flex-col gap-5 lg:pl-[550px]">
        <Eyebrow>{about.eyebrow}</Eyebrow>
        <ScrollFillText as="h2" id="about-title" className="type-statement">
          {about.statement.map((s, i) =>
            "accent" in s ? (
              <span key={i} className="text-accent">
                {s.text}
              </span>
            ) : (
              <span key={i}>{s.text}</span>
            ),
          )}
        </ScrollFillText>
        <div className="mt-[30px]">
          <PrimaryButton href="#contact">{ctaLabels.contact}</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
