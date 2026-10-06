/** Showreel STUB (DESIGN.md §3.10). The showreel section agent replaces this file entirely. */
import { PinnedZoom } from "@/components/motion/PinnedZoom";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { showreel } from "@/content/site";

export default function Showreel() {
  return (
    <PinnedZoom id="showreel" headingId="showreel-title" left={showreel.left} right={showreel.right}>
      <MediaSlot id="showreel" fill autoPlay={false} />
    </PinnedZoom>
  );
}
