/**
 * <Grain>: global film grain (DESIGN.md §1.6.1, U17).
 * Fixed full-viewport layer, pointer-events none, z 55, 256×256 tiling noise
 * (/textures/grain.png), opacity .045, mix-blend-mode overlay. Jitter: grain 0.8s steps(6),
 * translate ±3% (transform only); the layer is oversized so edges never show.
 * Static under reduced motion. Server component (pure CSS).
 */
import { cn } from "@/lib/cn";

export function Grain({ className, opacity = 0.045 }: { className?: string; opacity?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[55] overflow-hidden", className)}>
      <div
        className="absolute inset-[-10%] mix-blend-overlay motion-safe:animate-grain"
        style={{
          opacity,
          backgroundImage: "url(/textures/grain.png)",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
