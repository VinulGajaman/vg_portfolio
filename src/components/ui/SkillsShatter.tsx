"use client";

/**
 * <SkillsShatter>: the CV's skills as scroll-scrubbed shattered typography.
 * A tall track (≈ 85vh per group) with a sticky 100svh stage. For each group, scroll assembles
 * the group name letter by letter from scattered 3D positions (x ±45vw, y ±40vh, scale .2–2.6,
 * rotation ±160°, blur 14px, opacity 0) into a giant Clash word, then the skills pop in below;
 * further scroll shatters the word outward (new random vectors) as the next group assembles.
 * Everything is scrubbed (scrub .6), so scrolling back rewinds. A vertical rail (01–07) and a
 * progress line track the active group; the background glow drifts between groups.
 * Random vectors are seeded, so server and client render the same markup.
 * Reduced motion: no track; each group is shown as a static heading with its skills.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const N = skillGroups.length;
const pad = (n: number) => String(n).padStart(2, "0");
const seeded = (i: number) => {
  const x = Math.sin(i * 91.17 + 13.7) * 43758.5453;
  return x - Math.floor(x);
};
const spread = (i: number, k: number, isPhone: boolean) => ({
  x: (seeded(i * 7 + k) - 0.5) * (isPhone ? 140 : 90) + "vw",
  y: (seeded(i * 13 + k + 3) - 0.5) * 80 + "vh",
  scale: 0.2 + seeded(i * 5 + k + 9) * 2.4,
  rotation: (seeded(i * 11 + k + 1) - 0.5) * 320,
  rotationX: (seeded(i * 3 + k + 5) - 0.5) * 160,
  opacity: 0,
  filter: "blur(14px)",
});

export function SkillsShatter({ className }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isPhone }) => {
      const track = trackRef.current;
      if (!track || reduce) return;
      const groups = Array.from(track.querySelectorAll<HTMLElement>("[data-shatter-group]"));
      const rail = Array.from(track.querySelectorAll<HTMLElement>("[data-shatter-rail]"));
      const fill = track.querySelector<HTMLElement>("[data-shatter-fill]");
      const glow = track.querySelector<HTMLElement>("[data-shatter-glow]");

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(N - 1, Math.floor(self.progress * N));
            rail.forEach((r, i) => r.classList.toggle("is-on", i === idx));
            if (fill) fill.style.transform = `scaleY(${self.progress})`;
          },
        },
      });

      groups.forEach((g, gi) => {
        const chars = Array.from(g.querySelectorAll<HTMLElement>("[data-shatter-char]"));
        const chips = Array.from(g.querySelectorAll<HTMLElement>("[data-shatter-chip]"));
        const meta = g.querySelector<HTMLElement>("[data-shatter-meta]");
        const at = gi * 10; // each group spans 10 timeline units
        gsap.set(g, { autoAlpha: 1 });
        // enter: each letter flies in from its own scattered 3D position (group 1 starts assembled)
        if (gi > 0) {
          chars.forEach((c, k) =>
            tl.fromTo(
              c,
              spread(gi, k, isPhone),
              { x: 0, y: 0, scale: 1, rotation: 0, rotationX: 0, opacity: 1, filter: "blur(0px)", duration: 4 },
              at - 3 + seeded(gi * 17 + k) * 1.4,
            ),
          );
        }
        tl.fromTo(meta, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.2 }, at + 0.6);
        tl.fromTo(
          chips,
          { autoAlpha: 0, y: 30, scale: 0.8 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.4, stagger: 0.15, ease: "back.out(2)" },
          at + 1,
        );
        if (glow) tl.to(glow, { xPercent: (seeded(gi) - 0.5) * 60, yPercent: (seeded(gi + 4) - 0.5) * 40, duration: 6 }, at);
        // exit (not for the last group)
        if (gi < N - 1) {
          tl.to(chips, { autoAlpha: 0, y: -30, duration: 1.2, stagger: 0.05, ease: "power2.in" }, at + 6);
          tl.to(meta, { autoAlpha: 0, duration: 1 }, at + 6);
          chars.forEach((c, k) =>
            tl.to(c, { ...spread(gi + 50, k, isPhone), duration: 3.5, ease: "power2.in" }, at + 6.5 + seeded(gi * 3 + k) * 1),
          );
        }
      });
      // trailing hold on the last group
      tl.to({}, { duration: 2 });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(track.querySelectorAll("[data-shatter-char],[data-shatter-chip],[data-shatter-meta],[data-shatter-group]"), {
          clearProps: "all",
        });
      };
    },
    { scope: trackRef },
  );

  return (
    <div ref={trackRef} className={cn("relative h-[600vh] motion-reduce:h-auto", className)}>
      <div className="sticky top-0 h-[100svh] overflow-hidden [perspective:900px] motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        <span
          data-shatter-glow=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 size-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:hidden"
          style={{ background: "radial-gradient(closest-side, rgba(246,88,2,.16), transparent)" }}
        />

        {/* Rail */}
        <div aria-hidden className="absolute left-[var(--gutter)] top-1/2 z-[2] hidden -translate-y-1/2 items-stretch gap-4 md:flex motion-reduce:hidden">
          <span className="relative w-px bg-line">
            <span data-shatter-fill="" className="absolute inset-0 origin-top scale-y-0 bg-accent" />
          </span>
          <span className="flex flex-col gap-3">
            {skillGroups.map((g, i) => (
              <span
                key={g.label}
                data-shatter-rail=""
                className="type-small tabular text-ink-faint transition-colors duration-300 [&.is-on]:text-accent"
              >
                {pad(i + 1)}
              </span>
            ))}
          </span>
        </div>

        {skillGroups.map((g, gi) => (
          <div
            key={g.label}
            data-shatter-group=""
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center px-[var(--gutter)] text-center [transform-style:preserve-3d]",
              "motion-reduce:static motion-reduce:py-10",
              gi > 0 && "invisible motion-reduce:visible",
            )}
          >
            <p data-shatter-meta="" className="type-small tabular text-ink-soft">
              <span className="text-accent">{pad(gi + 1)}</span> / {pad(N)} · {pad(g.items.length)} tools
            </p>
            <h3
              aria-label={g.label}
              className="mt-4 font-display text-[11vw] font-bold uppercase leading-[.9] text-ink [transform-style:preserve-3d] md:text-[8.5vw]"
            >
              {Array.from(g.label).map((ch, k) => (
                <span key={k} data-shatter-char="" aria-hidden className="inline-block whitespace-pre will-change-transform">
                  {ch}
                </span>
              ))}
            </h3>
            <ul className="mt-8 flex max-w-[900px] flex-wrap justify-center gap-2 md:mt-10">
              {g.items.map((item) => (
                <li
                  key={item}
                  data-shatter-chip=""
                  className="whitespace-nowrap rounded-pill border border-line bg-white/[.04] px-4 py-2 font-display text-[14px] font-semibold uppercase text-ink backdrop-blur-sm md:text-[17px]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
