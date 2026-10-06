"use client";

/**
 * Tiny external UI store (menu, preloader, transitions, intro gate, scroll lock).
 * useSyncExternalStore keeps React renders limited to the components that read a slice.
 */
import { useEffect, useRef, useSyncExternalStore } from "react";

export type UIState = {
  menuOpen: boolean;
  /** Preloader is on screen. */
  preloader: boolean;
  /** A page transition cover is running. */
  transitioning: boolean;
  /**
   * Hero / page intro gate. False until the preloader reaches 0.55s of its exit, 0.3s after a
   * later-visit load, or 0.35s into a page-transition reveal. Reset to false on route cover.
   */
  introReady: boolean;
  /** Increments every time the intro gate opens (lets persistent components replay). */
  introId: number;
  /** The compact nav pill is on screen. */
  compactNav: boolean;
};

const initial: UIState = {
  menuOpen: false,
  preloader: false,
  transitioning: false,
  introReady: false,
  introId: 0,
  compactNav: false,
};

let state: UIState = initial;
const listeners = new Set<() => void>();

export function getUI(): UIState {
  return state;
}

export function setUI(patch: Partial<UIState>) {
  let changed = false;
  for (const k in patch) {
    const key = k as keyof UIState;
    if (state[key] !== patch[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeUI(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Read one slice of UI state. */
export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    subscribeUI,
    () => selector(state),
    () => selector(initial),
  );
}

/** Opens the intro gate (§2.5 Preloader, §2.5 PageTransition). */
export function startIntro() {
  setUI({ introReady: true, introId: state.introId + 1 });
}

/** Closes the intro gate before a route cover so the next page waits. */
export function resetIntro() {
  setUI({ introReady: false });
}

/**
 * Calls `cb` once when the intro gate is open (immediately if it already is). Pass
 * `{ replay: true }` for persistent components (Nav) that should replay on every route intro.
 */
export function useIntro(cb: () => void, opts: { replay?: boolean } = {}) {
  const ready = useUI((s) => s.introReady);
  const id = useUI((s) => s.introId);
  const ran = useRef<number | null>(null);
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (!ready) return;
    if (ran.current !== null && (!opts.replay || ran.current === id)) return;
    ran.current = id;
    cbRef.current();
  }, [ready, id, opts.replay]);
}
