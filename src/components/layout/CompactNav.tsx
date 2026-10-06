"use client";

/**
 * Compact nav pill (DESIGN.md §3.1, U16). Fixed top 16 / right 20 (phone 16), z 20: a 48px pill
 * (rgba(13,13,13,.6), blur(12px), 1px #3C3C3C, radius 100, padding 0 18) with the hamburger and
 * "Menu". Plus a 40px orange "V" disc at top-left linking to #hero. Appears once scrollY > 100vh
 * (yPercent −150 → 0, 0.6s drawer); hides on scroll down (delta > 8px), shows on scroll up.
 * Stays visible while the menu is open (z 42). Magnetic. Off in the `portvio` profile.
 */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { setUI, useUI, getUI } from "@/lib/store";
import { LogoMark } from "@/components/brand/Logo";
import { Magnetic } from "@/components/motion/Magnetic";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MenuTrigger } from "./MenuTrigger";
import { cn } from "@/lib/cn";

export function CompactNav() {
  const pillRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const menuOpen = useUI((s) => s.menuOpen);
  const shown = useUI((s) => s.compactNav);
  const menuRef = useRef(menuOpen);
  useEffect(() => {
    menuRef.current = menuOpen;
  });

  useMotion(
    ({ reduce }) => {
      const pill = pillRef.current;
      const disc = discRef.current;
      if (!pill || !disc || !isPlus) return;
      const els = [pill, disc];
      gsap.set(els, { yPercent: -150, autoAlpha: 0 });
      let visible = false;
      let last = 0;
      const show = (v: boolean) => {
        if (v === visible) return;
        visible = v;
        setUI({ compactNav: v });
        gsap.to(els, {
          yPercent: v ? 0 : -150,
          autoAlpha: v ? 1 : 0,
          duration: reduce ? 0.2 : 0.6,
          ease: "drawer",
          overwrite: true,
        });
      };
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const delta = y - last;
          if (Math.abs(delta) < 8) return;
          last = y;
          if (menuRef.current) return;
          if (y <= window.innerHeight) show(false);
          else show(delta < 0);
        },
      });
      return () => {
        st.kill();
        if (!getUI().menuOpen) setUI({ compactNav: false });
      };
    },
    { scope: pillRef },
  );

  if (!isPlus) return null;
  return (
    <>
      <div
        ref={discRef}
        className={cn("invisible fixed left-4 top-4 md:left-5", menuOpen && shown ? "z-[42]" : "z-20")}
      >
        <Magnetic>
          <TransitionLink href="/#hero" aria-label="Back to top" className="pressable block rounded-full">
            <LogoMark size={40} />
          </TransitionLink>
        </Magnetic>
      </div>
      <div
        ref={pillRef}
        className={cn("invisible fixed right-4 top-4 md:right-5", menuOpen && shown ? "z-[42]" : "z-20")}
      >
        <Magnetic>
          <div className="border-overlay flex h-12 items-center rounded-pill bg-[rgba(13,13,13,.6)] px-[18px] backdrop-blur-[12px]">
            <MenuTrigger />
          </div>
        </Magnetic>
      </div>
    </>
  );
}
