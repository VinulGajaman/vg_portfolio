"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MediaMap, ResolvedMedia } from "@/lib/media.server";

const MediaContext = createContext<MediaMap>({});

/** Receives the build-time media map from the root layout (server) and shares it with clients. */
export function MediaProvider({ media, children }: { media: MediaMap; children: ReactNode }) {
  return <MediaContext.Provider value={media}>{children}</MediaContext.Provider>;
}

/** Resolved file for a slot id, or undefined while the file is missing (§5.1). */
export function useMedia(id: string): ResolvedMedia | undefined {
  return useContext(MediaContext)[id];
}

/** Whole map, e.g. to check that several layers exist together (hero layer gating §3.2). */
export function useMediaMap(): MediaMap {
  return useContext(MediaContext);
}
