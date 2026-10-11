"use client";

/**
 * <EnterButton>: the splash's simple "Enter" button. A slim outlined pill with the label and an
 * arrow; on hover an orange fill sweeps in from the left, the label turns dark and the arrow
 * slides through. Clicking it (or Enter / Space when focused) is the user gesture that lets the
 * background music start.
 *
 * Idle attention loop (while Vinul compares; see LOOP):
 *   A: an orange light orbits the outline + the arrow nudges forward
 *   B: ripple rings expand from the pill + a breathing orange glow behind it
 *   C: a light sweep glides across the glass + the letters lift in a soft wave
 * Plus, always: a premium light outside the button (halo, light streak, floor reflection) that
 * switches on and off slowly.
 * All loops pause on hover and are off for reduced motion.
 */
import { cn } from "@/lib/cn";

const LOOP: "A" | "B" | "C" = "A";
const LABEL = "Enter";
const ease = "ease-[cubic-bezier(.16,1,.3,1)]";

export function EnterButton({ onComplete, className }: { onComplete: () => void; className?: string }) {
  const a = LOOP === "A";
  const b = LOOP === "B";
  const c = LOOP === "C";
  return (
    <span className="relative inline-grid place-items-center">
      {/* Premium light outside the button, switching on and off in a slow 3.6s cycle:
          a soft warm halo behind it, a thin anamorphic light streak through it, and a faint
          floor reflection below it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[230%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 motion-safe:animate-[enter-halo_3.6s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.28), rgba(246,88,2,.08) 55%, transparent)" }}
      />
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[420%] -translate-x-1/2 -translate-y-1/2">
        <span
          className="block h-full w-full opacity-0 motion-safe:animate-[enter-light_3.6s_cubic-bezier(.4,0,.2,1)_infinite]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(246,88,2,.15) 20%, rgba(255,210,180,.9) 50%, rgba(246,88,2,.15) 80%, transparent)",
            boxShadow: "0 0 12px 1px rgba(246,88,2,.55)",
          }}
        />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(100%+14px)] h-6 w-[140%] -translate-x-1/2 rounded-[50%] opacity-0 blur-[10px] motion-safe:animate-[enter-halo_3.6s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.45), transparent)" }}
      />
      {/* B: breathing glow behind + ripple rings */}
      {b && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-40%_-25%] rounded-full motion-safe:animate-[enter-breathe_2.8s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.45), transparent)" }}
          />
          {[0, 1].map((i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-accent/70 opacity-0 motion-safe:animate-[enter-ripple_2.4s_cubic-bezier(.2,.6,.3,1)_infinite]"
              style={{ animationDelay: `${i * 1.2}s` }}
            />
          ))}
        </>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className={cn(
          "group relative flex h-12 items-center gap-3 overflow-hidden rounded-full border border-white/25 bg-canvas-deep pl-7 pr-5 text-ink outline-none transition-[border-color,color] duration-500 ease-out",
          "hover:border-accent hover:text-accent-ink focus-visible:border-accent active:scale-[.97]",
          className,
        )}
      >
        {/* A: an orange light orbiting the outline (conic border, masked to a 1.5px ring) */}
        {a && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full p-[1.5px] motion-safe:animate-[enter-orbit_2.6s_linear_infinite] group-hover:opacity-0"
            style={{
              background: "conic-gradient(from var(--orbit), transparent 0 72%, rgba(246,88,2,.25) 82%, #F65802 92%, #ffd2b3 96%, transparent 100%)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}

        {/* C: a soft light sweep across the glass */}
        {c && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 motion-safe:animate-[enter-sweep_3s_ease-in-out_infinite] group-hover:opacity-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)" }}
          />
        )}

        {/* orange fill sweeping in from the left on hover */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100",
            ease,
          )}
        />

        {/* label (C: letters lift in a wave) */}
        <span className="relative flex font-display text-[13px] font-semibold uppercase tracking-[0.22em]">
          {c
            ? Array.from(LABEL).map((ch, i) => (
                <span
                  key={i}
                  className="inline-block motion-safe:animate-[enter-wave_2.6s_ease-in-out_infinite] group-hover:[animation-play-state:paused]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {ch}
                </span>
              ))
            : LABEL}
        </span>

        {/* arrow (A: nudges forward on a loop; hover: slides through) */}
        <span className="relative grid size-4 overflow-hidden">
          {[0, 1].map((k) => (
            <svg
              key={k}
              viewBox="0 0 24 24"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "col-start-1 row-start-1 size-4 transition-transform duration-500",
                ease,
                k === 0
                  ? cn(
                      "group-hover:translate-x-[180%]",
                      a && "motion-safe:animate-[enter-nudge_2.6s_ease-in-out_infinite] group-hover:[animation:none]",
                    )
                  : "-translate-x-[180%] group-hover:translate-x-0",
              )}
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          ))}
        </span>
      </button>
    </span>
  );
}
