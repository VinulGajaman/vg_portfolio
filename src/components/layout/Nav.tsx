"use client";

/**
 * Top nav (DESIGN.md §3.1): position absolute (scrolls away), 86px, padding 20, max 1440, z 10.
 * Left group (gap 100 / tablet 80): logo · "Colombo, Sri Lanka" over <LiveClock> · 6px dot +
 * email RollText. Right: Menu trigger. Phone: 72px, padding 20 16, logo + Menu only.
 * Load: y −40 → 0 with autoAlpha, springHero, 0.2s after the intro gate opens (replays per route).
 * While the menu is open (and the compact pill is hidden) the nav rises to z 42 so its trigger
 * becomes the close button.
 */
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import { SPRING_SAMPLES } from "@/lib/motion-tokens";
import { useIntro, useUI } from "@/lib/store";
import { mailto, site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { LiveClock } from "@/components/ui/LiveClock";
import { RollText } from "@/components/motion/RollText";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MenuTrigger } from "./MenuTrigger";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { cn } from "@/lib/cn";

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const menuOpen = useUI((s) => s.menuOpen);
  const compact = useUI((s) => s.compactNav);

  useIntro(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "out" });
        return;
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: -40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: SPRING_SAMPLES.springHero.duration,
          ease: "springHero",
          delay: 0.2,
          clearProps: "transform",
        },
      );
    },
    { replay: true },
  );

  return (
    <nav
      ref={ref}
      aria-label="Primary"
      data-intro=""
      className={cn(
        "absolute left-1/2 top-0 w-full max-w-[1440px] -translate-x-1/2",
        menuOpen && !compact ? "z-[42]" : "z-10",
      )}
    >
      <div className="flex h-[72px] items-center justify-between px-4 py-5 md:h-[86px] md:px-5">
        <div className="flex items-center gap-[80px] lg:gap-[100px]">
          <TransitionLink href="/#hero" aria-label="Vinul Gajaman, home" className="block">
            <Logo />
          </TransitionLink>
          <div
            className={cn(
              "type-link hidden flex-col gap-[6px] text-ink transition-opacity duration-300 md:flex",
              menuOpen && "md:max-lg:opacity-0",
            )}
          >
            <span>{site.location}</span>
            <LiveClock tz={site.timeZone} />
          </div>
          <a
            href={mailto}
            className={cn(
              "type-link hidden items-center gap-[10px] text-ink transition-opacity duration-300 md:flex",
              menuOpen && "md:max-lg:opacity-0",
            )}
          >
            <span aria-hidden className="size-[6px] rounded-full bg-ink" />
            <RollText>{site.email}</RollText>
          </a>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <SoundToggle className="text-ink" />
          <MenuTrigger />
        </div>
      </div>
    </nav>
  );
}
