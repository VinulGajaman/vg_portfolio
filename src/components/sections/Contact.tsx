/** Contact STUB. The Contact section agent replaces this file entirely (see DESIGN.md §3). */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { contact } from "@/content/site";
import { MediaSlot } from "@/components/ui/MediaSlot";

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={contact.eyebrow} title={contact.title} titleId="contact-title" className="heading-gap" />
        <MediaSlot id="contact-bg" rounded="3xl" />
      </div>
    </section>
  );
}
