/**
 * Build-time media resolver (DESIGN.md §5.1). Server-only: it reads the file system.
 * Server Components run during `next build`, so the static export bakes in the map of
 * slot id → resolved file. Rebuild after adding files to /public/media.
 */
import fs from "node:fs";
import path from "node:path";
import { MEDIA_EXTENSIONS, mediaSlots } from "@/content/media";
import type { MediaKind } from "@/content/media";

export type ResolvedMedia = {
  id: string;
  kind: MediaKind;
  /** Public URL, e.g. /media/hero-portrait.webp */
  src: string;
  /** Video poster (`<slot-id>-poster.<image ext>`), when present. */
  poster?: string;
};

export type MediaMap = Record<string, ResolvedMedia>;

const MEDIA_DIR = path.join(process.cwd(), "public", "media");

let cache: MediaMap | null = null;

function scan(): MediaMap {
  let files: string[] = [];
  try {
    files = fs.readdirSync(MEDIA_DIR);
  } catch {
    return {};
  }
  const present = new Set(files.map((f) => f.toLowerCase()));
  const original = new Map(files.map((f) => [f.toLowerCase(), f]));
  const find = (stem: string, exts: string[]) => {
    for (const ext of exts) {
      const key = `${stem}${ext}`.toLowerCase();
      if (present.has(key)) return `/media/${original.get(key)}`;
    }
    return undefined;
  };

  const map: MediaMap = {};
  for (const slot of mediaSlots) {
    const src = find(slot.id, MEDIA_EXTENSIONS[slot.kind]);
    if (!src) continue;
    const entry: ResolvedMedia = { id: slot.id, kind: slot.kind, src };
    if (slot.kind === "video") {
      const poster = find(`${slot.id}-poster`, MEDIA_EXTENSIONS.image);
      if (poster) entry.poster = poster;
    }
    map[slot.id] = entry;
  }
  return map;
}

/** Map of every slot whose file exists. Cached for the build; rescanned on each call in dev. */
export function getMediaMap(): MediaMap {
  if (process.env.NODE_ENV !== "production") return scan();
  if (!cache) cache = scan();
  return cache;
}

export function resolveMedia(id: string): ResolvedMedia | undefined {
  return getMediaMap()[id];
}

export function hasMedia(id: string): boolean {
  return Boolean(getMediaMap()[id]);
}
