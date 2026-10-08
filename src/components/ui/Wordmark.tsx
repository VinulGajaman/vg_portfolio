/**
 * <Wordmark>: fitted live-text name (DESIGN.md §1.3.1). Container-query fitting
 * (font-size: calc(100cqw / K)) so the Windows scrollbar never causes overflow.
 *  hero   one line "VINUL GAJAMAN✦" at every width, K 8.93 at −0.02em
 *  footer one line at every width, −0.03em, K 8.80
 * Line-height .82. Sparkle .28em orange superscript. Visual only (aria-hidden).
 */
import { Sparkle } from "./Sparkle";
import { cn } from "@/lib/cn";

export function Wordmark({
  variant = "hero",
  sparkle = true,
  className,
  textClassName,
}: {
  variant?: "hero" | "footer";
  sparkle?: boolean;
  className?: string;
  textClassName?: string;
}) {
  const footer = variant === "footer";
  return (
    <div aria-hidden className={cn("w-full [container-type:inline-size]", className)}>
      <p
        className={cn(
          "type-display-wordmark m-0 whitespace-nowrap",
          footer ? "tracking-[-0.03em] [--wm-k:8.8]" : "[--wm-k:8.93]",
          textClassName,
        )}
        style={{ fontSize: "calc(100cqw / var(--wm-k))" }}
      >
        <span>VINUL</span> <span>
          GAJAMAN
          {/* align-top: sits at the cap line inside the line box. Lifting it above (relative top) got it
              clipped by the reveal's line mask; align-super opened a gap between lines on phone. */}
          {sparkle && <Sparkle className="ml-[.02em] inline-block w-[.28em] align-top" />}
        </span>
      </p>
    </div>
  );
}
