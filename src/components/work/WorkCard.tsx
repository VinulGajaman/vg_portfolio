"use client";

/**
 * <WorkCard>: the project card used on the home page and /work. WORK_CARD picks the design while
 * Vinul compares them:
 *   "status":    a live production monitor (heartbeat, Operational status, the stack as services)
 *   "blueprint": a line drawing of the system that a scan line turns into the finished cover
 *   "smoke":     the cover is born from drifting orange smoke
 */
import { BlueprintCard } from "./BlueprintCard";
import { StatusCard } from "./StatusCard";
import { SmokeCard } from "./SmokeCard";
import type { ProjectCardProps } from "./CardText";

export const WORK_CARD: "status" | "blueprint" | "smoke" = "status";

export function WorkCard(props: ProjectCardProps) {
  if (WORK_CARD === "status") return <StatusCard {...props} />;
  return WORK_CARD === "blueprint" ? <BlueprintCard {...props} /> : <SmokeCard {...props} />;
}
