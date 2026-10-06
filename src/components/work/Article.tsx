/**
 * Case-study article (DESIGN.md §4.1 item 4, §4.2): 940 centred, paragraphs max 68ch.
 * Blocks: OVERVIEW · THE CHALLENGE · WHAT I BUILT · RESULTS (Counter stat chips) · TECH STACK.
 * H3s `statement` via <RevealText lines>; block bodies <Reveal text> at 50%, once (delay .2,
 * the results block .4).
 */
import type { ReactNode } from "react";
import type { Project } from "@/content/projects";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { Counter } from "@/components/motion/Counter";
import { Chip } from "@/components/ui/Chip";

function Block({ id, title, delay = 0.2, children }: { id: string; title: string; delay?: number; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <RevealText as="h3" id={id} mode="lines" className="type-statement">
        {title}
      </RevealText>
      <Reveal delay={delay}>{children}</Reveal>
    </section>
  );
}

const body = "max-w-[68ch] text-[16px] leading-[1.6] text-ink-soft lg:text-[17px]";

export function Article({ project }: { project: Project }) {
  const { caseStudy: cs, slug } = project;
  return (
    <article className="mx-auto flex w-full max-w-[940px] flex-col gap-[50px] py-5 md:py-10">
      <Block id={`${slug}-overview`} title="Overview">
        <p className={body}>{cs.overview}</p>
      </Block>

      <Block id={`${slug}-challenge`} title="The Challenge">
        <p className={body}>{cs.challenge}</p>
      </Block>

      <Block id={`${slug}-built`} title="What I Built">
        <ul className={`${body} flex flex-col gap-3`}>
          {cs.built.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-[0.7em] size-[6px] shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block id={`${slug}-results`} title="Results" delay={0.4}>
        <ul className="grid gap-4 md:grid-cols-2">
          {cs.results.map((r) => (
            <li
              key={r.label}
              className="border-overlay flex flex-col gap-3 rounded-lg bg-surface p-6"
            >
              {r.counter ? (
                <Counter
                  as="p"
                  className="type-number text-ink"
                  from={r.counter.from}
                  to={r.counter.to}
                  prefix={r.counter.prefix}
                  suffix={r.counter.suffix}
                  decimals={r.counter.decimals}
                  duration={1.4}
                />
              ) : (
                <p className="type-number text-ink">{r.display}</p>
              )}
              <p className="type-body text-ink-soft">{r.label}</p>
            </li>
          ))}
        </ul>
        {cs.resultsNote && <p className={`${body} mt-5`}>{cs.resultsNote}</p>}
      </Block>

      <Block id={`${slug}-stack`} title="Tech Stack">
        <ul className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li key={s}>
              <Chip>{s}</Chip>
            </li>
          ))}
        </ul>
      </Block>
    </article>
  );
}
