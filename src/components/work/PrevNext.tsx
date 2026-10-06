/**
 * Prev / Next pills (DESIGN.md §4.1 item 6): two 690×75 pills, gap 20, #232222 + 1px #3C3C3C,
 * radius 10, padding 24, chevron + label with the vertical <SlotSwap> on hover (springUI).
 * Navigation wraps around; links run the <PageTransition>.
 */
import type { Project } from "@/content/projects";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { SlotSwap } from "@/components/motion/SlotSwap";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { cn } from "@/lib/cn";

function Pill({ project, dir }: { project: Project; dir: "prev" | "next" }) {
  const label = dir === "prev" ? "Previous Project" : "Next Project";
  const chevron = <ArrowIcon kind={dir === "prev" ? "chevron-left" : "chevron-right"} size={20} />;
  return (
    <TransitionLink
      href={`/work/${project.slug}`}
      transitionTitle={project.title}
      aria-label={`${label}: ${project.title}`}
      className={cn(
        "border-overlay group flex min-h-[75px] items-center gap-4 rounded-lg bg-surface p-6 text-ink",
        "transition-colors duration-200 hover:bg-surface-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        dir === "next" && "flex-row-reverse",
      )}
    >
      <SlotSwap a={chevron} />
      <SlotSwap a={<span className="type-ui whitespace-nowrap">{label}</span>} />
      <span
        aria-hidden
        className={cn(
          "type-small hidden min-w-0 flex-1 truncate text-ink-soft lg:block",
          dir === "prev" ? "text-right" : "text-left",
        )}
      >
        {project.title}
      </span>
    </TransitionLink>
  );
}

export function PrevNext({ prev, next }: { prev: Project; next: Project }) {
  return (
    <nav aria-label="More projects" className="grid gap-5 md:grid-cols-2">
      <Pill project={prev} dir="prev" />
      <Pill project={next} dir="next" />
    </nav>
  );
}
