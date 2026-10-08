"use client";

/**
 * <SkillsTerminal>: the CV's full skills list as a terminal session (skills idea 2 of 4).
 * A dark window (#121111, radius 16, 1px line, edge light): title bar with three dots (the last
 * orange), "vinul@colombo — zsh" and the tool count. Body in the system monospace stack:
 *   vinul@colombo:~$ cat stack.ts --pretty
 *   ✓ languages        Java · TypeScript · …        (one line per CV group)
 *   ✓ 41 tools · 7 groups · loaded in 0.42s
 *   vinul@colombo:~$ █
 * Scroll (once, motion allowed): the command types out (32ms per character, caret following),
 * then each output line slides in (x −8 → 0, fade, stagger .09s) and the final prompt appears
 * with a blinking caret. Hover (fine pointers): the line tints, its key turns orange and the
 * skills brighten. Reduced motion / no JS: the full session is shown, static.
 */
import { useRef } from "react";
import { skillGroups } from "@/content/stack";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const COMMAND = "cat stack.ts --pretty";
const TOTAL = skillGroups.reduce((n, g) => n + g.items.length, 0);
const MONO = "font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]";

/** "Frontend & Mobile" → "frontend_mobile". */
const keyOf = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

function Prompt() {
  return (
    <>
      <span className="text-accent">vinul@colombo</span>
      <span className="text-ink-faint">:~$ </span>
    </>
  );
}

export function SkillsTerminal({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduce }) => {
      const root = ref.current;
      if (!root || reduce) return;
      const cmd = root.querySelector<HTMLElement>("[data-term-cmd]");
      const caret = root.querySelector<HTMLElement>("[data-term-caret]");
      const lines = root.querySelectorAll<HTMLElement>("[data-term-line]");
      const end = root.querySelector<HTMLElement>("[data-term-end]");
      if (!cmd) return;
      cmd.textContent = "";
      gsap.set(lines, { autoAlpha: 0, x: -8 });
      gsap.set(end, { autoAlpha: 0 });
      gsap.set(caret, { autoAlpha: 1 });
      const typed = { n: 0 };
      const tl = gsap
        .timeline({ paused: true })
        .to(typed, {
          n: COMMAND.length,
          duration: COMMAND.length * 0.032,
          ease: "none",
          onUpdate: () => {
            cmd.textContent = COMMAND.slice(0, Math.round(typed.n));
          },
        })
        .set(caret, { autoAlpha: 0 }, "+=0.15")
        .to(lines, { autoAlpha: 1, x: 0, duration: 0.45, ease: "out", stagger: 0.09 })
        .to(end, { autoAlpha: 1, duration: 0.3, ease: "out" });
      onceInView(root, () => tl.play(), {
        settle: () => {
          tl.progress(1);
          cmd.textContent = COMMAND;
        },
      });
      return () => {
        cmd.textContent = COMMAND;
      };
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn(
        "border-overlay edge-light relative overflow-hidden rounded-2xl bg-[#121111]",
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-4 border-b border-line px-5 py-4 md:px-7">
        <span aria-hidden className="flex gap-2">
          <span className="size-3 rounded-full bg-line" />
          <span className="size-3 rounded-full bg-line" />
          <span className="size-3 rounded-full bg-accent" />
        </span>
        <span className={cn("flex-1 truncate text-center text-[12px] text-ink-faint md:text-[13px]", MONO)}>
          vinul@colombo — zsh — stack
        </span>
        <span className={cn("hidden text-[12px] text-ink-faint md:inline md:text-[13px]", MONO)}>
          {TOTAL} tools
        </span>
      </div>

      {/* Session */}
      <div className={cn("px-5 py-6 text-[13px] leading-[1.9] md:px-8 md:py-9 md:text-[15px] lg:px-10 lg:text-[16px]", MONO)}>
        <p className="whitespace-nowrap">
          <Prompt />
          <span data-term-cmd="" className="text-ink">
            {COMMAND}
          </span>
          <span
            data-term-caret=""
            aria-hidden
            className="invisible ml-px inline-block h-[1.1em] w-[.55em] translate-y-[.2em] animate-pulse bg-ink"
          />
        </p>

        <ul className="mt-3 flex flex-col">
          {skillGroups.map((g) => (
            <li
              key={g.label}
              data-term-line=""
              className="group -mx-3 grid grid-cols-[auto_1fr] gap-x-3 rounded-md px-3 py-1 transition-colors duration-200 pointer-fine:hover:bg-white/[.04] md:grid-cols-[auto_200px_1fr] md:py-1.5"
            >
              <span className="text-accent">✓</span>
              <span className="text-ink-soft transition-colors duration-200 pointer-fine:group-hover:text-accent">
                {keyOf(g.label)}
              </span>
              <span className="col-start-2 text-ink/75 transition-colors duration-200 pointer-fine:group-hover:text-ink md:col-start-3">
                {g.items.map((item, j) => (
                  <span key={item}>
                    {j > 0 && <span className="text-ink-faint"> · </span>}
                    <span className="whitespace-nowrap">{item}</span>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div data-term-end="">
          <p className="mt-3 text-ink-faint">
            <span className="text-accent">✓</span> {TOTAL} tools · {skillGroups.length} groups · loaded in 0.42s
          </p>
          <p className="mt-1">
            <Prompt />
            <span aria-hidden className="ml-px inline-block h-[1.1em] w-[.55em] translate-y-[.2em] animate-pulse bg-accent" />
          </p>
        </div>
      </div>
    </div>
  );
}
