"use client";

/**
 * Expertise `#expertise` (DESIGN.md §3.5, portvio Services accordion). Single-open FLIP accordion;
 * closed-row hover tint + title <RollText lg>; a cursor-following image preview (U8) on closed
 * rows (desktop, fine pointer); <Spotlight> on the list container.
 * Every card carries the hero's realistic smoke, drifting on its own (<CardSmoke>; no pointer
 * interaction, off for reduced motion).
 */
import { useRef, useState, type MouseEvent, type RefObject } from "react";
import { m } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { RollText } from "@/components/motion/RollText";
import { Spotlight } from "@/components/motion/Spotlight";
import { CardSmoke } from "@/components/motion/CardSmoke";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MediaSlot } from "@/components/ui/MediaSlot";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  useAccordionItem,
} from "@/components/ui/Accordion";
import { gsap, useMotion } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion-tokens";
import { expertise, expertiseRows, type ExpertiseRow } from "@/content/expertise";
import { cn } from "@/lib/cn";

/** Realistic smoke behind a card, clipped to its rounded shape. */
function CardBackdrop() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <CardSmoke />
    </span>
  );
}

function Row({ row }: { row: ExpertiseRow }) {
  const { open, toggle } = useAccordionItem();
  const reduce = useReducedMotion();
  const fade = reduce ? { duration: 0.15 } : SPRING.springLayout;

  // The whole closed row is a pointer target; the button stays the keyboard / AT control.
  const onRowClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("button, a")) return;
    toggle();
  };

  return (
    <div
      data-roll-parent=""
      data-exp-row={row.media}
      data-cursor={open ? undefined : "open"}
      onClick={onRowClick}
      className={cn(
        "border-overlay relative flex cursor-pointer flex-col gap-10 rounded-2xl p-6 transition-colors duration-[809ms] ease-spring-layout md:p-[50px] lg:flex-row lg:items-center lg:justify-between lg:gap-10",
        open ? "cursor-default bg-surface" : "bg-surface md:bg-transparent md:hover:bg-surface-70",
      )}
    >
      <CardBackdrop />

      {/* Left block: number + title (+ description when open) */}
      <m.div
        layout="position"
        transition={SPRING.springLayout}
        className={cn(
          "relative flex min-w-0 flex-1 flex-wrap gap-x-10 gap-y-[30px] md:flex-nowrap",
          open ? "lg:max-w-[520px] lg:gap-x-[60px]" : "md:gap-x-0",
        )}
      >
        <span className={cn("type-statement shrink-0 text-ink tabular", open ? "md:w-[54px]" : "md:w-[114px]")}>
          {row.number}
        </span>
        <div className={cn("flex min-w-[260px] flex-1 flex-col gap-5", open && "lg:justify-between lg:gap-[130px]")}>
          <h3 className="type-statement text-ink">
            {/* Phone: plain wrapping text (RollText cannot wrap and ran off screen). Only one copy is displayed. */}
            <span className="md:hidden">{row.title}</span>
            <span className="hidden md:inline">
              <RollText size="lg">{row.title}</RollText>
            </span>
          </h3>
          <m.p
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={fade}
            aria-hidden={!open}
            className={cn("type-body text-balance text-ink-soft", !open && "h-px overflow-hidden")}
          >
            {row.description}
          </m.p>
        </div>
      </m.div>

      {/* Right block: image + bullets (panel) and the round button */}
      <m.div
        layout="position"
        transition={SPRING.springLayout}
        className={cn(
          "relative flex flex-1 gap-6 lg:max-w-[560px]",
          open ? "flex-col md:flex-row md:justify-between" : "justify-end",
        )}
      >
        <AccordionPanel className={cn(open && "flex flex-wrap items-center gap-10 md:flex-nowrap md:gap-[50px]")}>
          <MediaSlot
            id={row.media}
            rounded="xl"
            className="h-[230px] w-full min-w-[240px] md:h-[280px] md:w-[240px] md:shrink-0"
            sizes="240px"
          />
          <ul className="flex min-w-[288px] flex-col gap-[10px] md:min-w-0">
            {row.bullets.map((b) => (
              <li key={b} className="type-lead flex items-center gap-[10px] text-ink">
                <span aria-hidden className="size-[10px] shrink-0 rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        </AccordionPanel>
        <div className={cn("shrink-0 self-start", open && "pt-4")}>
          <AccordionTrigger label={`${open ? "Close" : "Open"} ${row.title}`} />
        </div>
      </m.div>
    </div>
  );
}

/** U8: one fixed 240×280 frame that follows the pointer over closed rows. */
function CursorPreview({ listRef }: { listRef: RefObject<HTMLDivElement | null> }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useMotion(
    ({ isDesktop, fine, reduce }) => {
      const list = listRef.current;
      const frame = frameRef.current;
      if (!list || !frame || !isDesktop || !fine || reduce) return;
      const hidden = "inset(100% 0% 0% 0% round 12px)";
      gsap.set(frame, { clipPath: hidden, scale: 0.85, autoAlpha: 1 });
      const xTo = gsap.quickTo(frame, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(frame, "y", { duration: 0.6, ease: "power3.out" });
      const rTo = gsap.quickTo(frame, "rotation", { duration: 0.6, ease: "power3.out" });
      const clampR = gsap.utils.clamp(-8, 8);
      let shown = false;
      let lastX = 0;
      let lastT = 0;

      const show = () => {
        shown = true;
        gsap.to(frame, { clipPath: "inset(0% 0% 0% 0% round 12px)", scale: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
      };
      const hide = () => {
        if (!shown) return;
        shown = false;
        gsap.to(frame, { clipPath: hidden, scale: 0.85, duration: 0.35, ease: "power3.in", overwrite: "auto" });
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        const vx = lastT ? ((e.clientX - lastX) / dt) * 1000 : 0;
        lastX = e.clientX;
        lastT = now;
        const row = (e.target as Element).closest<HTMLElement>("[data-exp-row]");
        const anyOpen = Boolean(list.querySelector("[data-open]"));
        if (!row || anyOpen || (e.target as Element).closest("button")) {
          hide();
          return;
        }
        if (!shown) {
          gsap.set(frame, { x: e.clientX - 120, y: e.clientY - 140 });
          show();
        }
        setActive(row.dataset.expRow ?? null);
        xTo(e.clientX - 120);
        yTo(e.clientY - 140);
        rTo(clampR(vx * 0.02));
      };
      const onLeave = () => {
        hide();
        rTo(0);
      };
      list.addEventListener("pointermove", onMove, { passive: true });
      list.addEventListener("pointerleave", onLeave);
      list.addEventListener("click", hide);
      return () => {
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerleave", onLeave);
        list.removeEventListener("click", hide);
      };
    },
    { scope: frameRef },
  );

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="pointer-events-none invisible fixed left-0 top-0 z-[60] hidden h-[280px] w-[240px] overflow-hidden rounded-xl lg:block"
      style={{ clipPath: "inset(100% 0% 0% 0% round 12px)" }}
    >
      {expertiseRows.map((r) => (
        <div
          key={r.media}
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            active === r.media ? "opacity-100" : "opacity-0",
          )}
        >
          <MediaSlot id={r.media} fill sizes="240px" />
        </div>
      ))}
    </div>
  );
}

export default function Expertise() {
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <section id="expertise" aria-labelledby="expertise-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader
          eyebrow={expertise.eyebrow}
          title={expertise.title}
          counter={expertise.counter}
          titleId="expertise-title"
          className="heading-gap"
        />
        <Reveal variant="card" delay={0.3}>
          <Spotlight className="rounded-2xl">
            <div ref={listRef} className="relative z-[1]">
              <Accordion className="flex flex-col gap-6">
                {expertiseRows.map((row) => (
                  <AccordionItem key={row.number} id={row.number} className="relative">
                    <Row row={row} />
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Spotlight>
        </Reveal>
      </div>
      <CursorPreview listRef={listRef} />
    </section>
  );
}
