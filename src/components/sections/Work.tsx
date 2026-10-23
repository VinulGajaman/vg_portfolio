"use client";

/**
 * Selected Work `#work`: three featured projects (<WorkCard>: blueprint or smoke design),
 * then a button to /work for every project, so the section keeps the same height however many
 * projects there are. Desktop: one large card on the left, two stacked on the right, about one
 * screen tall. Tablet: the large card full width, two side by side. Phone: stacked.
 */
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { WorkCard } from "@/components/work/WorkCard";
import { featuredProjects, projects, work } from "@/content/projects";

const pad = (i: number) => String(i + 1).padStart(2, "0");

export default function Work() {
  const [lead, ...rest] = featuredProjects;
  return (
    <section id="work" aria-labelledby="work-title" className="section-layer section-pad">
      <div className="container-site">
        <SectionHeader eyebrow={work.eyebrow} title={work.title} counter={work.counter} titleId="work-title" />
        <Divider variant="solid" draw className="heading-gap mt-[30px] md:mt-10" />

        <div className="grid gap-4 md:grid-cols-2 lg:h-[min(720px,calc(100svh-160px))] lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
          <WorkCard
            project={lead}
            number={pad(projects.indexOf(lead))}
            size="lg"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="aspect-[4/5] md:col-span-2 md:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto"
          />
          {rest.map((p) => (
            <WorkCard
              key={p.slug}
              project={p}
              number={pad(projects.indexOf(p))}
              sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
              className="aspect-square md:aspect-[4/5] lg:col-span-5 lg:aspect-auto"
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <PrimaryButton href="/work" transitionTitle="All Projects">
            {work.viewAll}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
