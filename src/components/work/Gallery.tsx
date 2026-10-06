/**
 * Case-study gallery (DESIGN.md §4.1 item 5, §4.2): a 2-up row (gallery-01/02, 4:3 visible,
 * radius 20, gap 16) then a full-width gallery-03 (2:1 visible). Each image <MaskReveal> +
 * <ParallaxImage> (desktop and tablet; off on phone and under reduced motion).
 */
import { MaskReveal } from "@/components/motion/MaskReveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { cn } from "@/lib/cn";

function Shot({ id, className, sizes, delay }: { id: string; className: string; sizes: string; delay?: number }) {
  return (
    <MaskReveal radius={20} delay={delay} className={cn("w-full bg-placeholder", className)}>
      <ParallaxImage className="h-full w-full">
        <MediaSlot id={id} fill sizes={sizes} />
      </ParallaxImage>
    </MaskReveal>
  );
}

export function Gallery({ slug }: { slug: string }) {
  const half = "(min-width: 1440px) 692px, (min-width: 810px) calc(50vw - 28px), calc(100vw - 32px)";
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Shot id={`work-${slug}-gallery-01`} className="aspect-[4/3]" sizes={half} />
        <Shot id={`work-${slug}-gallery-02`} className="aspect-[4/3]" sizes={half} delay={0.1} />
      </div>
      <Shot
        id={`work-${slug}-gallery-03`}
        className="aspect-[4/3] md:aspect-[2/1]"
        sizes="(min-width: 1440px) 1400px, calc(100vw - 40px)"
      />
    </div>
  );
}
