/**
 * Brand marks (DESIGN.md §3.1, §3.12): a 32px orange disc holding a #0D0D0D "VG" monogram plus the
 * name in Clash 700. Nav: "VINUL" 20px (box ≈ 143×32). Footer: 40px disc + "VINUL GAJAMAN".
 */
import { cn } from "@/lib/cn";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={cn("block shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#F65802" />
      {/* "VG" monogram: solid V + stroked G, drawn as paths so it needs no font (also the favicon). */}
      <path d="M6 10h2.6l1.5 8.2 1.5-8.2h2.6L11.5 22H8.7Z" fill="#0D0D0D" />
      <path d="M23.6 13A4.6 4.6 0 1 0 24.7 16.6H20.6" fill="none" stroke="#0D0D0D" strokeWidth="2.4" />
    </svg>
  );
}

export function Logo({ variant = "nav", className }: { variant?: "nav" | "footer"; className?: string }) {
  const footer = variant === "footer";
  return (
    <span className={cn("inline-flex items-center gap-[10px]", className)}>
      <LogoMark size={footer ? 40 : 32} />
      <span
        className={cn(
          "font-display font-bold uppercase leading-none tracking-[0.01em] text-ink",
          footer ? "text-[22px]" : "text-[20px]",
        )}
      >
        {footer ? "Vinul Gajaman" : "Vinul"}
      </span>
    </span>
  );
}
