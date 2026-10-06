"use client";

/**
 * <SubmitButton>: portvio "Button 2" (DESIGN.md §2.5). Full width, 54px, padding 16, centred
 * label; hover background → accent-85 over 0.2s `portvio`. States: idle · loading (20px spinner,
 * 360°/s linear) · success ("Message sent") · error (error-bg / error text). Disabled .5.
 */
import { SlotValue } from "@/components/motion/SlotSwap";
import { cn } from "@/lib/cn";

export type SubmitState = "idle" | "loading" | "success" | "error";

export function SubmitButton({
  children = "Send Message",
  state = "idle",
  successLabel = "Message sent",
  errorLabel = "Try again",
  disabled,
  className,
}: {
  children?: string;
  state?: SubmitState;
  successLabel?: string;
  errorLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  const label = state === "success" ? successLabel : state === "error" ? errorLabel : children;
  return (
    <button
      type="submit"
      className={cn("sbtn type-ui", className)}
      data-state={state}
      disabled={disabled || state === "loading"}
      aria-busy={state === "loading" || undefined}
    >
      {state === "loading" && (
        <svg className="animate-spin-1s" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
          <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <SlotValue value={label} />
    </button>
  );
}
