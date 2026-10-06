"use client";

/**
 * <Accordion> (DESIGN.md §2.5, §3.5). One row open at a time, all closed at start.
 * FLIP via motion `layout` on springLayout (0.8s, bounce 0) inside a LayoutGroup, so rows below
 * are pushed smoothly. Never animates height. Compose:
 *   <Accordion> <AccordionItem id> … <AccordionTrigger/> … <AccordionPanel>…</AccordionPanel>
 * AccordionTrigger: 60×60 round button, closed #F65802 "+" at 0°, open #2F2E2D rotated 135°,
 * springSnappy; button[aria-expanded][aria-controls]. AccordionPanel: role=region, fades in on
 * springLayout and collapses to a 1px, opacity 0, overflow hidden box when closed.
 * Children of a `layout` element that must not stretch should use <m.div layout="position">.
 */
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { LayoutGroup, m } from "motion/react";
import { Magnetic } from "@/components/motion/Magnetic";
import { useReducedMotion } from "@/lib/hooks";
import { SPRING } from "@/lib/motion-tokens";
import { ArrowIcon } from "./ArrowIcon";
import { cn } from "@/lib/cn";

type AccordionCtx = { openId: string | null; toggle: (id: string) => void };
const AccordionContext = createContext<AccordionCtx>({ openId: null, toggle: () => {} });

type ItemCtx = { id: string; open: boolean; toggle: () => void; buttonId: string; panelId: string };
const ItemContext = createContext<ItemCtx | null>(null);

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ openId, toggle: (id) => setOpenId((o) => (o === id ? null : id)) }}>
      <LayoutGroup>
        <div className={className}>{children}</div>
      </LayoutGroup>
    </AccordionContext.Provider>
  );
}

/** Item state for custom layouts (open, toggle, ids). */
export function useAccordionItem(): ItemCtx {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("useAccordionItem must be used inside <AccordionItem>");
  return ctx;
}

export function AccordionItem({
  id,
  children,
  className,
  ...rest
}: {
  id: string;
  children: ReactNode | ((state: { open: boolean }) => ReactNode);
  className?: string;
} & Record<`data-${string}`, string | undefined>) {
  const { openId, toggle } = useContext(AccordionContext);
  const reduce = useReducedMotion();
  const uid = useId();
  const open = openId === id;
  return (
    <ItemContext.Provider
      value={{ id, open, toggle: () => toggle(id), buttonId: `${uid}-btn`, panelId: `${uid}-panel` }}
    >
      <m.div
        layout={!reduce}
        transition={SPRING.springLayout}
        data-open={open ? "" : undefined}
        className={className}
        {...rest}
      >
        {typeof children === "function" ? children({ open }) : children}
      </m.div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ className, label }: { className?: string; label?: string }) {
  const { open, toggle, buttonId, panelId } = useAccordionItem();
  const reduce = useReducedMotion();
  return (
    <Magnetic>
      <m.button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={toggle}
        className={cn("pressable grid size-[60px] shrink-0 place-items-center rounded-full text-ink", className)}
        initial={false}
        animate={{ backgroundColor: open ? "#2F2E2D" : "#F65802" }}
        transition={reduce ? { duration: 0.15 } : SPRING.springSnappy}
      >
        <m.span
          initial={false}
          animate={{ rotate: open && !reduce ? 135 : 0 }}
          transition={SPRING.springSnappy}
          className="block"
        >
          <ArrowIcon kind="plus" strokeWidth={2} />
        </m.span>
      </m.button>
    </Magnetic>
  );
}

export function AccordionPanel({ children, className }: { children: ReactNode; className?: string }) {
  const { open, buttonId, panelId } = useAccordionItem();
  return (
    <m.div
      layout="position"
      id={panelId}
      role="region"
      aria-labelledby={buttonId}
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{ opacity: open ? 1 : 0 }}
      transition={SPRING.springLayout}
      className={cn(open ? "" : "h-px overflow-hidden", className)}
    >
      {children}
    </m.div>
  );
}
