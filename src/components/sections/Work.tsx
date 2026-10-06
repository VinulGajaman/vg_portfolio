/** Work STUB. The Work section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { work } from "@/content/projects";
import { MediaSlot } from "@/components/ui/MediaSlot";

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" className="heading-gap" />
        <MediaSlot id="work-aasl-access-control-cover" rounded="2xl" className="max-w-[840px]" />
      </div>
    </section>
  );
}
