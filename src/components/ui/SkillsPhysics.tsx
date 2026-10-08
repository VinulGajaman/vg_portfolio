"use client";

/**
 * <SkillsPhysics>: the CV's full skills list as a gravity playground (skills idea, round 2).
 * A dark card (#232222, radius 16, 1px line, edge light; 600 / 540 / 560px tall,
 * smaller pills on phone so the pile stays under the header) holds every
 * skill as a pill plus the seven group names as orange Clash tags. When the card scrolls into
 * view the pills drop from above in a staggered rain and settle into a pile under matter-js
 * physics (gravity 1, restitution .3, pill-shaped chamfered bodies).
 *   - Fine pointers: grab, drag and throw any pill (MouseConstraint). Matter's wheel and touch
 *     listeners are detached so the page keeps scrolling normally over the card.
 *   - Touch: tap a pill to bounce it up.
 *   - The simulation steps on gsap.ticker only while the card is on screen; walls follow resizes.
 * Reduced motion / no JS: the same pills in a static wrapped layout.
 */
import { useRef } from "react";
import Matter from "matter-js";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type Chip = { label: string; kind: "group" | "solid" | "outline" };

/** Group tag first, then its skills alternating solid / outline. */
const CHIPS: Chip[] = skillGroups.flatMap((g) => [
  { label: g.label, kind: "group" as const },
  ...g.items.map((label, j) => ({ label, kind: (j % 2 ? "outline" : "solid") as Chip["kind"] })),
]);
const TOTAL = skillGroups.reduce((n, g) => n + g.items.length, 0);

const CHIP_CLASS: Record<Chip["kind"], string> = {
  group:
    "bg-accent px-4 py-2.5 font-display text-[13px] font-semibold uppercase text-accent-ink md:px-5 md:py-3 md:text-[20px]",
  solid: "type-body bg-ink px-3 py-1.5 font-medium text-canvas max-md:text-[13px] md:px-4 md:py-2",
  outline: "type-body border border-white/30 bg-surface-2 px-3 py-1.5 text-ink max-md:text-[13px] md:px-4 md:py-2",
};

