"use client";

/**
 * <WorkCard>: the project card used on the home page and /work. WORK_CARD picks the design while
 * Vinul compares them:
 *   "blueprint": a line drawing of the system that a scan line turns into the finished cover
 *   "smoke":     the cover is born from drifting orange smoke
 */
import { BlueprintCard } from "./BlueprintCard";
import { SmokeCard } from "./SmokeCard";
import type { ProjectCardProps } from "./CardText";

export const WORK_CARD: "blueprint" | "smoke" = "blueprint";

export function WorkCard(props: ProjectCardProps) {
  return WORK_CARD === "blueprint" ? <BlueprintCard {...props} /> : <SmokeCard {...props} />;
}
