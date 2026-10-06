"use client";

/**
 * Experience `#experience` + Education (DESIGN.md §3.9). Scroll-drawn timeline above portvio's
 * pricing shell (two role cards; the current role leads on phone), then education rows.
 */
import { Fragment, useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RollText } from "@/components/motion/RollText";
import { Spotlight } from "@/components/motion/Spotlight";
import { Counter } from "@/components/motion/Counter";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Timeline } from "@/components/ui/Timeline";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Divider } from "@/components/ui/Divider";
import { Chip } from "@/components/ui/Chip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { gsap, onceInView, useMotion } from "@/lib/gsap";
import { SPRING_SAMPLES } from "@/lib/motion-tokens";
import { education, experience, roles, timelineNodes, type Role } from "@/content/experience";
import { ctaLabels } from "@/content/site";
import { cn } from "@/lib/cn";

function RoleCard({ role }: { role: Role }) {
  return (
    <Spotlight
      as="article"
      className={cn(
        "border-overlay flex flex-col gap-8 rounded-lg p-6 after:transition-colors after:duration-[180ms] after:ease-out hover:after:border-white/12 md:p-[38px]",
        role.highlighted ? "order-first md:order-none" : "after:border-transparent",
      )}
      style={role.highlighted ? { background: "linear-gradient(180deg, #282727 0%, #303030 100%)" } : undefined}
    >
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="type-lead text-ink">{role.company}</h3>
          {role.current && (
            <span className="type-micro inline-flex items-center gap-2 rounded-pill border border-accent px-[10px] py-1 text-ink">
              <span className="relative size-[6px]">
                <span aria-hidden className="absolute inset-0 rounded-full bg-accent motion-safe:animate-pulse-ring" />
                <span className="relative block size-[6px] rounded-full bg-accent" />
              </span>
              {experience.currentPill}
            </span>
          )}
        </div>
        <p className="type-body text-ink-soft">
          {role.role}
          {role.roleDetail && ` · ${role.roleDetail}`}
        </p>
      </div>
      <div className="relative flex flex-col gap-1">
        <p className="type-number text-ink">{role.years}</p>
        <p className="type-small text-ink-soft tabular">
          {role.dates} · {role.location}
        </p>
      </div>
      <div className="relative flex flex-col gap-4">
        <p className="type-tag text-ink-soft">{role.label}</p>
        <ul className="flex flex-col gap-3">
          {role.bullets.map((b) => (
            <li key={b} data-bullet="" className="type-body flex gap-3 text-ink">
              <span aria-hidden className="mt-[0.6em] size-[6px] shrink-0 rounded-full bg-ink" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="relative flex flex-wrap gap-[6px]">
        {role.chips.map((c) => (
          <li key={c}>
            <Chip>{c}</Chip>
          </li>
        ))}
      </ul>
      {role.highlighted && (
        <div className="relative">
          <PrimaryButton href="#contact">{ctaLabels.contact}</PrimaryButton>
        </div>
      )}
    </Spotlight>
  );
}

export default function Experience() {
  const shellRef = useRef<HTMLDivElement>(null);

  // Bullets stagger in after the shell: y 12 → 0, autoAlpha, springUI, stagger .05.
  useMotion(
    ({ reduce }) => {
      const shell = shellRef.current;
      if (!shell || reduce) return;
      const bullets = shell.querySelectorAll<HTMLElement>("[data-bullet]");
      if (!bullets.length) return;
      const t = gsap.fromTo(
        bullets,
        { y: 12, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: SPRING_SAMPLES.springUI.duration,
          ease: "springUI",
          stagger: 0.05,
          delay: 0.6,
          paused: true,
        },
      );
      onceInView(shell, () => t.play(), { start: "top 75%", settle: () => t.progress(1) });
    },
    { scope: shellRef },
  );

  return (
    <section id="experience" aria-labelledby="experience-title" className="section-layer section-pad section-pad-heavy">
      <div className="container-site">
        <SectionHeader
          eyebrow={experience.eyebrow}
          title={experience.title}
          titleId="experience-title"
          variant="centred"
          className="heading-gap"
        />

        <div className="mx-auto flex max-w-[960px] gap-6 md:flex-col md:gap-10">
          <Timeline nodes={timelineNodes} trigger="#experience-shell" className="w-[104px] shrink-0 md:w-full max-md:[&>ol]:h-full max-md:[&>ol]:justify-between" />
          <Reveal variant="card" delay={0.3} className="min-w-0 flex-1">
            <div
              ref={shellRef}
              id="experience-shell"
              className="border-overlay grid grid-cols-1 gap-3 rounded-lg bg-surface p-3 md:grid-cols-2"
            >
              {roles.map((r) => (
                <RoleCard key={r.company} role={r} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* Education */}
        <div className="mt-[100px]">
          <Eyebrow className="mb-[30px]">{experience.educationEyebrow}</Eyebrow>
          <Divider draw />
          {education.map((e, i) => (
            <Fragment key={e.degree}>
              <Reveal
                data-roll-parent=""
                className="flex flex-col gap-4 rounded-lg p-[30px] px-3 transition-colors duration-[809ms] ease-spring-layout hover:bg-surface-70 md:flex-row md:items-start md:justify-between md:px-[30px]"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="type-lead text-ink">
                    {e.degree.split(" ").map((w, j) => (
                      <span key={j}>
                        {j > 0 && " "}
                        <RollText>{w}</RollText>
                      </span>
                    ))}
                  </h3>
                  <p className="type-body text-ink-soft">
                    {e.institution} · {e.awardedBy}
                    {e.note && ` · ${e.note}`}
                  </p>
                </div>
                <p className="type-number shrink-0 text-ink">
                  <span className="sr-only">{e.years}</span>
                  <span aria-hidden>
                    <Counter from={e.yearFrom - 20} to={e.yearFrom} />
                    {" – "}
                    {e.yearTo === null ? "NOW" : <Counter from={e.yearTo - 20} to={e.yearTo} />}
                  </span>
                </p>
              </Reveal>
              <Divider draw reverse={i % 2 === 0} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
