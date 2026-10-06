/**
 * Line icons, 1.5px stroke, currentColor (DESIGN.md §2.5, §3.3).
 * kind: right (button arrow) · hooked (portvio curved arrow) · chevron-left/right · plus · cross (pixel cross)
 */
import { cn } from "@/lib/cn";

export type ArrowKind = "right" | "hooked" | "chevron-left" | "chevron-right" | "plus" | "cross";

export function ArrowIcon({ kind = "right", size = 24, className, strokeWidth = 1.5 }: { kind?: ArrowKind; size?: number; className?: string; strokeWidth?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={cn("block shrink-0", className)} aria-hidden>
      {kind === "right" && <path {...common} d="M4 12h16m-6-6 6 6-6 6" />}
      {kind === "hooked" && <path {...common} d="M5 19v-6a4 4 0 0 1 4-4h10m-4-4 4 4-4 4" />}
      {kind === "chevron-left" && <path {...common} d="m15 5-7 7 7 7" />}
      {kind === "chevron-right" && <path {...common} d="m9 5 7 7-7 7" />}
      {kind === "plus" && <path {...common} d="M12 4v16M4 12h16" />}
      {kind === "cross" && (
        <path fill="currentColor" d="M8 0h8v8H8zM0 8h8v8H0zM16 8h8v8h-8zM8 16h8v8H8z" />
      )}
    </svg>
  );
}
