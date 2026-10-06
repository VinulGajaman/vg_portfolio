/** 4-point orange star (DESIGN.md §1.3.1, eyebrows, wordmark superscript). */
import { cn } from "@/lib/cn";

export function Sparkle({ className, size, title }: { className?: string; size?: number | string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("inline-block shrink-0 text-accent", className)}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" />
    </svg>
  );
}
