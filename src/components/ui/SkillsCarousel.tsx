"use client";

/**
 * <SkillsCarousel>: the CV's full skills list as a scroll-driven 3D ring (skills idea 4 of 4).
 * A 300vh track with a sticky 100svh stage (CSS sticky, no ScrollTrigger pin). Seven cards in
 * the bento card style (orange number + count, Clash group name, outline chips, ghost number)
 * stand on a ring around the Y axis, tilted rotateX(-6deg), pushed back by its radius so the front
 * card is true size, and seen through perspective 1800px.
 * Scrolling the track rotates the ring one card per ~33vh (scrub .8): each card gets
 * rotateY(i·step − rot) translateZ(R) with R fitted to the card width, opacity
 * .12 + .88·cos(angle)^1.5 and z-order by facing, so the front card is bright and the sides turn
 * away into the dark (backfaces hidden). All cards share one fixed height per breakpoint
 * (400 / 440px). Seven progress dots track the front card. Entrance: the ring rises from scale .85 and fades in once in view.
 * Reduced motion: no track, no 3D; the cards render as a plain grid.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const N = skillGroups.length;
const STEP = 360 / N;

export function SkillsCarousel({ className }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce, isPhone }) => {
      const track = trackRef.current;
      const ring = ringRef.current;
      if (!track || !ring || reduce) return;
      const cards = Array.from(ring.children) as HTMLElement[];
      const dots = Array.from(dotsRef.current?.children ?? []) as HTMLElement[];
      const R = () => Math.round(cards[0].offsetWidth / (2 * Math.tan(Math.PI / N)) + (isPhone ? 24 : 70));
      let radius = R();
      let front = -1;
      const state = { rot: 0 };

      // Push the ring back by its radius so the front card shows at its true size (otherwise it
      // sits R px nearer the viewer, grows, and covers the counter below).
      const place = () => {
        ring.style.transform = `translateZ(${-radius}px) rotateX(-6deg)`;
      };
      place();

      const render = () => {
        cards.forEach((c, i) => {
          const a = i * STEP - state.rot;
          const facing = Math.cos((a * Math.PI) / 180);
          c.style.transform = `translate(-50%, -50%) rotateY(${a}deg) translateZ(${radius}px)`;
          c.style.opacity = String(0.12 + 0.88 * Math.max(0, facing) ** 1.5);
          c.style.zIndex = String(Math.round((facing + 1) * 100));
        });
        const idx = ((Math.round(state.rot / STEP) % N) + N) % N;
        if (idx !== front) {
          front = idx;
          dots.forEach((d, i) => d.classList.toggle("is-on", i === idx));
          cards.forEach((c, i) => c.classList.toggle("is-front", i === idx));
        }
      };
      render();

      const tween = gsap.to(state, {
        rot: STEP * (N - 1),
        ease: "none",
        onUpdate: render,
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: () => {
            radius = R();
            place();
            render();
          },
        },
      });

      gsap.set(ring, { scale: 0.85, autoAlpha: 0 });
      const intro = gsap.to(ring, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "expo.out", paused: true });
      const st = onceInView(track, () => intro.play(), { settle: () => intro.progress(1) });

      return () => {
        st.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
        ring.style.transform = "";
        cards.forEach((c) => {
          c.style.transform = "";
          c.style.opacity = "";
          c.style.zIndex = "";
        });
      };
    },
    { scope: trackRef },
  );

  return (
    <div ref={trackRef} className={cn("relative h-[300vh] motion-reduce:h-auto", className)}>
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        {/* Ring */}
        <div className="relative h-[440px] w-full [perspective:1800px] md:h-[500px] motion-reduce:h-auto">
          <div
            ref={ringRef}
            className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(-6deg)] motion-reduce:static motion-reduce:grid motion-reduce:gap-3 motion-reduce:[transform:none] md:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3"
          >
            {skillGroups.map((g, i) => (
              <article
                key={g.label}
                className="group border-overlay edge-light absolute left-1/2 top-1/2 flex h-[400px] w-[270px] flex-col overflow-hidden rounded-2xl bg-surface p-6 [backface-visibility:hidden] after:transition-colors after:duration-500 md:h-[440px] md:w-[360px] md:p-8 lg:w-[380px] [&.is-front]:after:border-accent/40 motion-reduce:static motion-reduce:w-auto"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[130px] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.12)] md:text-[160px]"
                >
                  {pad(i + 1)}
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-700 [.is-front>&]:opacity-100"
                  style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(246,88,2,.16), transparent)" }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="type-small tabular text-accent">{pad(i + 1)}</span>
                  <span className="type-small tabular text-ink-faint">{pad(g.items.length)} tools</span>
                </div>
                <h3 className="relative mt-8 font-display text-[26px] font-semibold uppercase leading-[1.05] text-ink md:mt-10 md:text-[32px]">
                  {g.label}
                </h3>
                <ul className="relative mt-auto flex flex-wrap gap-2 pt-8">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="type-body whitespace-nowrap rounded-pill border border-line bg-canvas/40 px-[14px] py-[6px] text-ink-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div aria-hidden className="mt-10 flex flex-col items-center md:mt-14 motion-reduce:hidden">
          <div ref={dotsRef} className="flex gap-2">
            {skillGroups.map((g) => (
              <span
                key={g.label}
                className="h-[3px] w-5 rounded-full bg-line transition-[background-color,width] duration-500 [&.is-on]:w-10 [&.is-on]:bg-accent"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
