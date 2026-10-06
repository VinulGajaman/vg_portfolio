/** Impact STUB. The Impact section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { impact } from "@/content/impact";

export default function Impact() {
  return (
    <section id="impact" aria-labelledby="impact-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={impact.eyebrow} title={impact.title} counter={impact.counter} titleId="impact-title" className="heading-gap" />
        <p className="type-body text-ink-soft">Section in progress.</p>
      </div>
    </section>
  );
}
