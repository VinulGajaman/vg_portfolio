"use client";

/**
 * Media-query hooks (DESIGN.md §2.4, §7.2). All return false on the server and during
 * hydration, then the real value, so SSR markup never mismatches.
 */
import { useSyncExternalStore } from "react";
import { MQ } from "./motion-tokens";

function subscribeQuery(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

const subscribers = new Map<string, (cb: () => void) => () => void>();
function getSubscriber(query: string) {
  let s = subscribers.get(query);
  if (!s) {
    s = subscribeQuery(query);
    subscribers.set(query, s);
  }
  return s;
}

/** Live `matchMedia(query).matches`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    getSubscriber(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** prefers-reduced-motion: reduce (§6.3). */
export function useReducedMotion(): boolean {
  return useMediaQuery(MQ.reduce);
}

/** (hover: hover) and (pointer: fine): gate for every JS hover effect (§2.4). */
export function usePointerFine(): boolean {
  return useMediaQuery(MQ.fine);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(MQ.isDesktop);
}

export function useIsTablet(): boolean {
  return useMediaQuery(MQ.isTablet);
}

export function useIsPhone(): boolean {
  return useMediaQuery(MQ.isPhone);
}

/** Non-hook checks for event handlers. */
export const matches = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;
export const prefersReducedMotion = () => matches(MQ.reduce);
export const isFinePointer = () => matches(MQ.fine);
