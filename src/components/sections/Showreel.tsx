/**
 * Showreel `#showreel` (DESIGN.md §3.10, portvio Demo). <PinnedZoom> owns the 400svh pinned stage:
 * frame scale .2 → 1 with a 1.8 → 1 counter-zoom, labels converge from ±83.33vw (progress 0 → .85,
 * then a dwell), char reveal at .1, play-in-view video with a play/pause frame button, and the
 * reduced-motion static layout. A missing video renders the placeholder, which zooms the same.
 */
import { PinnedZoom } from "@/components/motion/PinnedZoom";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { showreel } from "@/content/site";

export default function Showreel() {
  return (
    <PinnedZoom id="showreel" headingId="showreel-title" left={showreel.left} right={showreel.right}>
      <MediaSlot id="showreel" fill autoPlay={false} preloadVideo="metadata" sizes="100vw" />
    </PinnedZoom>
  );
}
