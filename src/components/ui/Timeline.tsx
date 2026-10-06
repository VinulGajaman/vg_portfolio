"use client";

/**
 * <Timeline>: scroll-drawn experience rail (DESIGN.md §3.9, U19).
 * 1px #3C3C3C base + orange overlay scaleX 0 → 1 (origin 0 50%), scrubbed by `trigger`
 * ("top 80%" → "top 30%", scrub 0.7). Nodes at 0 / .5 / 1: 10px rings (1px #3C3C3C) that fill
 * #F65802 when the line passes (0.3s `out`). The "now" node pulses (scale 1 → 1.8, opacity
 * .6 → 0, 1.6s loop). Phone: vertical on the left with the same scrub.
 * Reduced motion: line and nodes complete, no pulse.
 */
import { useRef } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { SCRUB } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export type TimelineNode = { label: string; at: number; now?: boolean };

export function Timeline({
  nodes,
  trigger,
  className,
}: {
  nodes: readonly TimelineNode[];
  /** CSS selector of the element whose entry drives the scrub (default: the timeline itself). */
  trigger?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isPhone }) => {
      const root = ref.current;
      const line = lineRef.current;
      if (!root || !line) return;
      const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-node]"));
      const fillDot = (d: HTMLElement, on: boolean) =>
        gsap.to(d, {
          backgroundColor: on ? "#F65802" : "rgba(13,13,13,1)",
          borderColor: on ? "#F65802" : "#3C3C3C",
          duration: 0.3,
          ease: "out",
          overwrite: true,
        });
      const prop = isPhone ? "scaleY" : "scaleX";
      if (reduce) {
        gsap.set(line, { [prop]: 1 });
        dots.forEach((d) => fillDot(d, true).progress(1));
        return;
      }
      const el = (trigger && document.querySelector(trigger)) || root;
      gsap.fromTo(
        line,
        { [prop]: 0 },
        {
          [prop]: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 30%",
            scrub: SCRUB,
            onUpdate: (self) => {
              dots.forEach((d) => {
                const at = Number(d.dataset.at);
                const on = self.progress >= at - 0.001;
                if ((d.dataset.on === "1") !== on) {
                  d.dataset.on = on ? "1" : "0";
                  fillDot(d, on);
                }
              });
            },
          },
        },
      );
    },
    { scope: ref, dependencies: [trigger] },
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* rail */}
      <div className="absolute left-[4.5px] top-0 h-full w-px bg-line md:left-0 md:top-[4.5px] md:h-px md:w-full">
        <div ref={lineRef} className="h-full w-full origin-top bg-accent md:origin-left" />
      </div>
      <ol className="relative flex flex-col gap-10 md:flex-row md:justify-between md:gap-0">
        {nodes.map((n, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-4 md:flex-col md:gap-3",
              i === 0 ? "md:items-start" : i === nodes.length - 1 ? "md:items-end" : "md:items-center",
            )}
          >
            <span className="relative block size-[10px]">
              {n.now && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-accent motion-safe:animate-pulse-ring"
                />
              )}
              <span
                data-node=""
                data-at={n.at}
                className="relative block size-[10px] rounded-full border border-line bg-canvas"
              />
            </span>
            <span className="type-small text-ink-soft tabular">{n.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
