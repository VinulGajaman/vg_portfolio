"use client";

/**
 * Compact nav (DESIGN.md §3.1, U16, revised per Vinul): once the hero nav has scrolled away (scrollY > 120) a bare hamburger icon
 * (no label, no pill) stays fixed top-right in a 48px hit area, with mix-blend-mode: difference so
 * it reads over any section or photo. Only the icon floats (per Vinul); the in-flow nav logo,
 * footer logo and menu Home link go back to the hero.
 * Enters with yPercent −150 → 0 (0.6s drawer) and stays put while scrolling in either direction.
 * Stays visible while the menu is open (z 42). Magnetic. Off in the `portvio` profile.
 */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { setUI, useUI, getUI } from "@/lib/store";
import { Magnetic } from "@/components/motion/Magnetic";
import { MenuTrigger } from "./MenuTrigger";
import { cn } from "@/lib/cn";

/** Just past the in-flow nav (72–90px tall), so a menu trigger is always on screen. */
const SHOW_AFTER = 120;

export function CompactNav() {
  const pillRef = useRef<HTMLDivElement>(null);
  const menuOpen = useUI((s) => s.menuOpen);
  const shown = useUI((s) => s.compactNav);
  const menuRef = useRef(menuOpen);
  useEffect(() => {
    menuRef.current = menuOpen;
  });

  useMotion(
    ({ reduce }) => {
      const pill = pillRef.current;
      if (!pill || !isPlus) return;
      const els = [pill];
      gsap.set(els, { yPercent: -150, autoAlpha: 0 });
      let visible = false;
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
          if (menuRef.current) return;
          show(self.scroll() > SHOW_AFTER);
        },
        onRefresh: (self) => show(self.scroll() > SHOW_AFTER),
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
    <div
      ref={pillRef}
      className={cn(
        "invisible fixed right-2 top-2 mix-blend-difference md:right-3",
        menuOpen && shown ? "z-[42]" : "z-20",
      )}
    >
      <Magnetic>
        <MenuTrigger iconOnly className="text-white" />
      </Magnetic>
    </div>
  );
}
