"use client";

/**
 * Menu trigger (DESIGN.md §3.1): hamburger of three 24×2 bars at y 4 / 11 / 18 plus the "Menu"
 * label (18/500, RollText "Menu" → "Close"). Open: top bar to the centre at −45°, middle bar
 * opacity 0 + scaleX .04, bottom bar to the centre at +45°, on springSnappy.
 */
import { m } from "motion/react";
import { forwardRef } from "react";
import { RollText } from "@/components/motion/RollText";
import { useReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion-tokens";
import { setUI, useUI } from "@/lib/store";
import { cn } from "@/lib/cn";

export const MenuTrigger = forwardRef<HTMLButtonElement, { className?: string; iconOnly?: boolean }>(function MenuTrigger(
  { className, iconOnly = false },
  ref,
) {
  const open = useUI((s) => s.menuOpen);
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0.2 } : SPRING.springSnappy;
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={() => setUI({ menuOpen: !open })}
      data-roll-parent=""
      className={cn(
        "pressable inline-flex items-center text-ink",
        iconOnly ? "h-12 w-12 justify-center" : "h-6 gap-[10px]",
        className,
      )}
    >
      <span className="relative block h-6 w-6" aria-hidden>
        <m.span
          className="absolute left-0 top-[4px] h-[2px] w-6 rounded-full bg-current"
          initial={false}
          animate={open ? { y: 7, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={t}
        />
        <m.span
          className="absolute left-0 top-[11px] h-[2px] w-6 rounded-full bg-current"
          initial={false}
          animate={open ? { opacity: 0, scaleX: 0.04 } : { opacity: 1, scaleX: 1 }}
          transition={t}
        />
        <m.span
          className="absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-current"
          initial={false}
          animate={open ? { y: -7, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={t}
        />
      </span>
      {!iconOnly && (
        // Flex-centred against the 24px icon; the 1px top pad optically centres Inter's cap height.
        <span className="type-ui inline-flex h-6 items-center pt-px leading-none" aria-hidden>
          <RollText to="Close" active={open}>
            Menu
          </RollText>
        </span>
      )}
    </button>
  );
});
