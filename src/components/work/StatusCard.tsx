"use client";

/**
 * <StatusCard>: a project card that looks like a live production monitor. A status pill
 * (pulsing dot, "Operational"), an orange heartbeat line sweeping across, and the project's real
 * stack listed as running services with small activity bars. No made-up metrics: only the stack,
 * which is true. The first time the card comes into view it boots: the status goes from Standby to
 * Operational, the services start one by one, the heartbeat fades in and the title decodes.
 * Once a cover exists it glows faintly behind the monitor and comes forward on hover.
 * The loops run only while the card is on screen; reduced motion shows the booted card, still.
 */
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { useMedia } from "@/components/providers/MediaProvider";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { CardText, type ProjectCardProps } from "./CardText";

/** Eight heartbeat periods across 800 units; the strip slides left by half for a seamless loop. */
const ECG = (() => {
  let d = "M0 30";
  for (let i = 0; i < 8; i++) {
    const x = i * 100;
    d += `L${x + 28} 30q5-7 10 0L${x + 47} 30L${x + 51} 5L${x + 56} 53L${x + 60} 30L${x + 72} 30q7-10 14 0L${x + 100} 30`;
  }
  return d;
})();

function Heartbeat({ live }: { live: boolean }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 35%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 35%, #000 92%, transparent)" }}
    >
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-y-0 left-0 h-full w-[200%] animate-[status-beat_4.5s_linear_infinite] text-accent"
        style={{ animationPlayState: live ? "running" : "paused", filter: "drop-shadow(0 0 6px rgb(246 88 2 / .7))" }}
      >
        <path d={ECG} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export function StatusCard({ project: p, number, size = "sm", sizes = "(min-width: 1024px) 40vw, 100vw", className }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const cover = `work-${p.slug}-cover`;
  const hasCover = Boolean(useMedia(cover));
  const booted = revealed || reduce;
  const live = onScreen && !reduce;
  // Small cards only have room for the heartbeat above the text; the large one also lists services.
  const services = size === "lg" ? p.stack.slice(0, 5) : [];

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting && e.intersectionRatio >= 0.35) setRevealed(true);
      },
      { threshold: [0, 0.35] },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <TransitionLink
      ref={ref}
      href={`/work/${p.slug}`}
      transitionTitle={p.title}
      data-cursor="view"
      data-cursor-label="View"
      className={cn("group border-overlay relative block overflow-hidden rounded-2xl bg-[#0b0b0b]", className)}
    >
      {/* The cover: a faint glow behind the monitor, full on hover */}
      {hasCover && (
        <div className="absolute inset-0 opacity-20 transition-opacity duration-700 pointer-fine:group-hover:opacity-100">
          <MediaSlot id={cover} fill alt="" sizes={sizes} />
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 70% at 85% 0%, rgb(246 88 2 / .12), transparent 60%)" }}
      />

      {/* Status pill */}
      <span className="type-micro absolute right-5 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-canvas/55 px-3 py-1.5 uppercase tracking-[0.14em] text-ink backdrop-blur-md md:right-6">
        <span className="relative flex size-2">
          {booted && <span className={cn("absolute inset-0 rounded-full bg-accent", live && "animate-ping")} />}
          <span className={cn("relative size-2 rounded-full transition-colors duration-500", booted ? "bg-accent" : "bg-ink-soft/50")} />
        </span>
        <span className="grid">
          <span className={cn("[grid-area:1/1] transition-opacity duration-300", booted ? "opacity-0" : "opacity-100")}>Standby</span>
          <span className={cn("[grid-area:1/1] transition-opacity delay-700 duration-300", booted ? "opacity-100" : "opacity-0")}>Operational</span>
        </span>
      </span>

      {/* The monitor: heartbeat and running services, above the text */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-5 top-16 flex flex-col gap-4 transition-opacity duration-700 md:inset-x-8 md:top-20",
          hasCover && "pointer-fine:group-hover:opacity-20",
        )}
      >
        <div
          className={cn("transition-[opacity,clip-path] delay-300 duration-[1200ms] ease-out", size === "lg" ? "h-10 md:h-16 lg:h-24" : "h-8", booted ? "opacity-100" : "opacity-0")}
          style={{ clipPath: booted ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
        >
          <Heartbeat live={live} />
        </div>
        <ul className={cn("hidden flex-wrap gap-2", services.length && "md:flex")}>
          {services.map((s, i) => (
            <li
              key={s}
              className={cn(
                "type-micro flex items-center gap-2 rounded-full border px-3 py-1.5 uppercase tracking-[0.1em] transition-[color,border-color,opacity] duration-500",
                booted ? "border-white/15 text-ink" : "border-white/5 text-ink-soft/50",
              )}
              style={{ transitionDelay: reduce ? undefined : `${700 + i * 260}ms` }}
            >
              <span className={cn("size-1.5 rounded-full transition-colors duration-500", booted ? "bg-accent" : "bg-ink-soft/40")} style={{ transitionDelay: reduce ? undefined : `${700 + i * 260}ms` }} />
              {s}
              <span className="flex h-2.5 items-end gap-[2px]">
                {[0, 1, 2].map((k) => (
                  <span
                    key={k}
                    className={cn("w-[2px] origin-bottom rounded-full bg-accent/80", booted ? "h-2.5" : "h-[2px]", live && "animate-[eq_0.9s_ease-in-out_infinite_alternate]")}
                    style={{ animationDelay: `${-((i * 3 + k) % 5) * 0.17}s` }}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <CardText p={p} number={number} size={size} revealed={revealed} reduce={reduce} />
    </TransitionLink>
  );
}
