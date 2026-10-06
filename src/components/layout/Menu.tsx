"use client";

/**
 * Menu overlay (DESIGN.md §3.1, [pv: bundle §5.15, interactions §6]) with AnimatePresence.
 * Backdrop: fixed, z 40, rgba(0,0,0,.25) + blur(5px), springFade; click closes.
 * Panel: fixed right, z 41, 45% / 64% / 100% wide, #0D0D0D, padding 0 40 (phone 0 20),
 *   x 560 + opacity 0 → 0 / 1 → back, from the right at every width, springUI.
 * Links: Clash 54/700, 56px rows, gap 4, each masked: y 100 → 0 → 100, 0.8s `mask`,
 *   delay min(i × .05, .15). Hover: RollText lg; siblings dim to .35 (0.18s out); a 24px orange
 *   sparkle slides in (x −20 → 0, springUI). Contact / Socials block rides with the panel.
 * Esc closes; focus is trapped (trigger + panel) and returns to the trigger; lenis.stop() while
 * open; a link click closes, then scrolls / navigates 0.35s later. Reduced motion: opacity, 0.2s.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { usePageTransition } from "@/components/motion/PageTransition";
import { RollText } from "@/components/motion/RollText";
import { Sparkle } from "@/components/ui/Sparkle";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/hooks";
import { BEZIER, SPRING, STAGGER } from "@/lib/motion-tokens";
import { setUI, useUI } from "@/lib/store";
import { mailto, navLinks, site } from "@/content/site";
import { cn } from "@/lib/cn";

const FOCUSABLE = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function Menu() {
  const open = useUI((s) => s.menuOpen);
  const reduce = useReducedMotion();
  const { navigate } = usePageTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    lockScroll("menu");
    const raf = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }),
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUI({ menuOpen: false });
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const trigger = document.querySelector<HTMLElement>("[aria-controls='site-menu'][aria-expanded='true']");
      const items = [
        ...(trigger ? [trigger] : []),
        ...Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ];
      if (!items.length) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      unlockScroll("menu");
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const go = (anchor: string) => {
    setUI({ menuOpen: false });
    window.setTimeout(() => navigate(`/#${anchor}`), 350);
  };

  const fade = { duration: 0.2 };
  return (
    <AnimatePresence>
      {open && (
        <m.div key="menu" className="fixed inset-0 z-40" initial="closed" animate="open" exit="closed">
          <m.div
            aria-hidden
            className="absolute inset-0 bg-backdrop backdrop-blur-[5px]"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={reduce ? fade : SPRING.springFade}
            onClick={() => setUI({ menuOpen: false })}
          />
          <m.div
            ref={panelRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent=""
            className="absolute inset-y-0 right-0 z-[41] flex w-full flex-col justify-center overflow-y-auto bg-canvas px-5 md:w-[64%] md:px-10 lg:w-[45%]"
            variants={
              reduce
                ? { open: { opacity: 1 }, closed: { opacity: 0 } }
                : { open: { x: 0, opacity: 1 }, closed: { x: 560, opacity: 0 } }
            }
            transition={reduce ? fade : SPRING.springUI}
          >
            <div className="flex flex-col gap-[80px] py-[96px]">
              <ul className="flex flex-col gap-1" onPointerLeave={() => setHovered(null)}>
                {navLinks.map((l, i) => {
                  const delay = Math.min(i * STAGGER.menu, STAGGER.menuCap);
                  return (
                    <li key={l.anchor} className="h-[56px] overflow-hidden pl-[30px] -ml-[30px]">
                      <m.a
                        href={`/#${l.anchor}`}
                        onClick={(e) => {
                          e.preventDefault();
                          go(l.anchor);
                        }}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        className="type-menu-link relative flex h-[56px] items-center text-ink"
                        variants={
                          reduce
                            ? { open: { opacity: 1 }, closed: { opacity: 0 } }
                            : { open: { y: 0 }, closed: { y: 100 } }
                        }
                        transition={reduce ? fade : { duration: 0.8, ease: BEZIER.mask, delay }}
                        style={{ opacity: 1 }}
                      >
                        <m.span
                          aria-hidden
                          className="absolute left-[-30px] top-1/2 -mt-3 hidden md:block"
                          initial={false}
                          animate={hovered === i ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={SPRING.springUI}
                        >
                          <Sparkle size={24} />
                        </m.span>
                        <m.span
                          initial={false}
                          animate={{ opacity: hovered !== null && hovered !== i ? 0.35 : 1 }}
                          transition={{ duration: 0.18, ease: BEZIER.out }}
                        >
                          <RollText size="lg">{l.label}</RollText>
                        </m.span>
                      </m.a>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap gap-6">
                <div className="flex w-[272px] flex-col">
                  <span className="type-body mb-4 text-ink-soft">Contact</span>
                  <div className="type-link flex flex-col gap-3">
                    <a href={mailto} className="w-fit">
                      <RollText>{site.email}</RollText>
                    </a>
                    <a href={site.phoneHref} className="w-fit">
                      <RollText>{site.phone}</RollText>
                    </a>
                  </div>
                </div>
                <div className="flex w-[272px] flex-col">
                  <span className="type-body mb-4 text-ink-soft">Socials</span>
                  <div className="type-link flex flex-col gap-3">
                    {Object.values(site.socials).map((s) => (
                      <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={cn("w-fit")}>
                        <RollText>{s.label}</RollText>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
