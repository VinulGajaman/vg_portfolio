"use client";

/**
 * Client providers: motion's LazyMotion + domMax (strict: only `m.*` components, §6.2) and
 * the build-time media map.
 */
import type { ReactNode } from "react";
import { LazyMotion, domMax } from "motion/react";
import type { MediaMap } from "@/lib/media.server";
import { MediaProvider } from "./MediaProvider";

export function Providers({ media, children }: { media: MediaMap; children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MediaProvider media={media}>{children}</MediaProvider>
    </LazyMotion>
  );
}
