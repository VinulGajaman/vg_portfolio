/** Case-study STUB (DESIGN.md §4). The case-study agent replaces this template. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projectSlugs } from "@/content/projects";
import { getMediaMap } from "@/lib/media.server";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const banner = getMediaMap()[`work-${slug}-banner`];
  return {
    title: p.title,
    description: p.description,
    openGraph: banner ? { images: [{ url: banner.src }] } : undefined,
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  return (
    <section className="section-layer px-[var(--gutter)] pb-[140px] pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-[50px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row">
          <h1 className="type-h2 max-w-[1000px]">{p.fullTitle}</h1>
          <p className="type-body max-w-[400px] text-ink-soft">{p.caseStudy.summary}</p>
        </div>
        <div>
          <PrimaryButton href="/#work" transitionTitle="Home">
            Back to Home
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
