/**
 * Brand marks (DESIGN.md §3.1, §3.12): a 32px orange disc holding a #0D0D0D "V" plus the
 * name in Clash 700. Nav: "VINUL" 20px (box ≈ 143×32). Footer: 40px disc + "VINUL GAJAMAN".
 */
import { cn } from "@/lib/cn";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={cn("block shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#F65802" />
      <path d="M9.2 9.5h3.6l3.2 9.1 3.2-9.1h3.6L17.9 22.5h-3.8Z" fill="#0D0D0D" />
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
