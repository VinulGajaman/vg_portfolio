/** All projects (/work): every project as a smoke-born card, newest first as in the CV. */
import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmokeCard } from "@/components/work/SmokeCard";
import { projects, work } from "@/content/projects";

export const metadata: Metadata = {
  title: "All Projects",
  description: "Every project: real-time backends, mobile and IoT apps, Web3 wallets, cloud-native platforms and AI.",
  alternates: { canonical: "/work" },
};

export default function AllWork() {
  return (
    <section className="section-layer px-[var(--gutter)] pb-[140px] pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <div className="container-site">
        <SectionHeader eyebrow={work.allEyebrow} title={work.allTitle} counter={work.counter} titleId="all-work-title" className="heading-gap" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {projects.map((p, i) => (
            <SmokeCard
              key={p.slug}
              project={p}
              number={String(i + 1).padStart(2, "0")}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
