"use client";

/**
 * <SkillsBoard>: the CV's full skills list as an airport split-flap departures board
 * (a nod to the AASL airport access-control work). A dark board (#0e0d0d, radius 16, 1px line,
 * edge light): header "VG · Stack departures" with a live Colombo clock, column labels, then one
 * row per CV group: number, group name and the current tool as split-flap tiles, and a
 * "02/05" counter.
 * Flaps: when a cell's text changes, each tile scrambles through random characters (45ms steps,
 * 3–6 steps, start staggered 28ms per tile) and settles; every character change replays the
 * `flap` keyframe (rotateX −90° → 0, 120ms). DOM is updated directly, no React re-render per step.
 * Cycle: each row advances to its next tool every CYCLE_MS, rows offset so the board keeps
 * flipping somewhere. Rows only cycle while the board is on screen; a hovered row holds.
 * Entrance: everything flips in from blank once the board scrolls into view.
 * Reduced motion: no flaps; each row lists all its tools as plain text.
 */
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/content/stack";
import { useReducedMotion } from "@/lib/hooks";
import { LiveClock } from "@/components/ui/LiveClock";
import { cn } from "@/lib/cn";

const CYCLE_MS = 3200;
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-";
const TOOL_LEN = Math.max(
  ...skillGroups.flatMap((g) => g.items.map((s) => s.length)),
);
const GROUP_LEN = Math.max(...skillGroups.map((g) => g.label.length));
const pad = (n: number) => String(n).padStart(2, "0");

/** A row of split-flap tiles showing `text` (upper-cased, padded to `length`). */
function Flaps({
  text,
  length,
  armed,
  accent,
}: {
  text: string;
  length: number;
  armed: boolean;
  accent?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<string>(" ".repeat(length));

  useEffect(() => {
    const root = ref.current;
    if (!root || !armed) return;
    const tiles = Array.from(root.children) as HTMLElement[];
    const target = text.toUpperCase().padEnd(length, " ").slice(0, length);
    const timers: number[] = [];
    const set = (el: HTMLElement, ch: string) => {
      const face = el.firstElementChild as HTMLElement;
      face.textContent = ch === " " ? " " : ch;
      face.style.animation = "none";
      void face.offsetWidth;
      face.style.animation = "flap 120ms ease-out";
    };
    tiles.forEach((el, i) => {
      const from = shown.current[i];
      const to = target[i];
      if (from === to) return;
      const steps = 3 + Math.floor(Math.random() * 4);
      for (let k = 0; k <= steps; k++) {
        timers.push(
          window.setTimeout(
            () => {
              set(
                el,
                k === steps
                  ? to
                  : CHARSET[Math.floor(Math.random() * CHARSET.length)],
              );
            },
            i * 28 + k * 45,
          ),
        );
      }
    });
    shown.current = target;
    return () => timers.forEach(clearTimeout);
  }, [text, length, armed]);

  return (
    <span ref={ref} aria-hidden className="inline-flex gap-[.12em]">
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          className="relative inline-grid h-[1.55em] w-[1.05em] place-items-center overflow-hidden rounded-[3px] bg-[#232222] [perspective:200px] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/70"
        >
          <span
            className={cn(
              "block origin-center leading-none",
              accent ? "text-accent" : "text-ink",
            )}
          >
            {" "}
          </span>
        </span>
      ))}
    </span>
  );
}

export function SkillsBoard({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [idx, setIdx] = useState<number[]>(() => skillGroups.map(() => 0));

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setArmed(true);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One clock drives every row; rows are offset so they flip at different moments.
  useEffect(() => {
    if (!armed || !visible || reduce) return;
    const started = performance.now();
    const fired = skillGroups.map(() => 0);
    const id = window.setInterval(() => {
      const t = performance.now() - started;
      setIdx((prev) => {
        let next: number[] | null = null;
        skillGroups.forEach((g, r) => {
          const due = Math.floor((t - 1200 - r * 450) / CYCLE_MS);
          if (due > fired[r] && r !== hoverRow) {
            fired[r] = due;
            next ??= [...prev];
            next[r] = (prev[r] + 1) % g.items.length;
          }
        });
        return next ?? prev;
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [armed, visible, reduce, hoverRow]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#0e0d0d] font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] font-bold",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-8 md:py-5">
        <p className="flex items-center gap-3 font-display text-[14px] font-semibold uppercase tracking-[.06em] text-ink md:text-[18px]">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-[11px] text-accent-ink md:size-8 md:text-[12px]">
            VG
          </span>
          Stack departures
        </p>
        <p className="type-small flex items-center gap-2 font-sans font-normal text-ink-soft">
          <span className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
          Colombo <LiveClock className="tabular text-ink" />
        </p>
      </div>

      {/* One grid for labels and rows: subgrid rows keep every column aligned (tablet / desktop). */}
      <div className="md:grid md:grid-cols-[48px_auto_auto_minmax(0,1fr)] md:gap-x-6">
        {/* Column labels (tablet / desktop) */}
        <div className="hidden border-b border-line px-8 py-3 font-sans text-[11px] font-normal uppercase tracking-[.14em] text-ink-faint md:col-span-4 md:grid md:grid-cols-subgrid">
          <span>No.</span>
          <span>Group</span>
          <span>Tool</span>
          <span className="text-right">Gate</span>
        </div>

        <ul className="divide-y divide-line/70 md:col-span-4 md:grid md:grid-cols-subgrid">
          {skillGroups.map((g, r) => (
            <li
              key={g.label}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && setHoverRow(r)
              }
              onPointerLeave={() => setHoverRow(null)}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 text-[11px] transition-colors duration-200 hover:bg-white/[.03] md:col-span-4 md:grid-cols-subgrid md:px-8 md:text-[14px] lg:text-[18px]"
            >
              <span className="hidden font-sans font-normal tabular text-accent md:block md:text-[13px]">
                {pad(r + 1)}
              </span>
              <span className="col-span-2 md:col-span-1">
                <span className="sr-only">{g.label}</span>
                {reduce ? (
                  <span className="font-display text-[14px] font-semibold uppercase text-ink-soft">
                    {g.label}
                  </span>
                ) : (
                  <Flaps text={g.label} length={GROUP_LEN} armed={armed} />
                )}
              </span>
              <span className="min-w-0">
                <span className="sr-only">{g.items.join(", ")}</span>
                {reduce ? (
                  <span className="font-sans text-[14px] font-normal text-ink">
                    {g.items.join(" · ")}
                  </span>
                ) : (
                  <Flaps
                    text={g.items[idx[r]]}
                    length={TOOL_LEN}
                    armed={armed}
                    accent={hoverRow === r}
                  />
                )}
              </span>
              <span className="text-right font-sans font-normal tabular text-ink-faint md:text-[13px]">
                {reduce
                  ? pad(g.items.length)
                  : `${pad(idx[r] + 1)}/${pad(g.items.length)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
