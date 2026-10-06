/** Tag chip: 16/600 uppercase, padding 8 10, rgba(255,255,255,.1), radius 4 (DESIGN.md §3.7). */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("type-tag inline-flex items-center rounded-xs bg-tag px-[10px] py-[8px]", className)}>{children}</span>;
}
