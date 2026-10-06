/**
 * Chip (DESIGN.md §3.2, §3.7):
 *  glass   hero skill chip: body 16/400 white, padding 10, glass + blur(10px), radius 10 (45.6px tall)
 *  outline stack chip: small 14, 1px #3C3C3C, radius 4, padding 6 10
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Chip({ children, variant = "outline", className }: { children: ReactNode; variant?: "glass" | "outline"; className?: string }) {
  return variant === "glass" ? (
    <span className={cn("type-body glass inline-flex items-center whitespace-nowrap rounded-lg p-[10px] text-ink", className)}>{children}</span>
  ) : (
    <span className={cn("type-small border-overlay inline-flex items-center whitespace-nowrap rounded-xs px-[10px] py-[6px] text-ink-soft", className)}>{children}</span>
  );
}
