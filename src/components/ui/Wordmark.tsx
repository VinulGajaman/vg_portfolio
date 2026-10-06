/**
 * <Wordmark>: fitted live-text name (DESIGN.md §1.3.1). Container-query fitting
 * (font-size: calc(100cqw / K)) so the Windows scrollbar never causes overflow.
 *  hero   one line "VINUL GAJAMAN✦", K 8.93 at −0.02em; phone two lines, K 5.77
 *  footer one line at −0.03em, K 8.80; phone two lines, K 5.77
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
          "type-display-wordmark m-0 whitespace-nowrap [--wm-k:5.77]",
          footer ? "tracking-[-0.03em] md:[--wm-k:8.8]" : "md:[--wm-k:8.93]",
          textClassName,
        )}
        style={{ fontSize: "calc(100cqw / var(--wm-k))" }}
      >
        <span className="block md:inline">VINUL</span>
        <span className="hidden md:inline"> </span>
        <span className="block md:inline">
          GAJAMAN
          {/* Lifted with relative top so it never grows the line box (align-super opened a gap on phone). */}
          {sparkle && <Sparkle className="relative -top-[.45em] ml-[.02em] inline-block w-[.28em]" />}
        </span>
      </p>
    </div>
  );
}
