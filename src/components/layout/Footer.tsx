"use client";

/**
 * Footer (DESIGN.md §3.12). padding 0 20, max 1440, overflow hidden; portvio's orange glow
 * (radial #F65802 → #0D0D0D, blur 50 on a static layer, opacity .6, 600px at bottom −300;
 * tablet 400/−200, phone 300/−150) follows the cursor x (quickTo 1.2s power3.out, clamped
 * 30–70%) and breathes .5 ↔ .65 over 6s. Layout <Reveal card>; giant name <RevealText chars>
 * (yPercent 100, stagger .04, 1.4s expo.out, 30% visible), white at 10% above the glow.
 */
import { useRef, useState } from "react";
import { gsap, useMotion } from "@/lib/gsap";
import { isPlus } from "@/lib/motion-tokens";
import { scrollToTarget } from "@/lib/scroll";
import { footer, mailto, site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { LiveClock } from "@/components/ui/LiveClock";
import { Wordmark } from "@/components/ui/Wordmark";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { SlotSwap } from "@/components/motion/SlotSwap";
import { Spotlight } from "@/components/motion/Spotlight";
import { Magnetic } from "@/components/motion/Magnetic";
import { TransitionLink } from "@/components/motion/TransitionLink";

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useMotion(
    ({ reduce, fine }) => {
      const root = ref.current;
      const glow = glowRef.current;
      if (!root || !glow || reduce || !fine || !isPlus) return;
      const xTo = gsap.quickTo(glow, "xPercent", { duration: 1.2, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const p = gsap.utils.clamp(0.3, 0.7, e.clientX / window.innerWidth);
        xTo((p - 0.5) * 100);
      };
      root.addEventListener("pointermove", move);
      return () => root.removeEventListener("pointermove", move);
    },
    { scope: ref },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      window.location.href = mailto;
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const colLabel = "type-body mb-4 text-ink-soft";
  const link = "w-fit text-[18px] leading-none text-ink";

  return (
    <Spotlight as="footer" className="section-layer overflow-hidden">
      <div ref={ref} className="relative">
        {/* Glow: static blurred layer (rasterised once), moved by transform only */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-150px] z-0 h-[300px] md:bottom-[-200px] md:h-[400px] lg:bottom-[-300px] lg:h-[600px]"
        >
          <div
            className="h-full w-full opacity-60 blur-[50px] motion-safe:[animation:glow-breathe_6s_ease-in-out_infinite_alternate]"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, #F65802 0%, #0D0D0D 100%)" }}
          />
        </div>

        <div className="container-site relative z-[2] pt-[80px] md:pt-[100px] lg:pt-[140px]">
          <Reveal variant="card" className="flex flex-col gap-[60px]">
            <div className="flex flex-col justify-between gap-[60px] lg:flex-row">
              <div className="flex max-w-[400px] flex-col">
                <TransitionLink href="/#hero" aria-label="Vinul Gajaman, home" className="mb-10 block w-fit">
                  <Logo variant="footer" />
                </TransitionLink>
                <p className="type-body text-ink-soft">{footer.label}</p>
                <p className="type-lead mb-6 mt-2 text-ink">{footer.line}</p>
                <div className="border-overlay-glass flex h-[60px] w-full max-w-[400px] items-center justify-between rounded-md bg-tag py-[6px] pl-5 pr-[6px]">
                  <span className="type-body truncate text-ink">{site.email}</span>
                  <Magnetic>
                    <button
                      type="button"
                      onClick={copy}
                      data-cursor="copy"
                      className="pressable type-ui flex h-[48px] w-[150px] items-center justify-center rounded-sm bg-accent text-accent-ink"
                      aria-label={copied ? "Email copied" : "Copy email address"}
                    >
                      <SlotSwap a={footer.copy} b={footer.copied} active={copied} />
                    </button>
                  </Magnetic>
                  <span className="sr-only" aria-live="polite">
                    {copied ? "Email address copied" : ""}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:w-[688px] lg:grid-cols-[214px_234px_240px] lg:gap-0">
                <div className="flex flex-col">
                  <span className={colLabel}>{footer.columns.menu.label}</span>
                  <ul className="flex flex-col gap-[18px]">
                    {footer.columns.menu.links.map((l) => (
                      <li key={l.anchor}>
                        <TransitionLink href={`/#${l.anchor}`} className={link}>
                          <RollText>{l.label}</RollText>
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col">
                  <span className={colLabel}>{footer.columns.social.label}</span>
                  <ul className="flex flex-col gap-[18px]">
                    {Object.values(site.socials).map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                          <RollText>{s.label}</RollText>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-2 flex flex-col md:col-span-1">
                  <span className={colLabel}>{footer.columns.location.label}</span>
                  <span className="type-link mb-2 text-ink">{site.location}</span>
                  <LiveClock tz={site.timeZone} className="type-link text-ink" />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-10 lg:flex-row lg:items-end">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="type-small text-ink">{footer.copyright}</p>
                <button type="button" onClick={() => scrollToTarget(0)} className="type-small text-ink-soft">
                  <RollText>{footer.backToTop}</RollText>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:w-[688px]">
                <div className="flex flex-col">
                  <span className={colLabel}>{footer.emailLabel}</span>
                  <a href={mailto} className={link}>
                    <RollText>{site.email}</RollText>
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className={colLabel}>{footer.phoneLabel}</span>
                  <a href={site.phoneHref} className={link}>
                    <RollText>{site.phone}</RollText>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="container-site pointer-events-none relative z-[2] mt-[60px] overflow-hidden">
          <RevealText
            mode="chars"
            fromYPercent={100}
            stagger={0.04}
            duration={1.4}
            start="30% bottom"
            className="mb-[-0.06em]"
          >
            <Wordmark variant="footer" textClassName="text-[rgba(255,255,255,.10)]" />
          </RevealText>
        </div>
      </div>
    </Spotlight>
  );
}
