/**
 * <SkillsIndex>: the CV's full skills list as readable text (DESIGN.md §3.4).
 * <dl> in 7 groups (CV headings); 4 columns desktop / 2 tablet / 1 phone, column gap 20,
 * row gap 30. Label `body` ink-soft, 12px gap, items as one `lead` line joined by " · ".
 * Each group reveals with <Reveal text>, delays .2 / .3 / .4 repeating.
 */
import { skillGroups } from "@/content/stack";
import { Reveal } from "@/components/motion/Reveal";
import { STAGGER } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

export function SkillsIndex({ className }: { className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-5 gap-y-[30px] md:grid-cols-2 lg:grid-cols-4", className)}>
      {skillGroups.map((g, i) => (
        <Reveal key={g.label} delay={STAGGER.siblings[i % 3]} className="flex flex-col gap-3">
          <dt className="type-body text-ink-soft">{g.label}</dt>
          <dd className="type-lead text-ink">{g.items.join(" · ")}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
