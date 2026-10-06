/** TechStack STUB. The TechStack section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { stack } from "@/content/stack";
import { SkillsIndex } from "@/components/ui/SkillsIndex";

export default function TechStack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={stack.eyebrow} title={stack.centre} titleId="stack-title" className="heading-gap" />
        <SkillsIndex />
      </div>
    </section>
  );
}
