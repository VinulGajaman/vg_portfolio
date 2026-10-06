/**
 * Next-project block (DESIGN.md §4.1 item 7, upgrade): a full-width 60svh link with "NEXT
 * PROJECT" (`micro`) over the next title in a fitted Clash wordmark.
 * Hover / focus-visible: the next cover reveals behind the title (clip-path inset(50% 0 50% 0)
 * → inset(0), 0.8s expo.out), the title switches to mix-blend-mode: difference, cursor `view`.
 * Click → <PageTransition>. Reduced motion: the cover fades instead of clipping.
 */
import type { CSSProperties } from "react";
import type { Project } from "@/content/projects";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/** Clash 700 uppercase ≈ 0.65em per glyph (the hero wordmark's K 8.93 for 13 glyphs + ✦). */
const EM_PER_CHAR = 0.68;

/** Container-query fit constant K for a title wrapped onto `lines` balanced lines. */
function fitK(title: string, lines: number) {
  const longestWord = Math.max(...title.split(/\s+/).map((w) => w.length));
  const perLine = Math.max(Math.ceil(title.length / lines) + 1, longestWord);
  return Math.max(perLine * EM_PER_CHAR, 4).toFixed(2);
}

export function NextProject({ project }: { project: Project }) {
  const t = project.title;
  const len = t.length;
  const style = {
    "--k-p": fitK(t, len > 24 ? 3 : len > 10 ? 2 : 1),
    "--k-d": fitK(t, len > 18 ? 2 : 1),
    fontSize: "min(calc(100cqw / var(--k)), 220px)",
  } as CSSProperties;

  return (
    <Reveal>
      <TransitionLink
        href={`/work/${project.slug}`}
        transitionTitle={t}
        aria-label={`Next project: ${t}`}
        data-cursor="view"
        className={cn(
          "border-overlay group relative flex min-h-[60svh] w-full flex-col justify-between overflow-hidden rounded-2xl bg-canvas-deep p-6 text-ink md:p-10",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 [clip-path:inset(50%_0_50%_0)]",
            "transition-[clip-path] duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)]",
            "motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-400 motion-reduce:[clip-path:inset(0)]",
            "motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100",
          )}
        >
          <MediaSlot id={`work-${project.slug}-cover`} fill sizes="100vw" alt="" />
        </div>

        <div className="relative flex items-start justify-between gap-4 group-hover:mix-blend-difference">
          <span className="type-micro text-ink">Next Project</span>
          <ArrowIcon kind="hooked" size={28} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>

        <div aria-hidden className="relative w-full [container-type:inline-size]">
          <p
            className="type-display-wordmark m-0 text-balance [--k:var(--k-p)] group-hover:mix-blend-difference md:[--k:var(--k-d)]"
            style={style}
          >
            {t}
          </p>
        </div>
      </TransitionLink>
    </Reveal>
  );
}
