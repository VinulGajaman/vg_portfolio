"use client";

/**
 * <EnterButton>: the splash's simple "Enter" button. A slim outlined pill with the label and an
 * arrow; on hover an orange fill sweeps in from the left, the label turns dark and the arrow
 * slides through. Clicking it (or Enter / Space when focused) is the user gesture that lets the
 * background music start.
 */
import { cn } from "@/lib/cn";

export function EnterButton({ onComplete, className }: { onComplete: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onComplete();
      }}
      className={cn(
        "group relative flex h-12 items-center gap-3 overflow-hidden rounded-full border border-white/25 pl-7 pr-5 text-ink outline-none transition-[border-color,color] duration-500 ease-out",
        "hover:border-accent hover:text-accent-ink focus-visible:border-accent active:scale-[.97]",
        className,
      )}
    >
      {/* orange fill sweeping in from the left */}
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span className="relative font-display text-[13px] font-semibold uppercase tracking-[0.22em]">Enter</span>
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
              "col-start-1 row-start-1 size-4 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
              k === 0 ? "group-hover:translate-x-[180%]" : "-translate-x-[180%] group-hover:translate-x-0",
            )}
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        ))}
      </span>
    </button>
  );
}
