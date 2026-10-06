"use client";

/**
 * <PageTransition> provider (DESIGN.md §2.5, U15) + Back/Forward scroll restoration (§2.4).
 * Cover (0.7s): orange #F65802 panel (z 70) then #0A0A0A (z 71) 0.08s later, each from
 * yPercent 100 + skewY 7° → 0 on expoInOut; the destination title rises on the dark panel
 * (h2, RevealText chars). Swap: router.push(href, {scroll:false}) → lenis.scrollTo(0,
 * immediate) → wait for usePathname() + one rAF → ScrollTrigger.refresh(). Reveal (0.7s): dark
 * → yPercent −100 + skewY −7°, orange 0.06s later; the new page's intro starts 0.35s in.
 * Hash links to home from a detail page scroll to the anchor before the reveal.
 * Back/Forward: no cover; scroll restored by hand (history.scrollRestoration = "manual",
 * sessionStorage "vg-scroll:<path>"), then a 0.3s fade-in. Reduced motion: 200ms crossfade.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, setRestoring } from "@/lib/gsap";
import { getScrollY, lockScroll, scrollToTarget, unlockScroll } from "@/lib/scroll";
import { resetIntro, setUI, startIntro } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/hooks";
import { isPlus } from "@/lib/motion-tokens";
import { getProject } from "@/content/projects";
import { RevealText } from "./RevealText";

type Ctx = {
  /** Navigate with the cover → swap → reveal sequence. */
  navigate: (href: string, title?: string) => void;
};

const PageTransitionContext = createContext<Ctx>({
  navigate: (href) => {
    window.location.href = href;
  },
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p) || "/";

/** "Home" for "/", the project title for "/work/<slug>". */
export function titleForPath(pathname: string): string {
  const p = norm(pathname);
  if (p === "/") return "Home";
  const m = p.match(/^\/work\/([^/]+)$/);
  if (m) return getProject(m[1])?.title ?? "Work";
  return "Vinul Gajaman";
}

const storeKey = (path: string) => `vg-scroll:${norm(path)}`;
function saveScroll(path: string) {
  try {
    sessionStorage.setItem(storeKey(path), String(Math.round(getScrollY())));
  } catch {
    /* storage unavailable */
  }
}
function readScroll(path: string): number {
  try {
    return Number(sessionStorage.getItem(storeKey(path)) ?? 0) || 0;
  } catch {
    return 0;
  }
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const orangeRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const waiter = useRef<(() => void) | null>(null);
  const popPending = useRef(false);
  const lastPath = useRef(pathname);
  const [title, setTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0);
  const [titleOn, setTitleOn] = useState(false);

  // Manual scroll restoration (§2.4).
  useEffect(() => {
    history.scrollRestoration = "manual";
    const onPop = () => {
      saveScroll(lastPath.current);
      popPending.current = true;
      const main = document.getElementById("main");
      if (main) main.style.opacity = "0";
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Route changed.
  useEffect(() => {
    lastPath.current = pathname;
    if (waiter.current) {
      const resolve = waiter.current;
      waiter.current = null;
      requestAnimationFrame(() => resolve());
      return;
    }
    if (popPending.current) {
      popPending.current = false;
      const main = document.getElementById("main");
      setRestoring(true);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          scrollToTarget(readScroll(pathname), { immediate: true, force: true });
          ScrollTrigger.update();
          startIntro();
          if (main) {
            gsap.fromTo(
              main,
              { opacity: 0 },
              { opacity: 1, duration: 0.3, ease: "out", clearProps: "opacity" },
            );
          }
          requestAnimationFrame(() => setRestoring(false));
        });
      });
    }
  }, [pathname]);

  const navigate = useCallback(
    async (href: string, destTitle?: string) => {
      if (busy.current) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      const samePath = norm(url.pathname) === norm(window.location.pathname);
      if (samePath) {
        scrollToTarget(url.hash || 0);
        return;
      }

      busy.current = true;
      saveScroll(window.location.pathname);
      const reduce = prefersReducedMotion() || !isPlus;
      const orange = orangeRef.current!;
      const dark = darkRef.current!;
      setUI({ transitioning: true });
      lockScroll("transition");

      const routeChanged = new Promise<void>((resolve) => {
        waiter.current = resolve;
      });

      if (reduce) {
        gsap.set(dark, { autoAlpha: 0, yPercent: 0, skewY: 0 });
        await gsap.to(dark, { autoAlpha: 1, duration: 0.2, ease: "out" });
        resetIntro();
        router.push(url.pathname + url.search, { scroll: false });
        await routeChanged;
        scrollToTarget(url.hash || 0, { immediate: true, force: true });
        ScrollTrigger.refresh();
        startIntro();
        await gsap.to(dark, { autoAlpha: 0, duration: 0.2, ease: "out" });
      } else {
        setTitle(destTitle ?? titleForPath(url.pathname));
        setTitleKey((k) => k + 1);
        setTitleOn(false);
        gsap.set([orange, dark], { autoAlpha: 1, yPercent: 100, skewY: 7 });
        const cover = gsap
          .timeline()
          .to(orange, { yPercent: 0, skewY: 0, duration: 0.7, ease: "expoInOut" }, 0)
          .to(dark, { yPercent: 0, skewY: 0, duration: 0.7, ease: "expoInOut" }, 0.08)
          .call(() => setTitleOn(true), [], 0.4);
        await cover;
        resetIntro();
        router.push(url.pathname + url.search, { scroll: false });
        await routeChanged;
        scrollToTarget(0, { immediate: true, force: true });
        if (url.hash) scrollToTarget(url.hash, { immediate: true, force: true });
        await nextFrame();
        ScrollTrigger.refresh();
        await gsap
          .timeline()
          .to(dark, { yPercent: -100, skewY: -7, duration: 0.7, ease: "expoInOut" }, 0)
          .to(orange, { yPercent: -100, skewY: -7, duration: 0.7, ease: "expoInOut" }, 0.06)
          .call(startIntro, [], 0.35);
        gsap.set([orange, dark], { autoAlpha: 0 });
        setTitleOn(false);
      }

      unlockScroll("transition");
      setUI({ transitioning: false });
      busy.current = false;
    },
    [router],
  );

  return (
    <PageTransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={orangeRef}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[70] bg-accent"
      />
      <div
        ref={darkRef}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[71] flex items-center justify-center bg-canvas-deep px-[var(--gutter)]"
      >
        {title && (
          <RevealText
            key={titleKey}
            as="p"
            mode="chars"
            trigger="manual"
            play={titleOn}
            className="type-h2 max-w-[1000px] text-center"
          >
            {title}
          </RevealText>
        )}
      </div>
    </PageTransitionContext.Provider>
  );
}
