"use client";

/**
 * <MediaSlot>: media renderer + animated placeholder (DESIGN.md §5.3).
 * Renders the real <img>/<video> when /public/media/<id>.<ext> exists, otherwise a placeholder
 * in exactly the same box so nothing shifts when the file arrives.
 */
import { forwardRef, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { preload } from "react-dom";
import { getSlot, MEDIA_PATH_HINT } from "@/content/media";
import { useMedia } from "@/components/providers/MediaProvider";
import { scheduleRefresh } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export type Radius = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "pill";

const RADIUS: Record<Radius, string> = {
  none: "0px",
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "20px",
  pill: "100px",
};

const SHOW_LABELS = process.env.NEXT_PUBLIC_SHOW_SLOT_LABELS !== "false";

export type MediaSlotProps = {
  /** Slot id from src/content/media.ts. */
  id: string;
  className?: string;
  /** Class for the <img>/<video> element (default: cover). */
  mediaClassName?: string;
  style?: CSSProperties;
  sizes?: string;
  /** Hero only: eager load, fetchpriority high and a preload link. */
  priority?: boolean;
  /** Overrides the registry alt text. */
  alt?: string;
  /** Radius token (§1.5). */
  rounded?: Radius;
  /** Fill the positioned parent (absolute inset 0) instead of using the slot's aspect ratio. */
  fill?: boolean;
  /** Overrides the registry aspect ratio (width / height). */
  ratio?: number;
  /** Video options (defaults: muted, loop, playsInline, autoPlay, preload="metadata"). */
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  preloadVideo?: "none" | "metadata" | "auto";
  /** Rendered instead of the placeholder while the file is missing (e.g. logo name). */
  fallback?: ReactNode;
  /** Called once when the real media has loaded (img load / video loadeddata). */
  onReady?: (el: HTMLImageElement | HTMLVideoElement) => void;
  /** Marks hero media for the preloader's readiness count (§2.5 Preloader). */
  preloadMedia?: boolean;
};

export const MediaSlot = forwardRef<HTMLDivElement, MediaSlotProps>(function MediaSlot(
  {
    id,
    className,
    mediaClassName,
    style,
    sizes,
    priority,
    alt,
    rounded = "none",
    fill,
    ratio,
    autoPlay = true,
    loop = true,
    controls = false,
    preloadVideo = "metadata",
    fallback,
    onReady,
    preloadMedia,
  },
  ref,
) {
  const slot = getSlot(id);
  const media = useMedia(id);
  const readyOnce = useRef(false);

  const kind = slot?.kind ?? "image";
  const aspect = ratio ?? slot?.ratio ?? 0;
  const radius = RADIUS[rounded];

  const boxStyle: CSSProperties = {
    borderRadius: radius,
    ...(fill ? {} : aspect ? { aspectRatio: String(aspect) } : {}),
    ...style,
  };

  const handleReady = useCallback(
    (el: HTMLImageElement | HTMLVideoElement) => {
      if (readyOnce.current) return;
      readyOnce.current = true;
      scheduleRefresh();
      onReady?.(el);
    },
    [onReady],
  );

  if (media && priority && kind === "image") {
    preload(media.src, { as: "image", fetchPriority: "high" });
  }

  const boxClass = cn(
    fill ? "absolute inset-0 h-full w-full" : "relative w-full",
    "overflow-hidden",
    className,
  );

  /* ------------------------------ real media ------------------------------ */
  if (media) {
    const altText = alt ?? slot?.alt ?? "";
    if (kind === "svg") {
      return (
        <div ref={ref} className={boxClass} style={boxStyle}>
          <span
            role="img"
            aria-label={altText}
            className={cn("block h-full w-full", mediaClassName)}
            style={{
              backgroundColor: "currentColor",
              WebkitMask: `url("${media.src}") center / contain no-repeat`,
              mask: `url("${media.src}") center / contain no-repeat`,
            }}
          />
        </div>
      );
    }
    if (kind === "video") {
      return (
        <div ref={ref} className={boxClass} style={boxStyle}>
          <video
            className={cn("h-full w-full object-cover", mediaClassName)}
            src={media.src}
            poster={media.poster}
            muted
            loop={loop}
            playsInline
            autoPlay={autoPlay}
            controls={controls}
            preload={preloadVideo}
            aria-label={altText || undefined}
            data-preload-media={preloadMedia ? "" : undefined}
            ref={(el) => {
              if (el && el.readyState >= 2) handleReady(el);
            }}
            onLoadedData={(e) => handleReady(e.currentTarget)}
          />
        </div>
      );
    }
    if (kind === "pdf") {
      return null;
    }
    return (
      <div ref={ref} className={boxClass} style={boxStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized (§5.1) */}
        <img
          className={cn("h-full w-full object-cover", mediaClassName)}
          src={media.src}
          alt={altText}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          draggable={false}
          data-preload-media={preloadMedia ? "" : undefined}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth) handleReady(el);
          }}
          onLoad={(e) => handleReady(e.currentTarget)}
        />
      </div>
    );
  }

  /* ------------------------------ fallback -------------------------------- */
  if (fallback !== undefined) {
    return (
      <div ref={ref} className={boxClass} style={boxStyle}>
        {fallback}
      </div>
    );
  }

  /* ----------------------------- placeholder ------------------------------ */
  const isVideo = kind === "video";
  const hint = MEDIA_PATH_HINT[kind];
  return (
    <div
      ref={ref}
      role="img"
      aria-label={isVideo ? "Video coming soon" : "Image coming soon"}
      className={cn(boxClass, "ms-ph @container")}
      style={boxStyle}
      data-slot={id}
    >
      <span className="ms-ph-ambient" aria-hidden />
      <span className="ms-ph-shimmer" aria-hidden />
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span key={c} className="ms-ph-crop" data-c={c} aria-hidden />
      ))}
      {SHOW_LABELS && (
        <span
          aria-hidden
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-2 px-4 text-center"
        >
          {isVideo && (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mb-1 text-ink-soft">
              <path
                d="M9 6.5v15l12-7.5-12-7.5Z"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="type-micro break-all text-ink-soft">{id}</span>
          {slot && slot.px !== "—" && (
            <span className="hidden text-[12px] leading-none text-ink-faint tabular @min-[160px]:block">
              {slot.aspect !== "—" ? `${slot.aspect} · ` : ""}
              {slot.px}
            </span>
          )}
          <span className="hidden break-all text-[11px] leading-[1.3] text-[#8a8a8a] @min-[240px]:block">
            /media/{id}.{hint}
          </span>
        </span>
      )}
    </div>
  );
});
