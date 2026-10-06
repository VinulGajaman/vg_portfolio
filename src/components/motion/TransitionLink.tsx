"use client";

/**
 * <TransitionLink>: next/link with the page transition (DESIGN.md §2.5, U15).
 * onNavigate (same-origin SPA navigations only; not modifier-key clicks or downloads) calls
 * e.preventDefault() and hands the href to <PageTransition>, which covers, pushes with
 * { scroll: false } and reveals. Same-page hash links glide with Lenis instead.
 */
import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { usePageTransition } from "./PageTransition";

export type TransitionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: string;
  /** Title shown on the transition panel (default: "Home" or the project title). */
  transitionTitle?: string;
};

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, transitionTitle, onNavigate, ...rest }, ref) {
    const { navigate } = usePageTransition();
    return (
      <Link
        ref={ref}
        href={href}
        scroll={false}
        onNavigate={(e) => {
          onNavigate?.(e);
          e.preventDefault();
          navigate(href, transitionTitle);
        }}
        {...rest}
      />
    );
  },
);
