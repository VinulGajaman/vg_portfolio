"use client";

/**
 * <PrimaryButton variant="orange | white | dark">: portvio square-fill button (DESIGN.md §2.5).
 * 60px, padding 6 24 6 6, gap 14, radius 6. The 48×48 box is a clip-path layer:
 * inset(6px calc(100% - 54px) 6px 6px round 4px) → inset(2px round 4px) on hover / focus-visible
 * (or hover of the closest [data-roll-parent]) over .63s springUI; the arrow rotates 0 → −45°
 * and the label colour flips on the same spring. Label plays <RollText>. Wrapped in
 * <Magnetic strength={.3}>. Renders <TransitionLink> for internal routes, <a> for external /
 * mailto / hash links, <button> otherwise. CSS lives in globals.css (.pbtn*).
 */
import type { MouseEventHandler, ReactNode } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { RollText } from "@/components/motion/RollText";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ArrowIcon } from "./ArrowIcon";
import { cn } from "@/lib/cn";

export type PrimaryButtonProps = {
  children: string;
  variant?: "orange" | "white" | "dark";
  href?: string;
  /** Title for the page-transition panel. */
  transitionTitle?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Skip the magnetic wrapper. */
  magnetic?: boolean;
  download?: boolean;
  className?: string;
  /** Render a plain span (when the whole parent card is the link). */
  asSpan?: boolean;
};

export function PrimaryButton({
  children,
  variant = "orange",
  href,
  transitionTitle,
  onClick,
  type = "button",
  disabled,
  magnetic = true,
  download,
  className,
  asSpan,
}: PrimaryButtonProps) {
  const cls = cn("pbtn type-ui", variant !== "orange" && `pbtn--${variant}`, className);
  const inner = (
    <>
      <span className="pbtn-fill" aria-hidden />
      <span className="pbtn-wash" aria-hidden />
      <span className="pbtn-icon" aria-hidden>
        <span className="pbtn-arrow">
          <ArrowIcon kind="right" />
        </span>
      </span>
      <span className="pbtn-label" data-magnetic-inner="">
        <RollText>{children}</RollText>
      </span>
    </>
  );

  let el: ReactNode;
  if (asSpan) {
    el = <span className={cls}>{inner}</span>;
  } else if (href && href.startsWith("/") && !download) {
    el = (
      <TransitionLink
        href={href}
        transitionTitle={transitionTitle}
        className={cls}
        onClick={onClick}
        aria-disabled={disabled || undefined}
      >
        {inner}
      </TransitionLink>
    );
  } else if (href) {
    const external = /^https?:/.test(href);
    el = (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-disabled={disabled || undefined}
      >
        {inner}
      </a>
    );
  } else {
    el = (
      <button type={type} className={cls} onClick={onClick} disabled={disabled}>
        {inner}
      </button>
    );
  }
  return magnetic && !asSpan ? <Magnetic strength={0.3}>{el}</Magnetic> : el;
}
