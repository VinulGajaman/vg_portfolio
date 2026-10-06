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
  function TransitionLink({ href, transitionTitle, onNavigate, onClick, ...rest }, ref) {
    const { navigate } = usePageTransition();
    return (
      <Link
        ref={ref}
        href={href}
        scroll={false}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          // Same-page links (e.g. the logo → "/#hero") never reach onNavigate: Next handles the hash
          // itself and jumps natively. Intercept here so Lenis glides there instead.
          const url = new URL(href, window.location.href);
          if (url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "")) {
            e.preventDefault();
            navigate(href, transitionTitle);
          }
        }}
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
