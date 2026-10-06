/** Process STUB. The Process section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { processSection } from "@/content/process";

export default function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={processSection.eyebrow} title={processSection.title} titleId="process-title" variant="centred" className="heading-gap" />
        <p className="type-body text-ink-soft">Section in progress.</p>
      </div>
    </section>
  );
}
