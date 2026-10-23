/** Project case-study page (DESIGN.md §4). Statically generated for the 6 CV projects. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNeighbours, getProject, projectSlugs } from "@/content/projects";
import { getMediaMap } from "@/lib/media.server";
import { CaseBanner, CaseHero } from "@/components/work/CaseHero";
import { MetaRow } from "@/components/work/MetaRow";
import { Article } from "@/components/work/Article";
import { PrevNext } from "@/components/work/PrevNext";
import { NextProject } from "@/components/work/NextProject";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const banner = getMediaMap()[`work-${slug}-cover`];
  // The root layout's title template appends " | Vinul Gajaman".
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${p.title} | Vinul Gajaman`,
      description: p.description,
      url: `/work/${slug}`,
      ...(banner ? { images: [{ url: banner.src, alt: `${p.title} banner` }] } : {}),
    },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const { prev, next } = getNeighbours(slug);

  return (
    <section className="section-layer px-[var(--gutter)] pb-[140px] pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-[50px]">
        <CaseHero title={p.fullTitle} summary={p.caseStudy.summary} />
        <MetaRow
          items={[
            { label: "Company", value: p.company },
            { label: "Role", value: p.caseStudy.role },
            { label: "Stack", value: p.stack.join(", ") },
            { label: "Year", value: p.year },
          ]}
        />
        <CaseBanner slug={p.slug} title={p.title} />
        <Article project={p} />
        <PrevNext prev={prev} next={next} />
        <NextProject project={next} />
      </div>
    </section>
  );
}
