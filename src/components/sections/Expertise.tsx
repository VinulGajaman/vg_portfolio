/** Expertise STUB. The Expertise section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { expertise } from "@/content/expertise";
import { MediaSlot } from "@/components/ui/MediaSlot";

export default function Expertise() {
  return (
    <section id="expertise" aria-labelledby="expertise-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={expertise.eyebrow} title={expertise.title} counter={expertise.counter} titleId="expertise-title" className="heading-gap" />
        <MediaSlot id="expertise-01" rounded="xl" className="max-w-[240px]" />
      </div>
    </section>
  );
}