export function SkillsPhysics({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useMotion(
    ({ reduce, fine }) => {
      const box = boxRef.current;
      const list = listRef.current;
      if (!box || !list || reduce) return;
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter;
      const els = Array.from(list.children) as HTMLElement[];

      list.classList.add("is-live");
      els.forEach((el) => (el.style.transform = "translate(-9999px, 0)"));
      let W = box.clientWidth;
      let H = box.clientHeight;

      const engine = Engine.create({ gravity: { x: 0, y: 1 } });
      const T = 200;
      const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.4 };
      const floor = Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wallOpts);
      const left = Bodies.rectangle(-T / 2, H / 2 - H, T, H * 4, wallOpts);
      const right = Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 4, wallOpts);
      Composite.add(engine.world, [floor, left, right]);

      const bodies: Matter.Body[] = [];
      let live = false;
      let visible = false;

      const drop = () => {
        if (live) return;
        live = true;
        els.forEach((el, i) => {
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          const x = w / 2 + Math.random() * Math.max(1, W - w);
          const y = -h - i * 38 - Math.random() * 60;
          const body = Bodies.rectangle(x, y, w, h, {
            chamfer: { radius: h / 2 },
            restitution: 0.3,
            friction: 0.08,
            frictionAir: 0.012,
            density: el.dataset.kind === "group" ? 0.003 : 0.0015,
            angle: (Math.random() - 0.5) * 0.6,
          });
          bodies.push(body);
          (body as Matter.Body & { el?: HTMLElement }).el = el;
        });
        Composite.add(engine.world, bodies);
      };

      const tick = (_t: number, delta: number) => {
        if (!live || !visible) return;
        Engine.update(engine, Math.min(delta, 32));
        for (const b of bodies) {
          const el = (b as Matter.Body & { el?: HTMLElement }).el!;
          el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${b.position.y - el.offsetHeight / 2}px) rotate(${b.angle}rad)`;
        }
      };
      gsap.ticker.add(tick);

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(box);
      const st = onceInView(box, drop, { settle: drop });

      // Walls follow the card size; keep bodies inside.
      const ro = new ResizeObserver(() => {
        W = box.clientWidth;
        H = box.clientHeight;
        Body.setPosition(floor, { x: W / 2, y: H + T / 2 });
        Body.setPosition(left, { x: -T / 2, y: H / 2 - H });
        Body.setPosition(right, { x: W + T / 2, y: H / 2 - H });
        for (const b of bodies) {
          const x = Math.min(Math.max(b.position.x, 20), W - 20);
          if (x !== b.position.x) Body.setPosition(b, { x, y: Math.min(b.position.y, H - 40) });
        }
      });
      ro.observe(box);

      // Interaction
      let cleanupInput = () => {};
      if (fine) {
        const mouse = Mouse.create(box);
        const m = mouse as Matter.Mouse & {
          mousewheel: EventListener;
          mousemove: EventListener;
          mousedown: EventListener;
          mouseup: EventListener;
        };
        box.removeEventListener("wheel", m.mousewheel);
        box.removeEventListener("touchmove", m.mousemove);
        box.removeEventListener("touchstart", m.mousedown);
        box.removeEventListener("touchend", m.mouseup);
        const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1 } });
        Composite.add(engine.world, mc);
        // Release when the button comes up outside the card.
        window.addEventListener("mouseup", m.mouseup);
        cleanupInput = () => {
          window.removeEventListener("mouseup", m.mouseup);
          box.removeEventListener("mousemove", m.mousemove);
          box.removeEventListener("mousedown", m.mousedown);
          box.removeEventListener("mouseup", m.mouseup);
        };
      } else {
        const onTap = (e: Event) => {
          const b = bodies.find((x) => (x as Matter.Body & { el?: HTMLElement }).el === e.currentTarget);
          if (b) Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: -12 });
        };
        els.forEach((el) => el.addEventListener("click", onTap));
        cleanupInput = () => els.forEach((el) => el.removeEventListener("click", onTap));
      }

      return () => {
        cleanupInput();
        gsap.ticker.remove(tick);
        io.disconnect();
        ro.disconnect();
        st.kill();
        Engine.clear(engine);
        list.classList.remove("is-live");
        els.forEach((el) => (el.style.transform = ""));
      };
    },
    { scope: boxRef },
  );

  return (
    <div
      ref={boxRef}
      className={cn(
        "border-overlay edge-light relative h-[600px] select-none overflow-hidden rounded-2xl bg-surface md:h-[540px] lg:h-[560px] pointer-fine:cursor-grab pointer-fine:active:cursor-grabbing",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-5 z-[1] flex items-center justify-between md:inset-x-8 md:top-6">
        <span className="type-small text-ink-soft">
          <span className="text-accent">✦</span> <span className="pointer-fine:hidden">Tap to bounce</span>
          <span className="hidden pointer-fine:inline">Drag, throw, play</span>
        </span>
        <span className="type-small tabular text-ink-faint">
          {TOTAL} tools · {skillGroups.length} groups
        </span>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: "radial-gradient(70% 100% at 50% 100%, rgba(246,88,2,.12), transparent)" }}
      />

      <ul
        ref={listRef}
        aria-label="Skills"
        className="absolute inset-0 flex flex-wrap content-end gap-2 p-6 pt-16 md:p-8 md:pt-20 [&.is-live]:block [&.is-live]:p-0"
      >
        {CHIPS.map((c) => (
          <li
            key={`${c.kind}-${c.label}`}
            data-kind={c.kind}
            className={cn(
              "whitespace-nowrap rounded-pill leading-none will-change-transform [.is-live_&]:absolute [.is-live_&]:left-0 [.is-live_&]:top-0",
              CHIP_CLASS[c.kind],
            )}
          >
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
