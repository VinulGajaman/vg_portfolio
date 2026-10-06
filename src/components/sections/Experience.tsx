/** Experience STUB. The Experience section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { experience, timelineNodes } from "@/content/experience";
import { Timeline } from "@/components/ui/Timeline";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={experience.eyebrow} title={experience.title} titleId="experience-title" variant="centred" className="heading-gap" />
        <Timeline nodes={timelineNodes} className="mx-auto max-w-[960px]" />
      </div>
    </section>
  );
}
