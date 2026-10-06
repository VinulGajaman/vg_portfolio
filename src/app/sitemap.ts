import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projectSlugs } from "@/content/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.siteUrl.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    ...projectSlugs.map((s) => ({ url: `${base}/work/${s}/`, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
