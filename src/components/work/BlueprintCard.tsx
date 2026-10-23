"use client";

/**
 * <BlueprintCard>: "blueprint to production". A project card that starts as an engineer's drawing:
 * a faint orange grid with a line drawing of the system (architecture, mobile app, wallet or web
 * app, by project). The first time the card comes into view the lines draw themselves, then a
 * glowing scan line sweeps across and turns the blueprint into the finished cover behind it, and
 * the title decodes. On hover the blueprint flickers back over the cover. Until a cover exists, the
 * blueprint stays as the card's image (the scan still passes over it).
 * Reduced motion: the finished card is shown at once.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { useMedia } from "@/components/providers/MediaProvider";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { CardText, type ProjectCardProps } from "./CardText";

type Kind = "system" | "mobile" | "wallet" | "web";
const KIND: Record<string, Kind> = {
  "aasl-access-control": "system",
  "jova-wallet": "wallet",
  "offline-expense-platform": "mobile",
  "uhf-rfid-scanner": "mobile",
  "techsalary-lk": "system",
  "ai-chatbot-backend": "web",
};

/* Every shape is a <path> so `pathLength` works the same in every browser. */
const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r
    ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
    : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const cylinder = (x: number, y: number, w: number, h: number) => {
  const rx = w / 2;
  const ry = w / 7;
  return `M${x} ${y}a${rx} ${ry} 0 1 0 ${w} 0a${rx} ${ry} 0 1 0 ${-w} 0v${h}a${rx} ${ry} 0 0 0 ${w} 0v${-h}`;
};
/** A dimension line with end ticks, like on a technical drawing. */
const dim = (x1: number, y1: number, x2: number, y2: number) =>
  x1 === x2
    ? `M${x1} ${y1}V${y2}M${x1 - 4} ${y1}H${x1 + 4}M${x1 - 4} ${y2}H${x1 + 4}`
    : `M${x1} ${y1}H${x2}M${x1} ${y1 - 4}V${y1 + 4}M${x2} ${y2 - 4}V${y2 + 4}`;

const DRAWINGS: Record<Kind, { lines: string[]; dims: string[] }> = {
  // Gateway → services → queue → databases
  system: {
    lines: [
      rect(150, 20, 100, 32, 6),
      "M200 52V76H80V100M200 76V100M200 76H320V100",
      rect(40, 100, 80, 36, 6),
      rect(160, 100, 80, 36, 6),
      rect(280, 100, 80, 36, 6),
      "M80 136V160M200 136V160M320 136V160",
      rect(40, 160, 320, 14, 7),
      "M138 174V198M262 174V198",
      cylinder(110, 204, 56, 26),
      cylinder(234, 204, 56, 26),
    ],
    dims: [dim(18, 20, 18, 238), dim(40, 252, 360, 252)],
  },
  // Phone with a list app, wired to a small hardware module
  mobile: {
    lines: [
      rect(130, 10, 120, 240, 18),
      rect(172, 18, 36, 6, 3),
      rect(148, 40, 60, 6, 3),
      ...[64, 98, 132, 166].flatMap((y) => [circle(158, y + 8, 9), rect(174, y + 2, 58, 5, 2.5), rect(174, y + 12, 38, 4, 2)]),
      "M146 214H234",
      circle(160, 230, 4),
      circle(190, 230, 4),
      circle(220, 230, 4),
      "M250 120H272",
      rect(272, 92, 70, 56, 4),
      "M282 92V84M296 92V84M310 92V84M324 92V84M282 148V156M296 148V156M310 148V156M324 148V156",
      "M352 106c14 0 14 28 0 28c-10 0-10-20 0-20c6 0 6 12 0 12",
    ],
    dims: [dim(110, 10, 110, 250), dim(272, 172, 342, 172)],
  },
  // Wallet app on a phone, next to a chain of blocks
  wallet: {
    lines: [
      rect(70, 10, 120, 240, 18),
      rect(112, 18, 36, 6, 3),
      rect(86, 40, 88, 52, 8),
      rect(96, 52, 40, 6, 3),
      rect(96, 68, 64, 10, 3),
      ...[108, 140, 172].flatMap((y) => [circle(98, y + 8, 9), rect(114, y + 4, 44, 6, 3)]),
      rect(86, 210, 40, 16, 8),
      rect(134, 210, 40, 16, 8),
      rect(232, 40, 44, 44, 6),
      "M276 62H300",
      rect(300, 40, 44, 44, 6),
      "M322 84V108",
      rect(300, 108, 44, 44, 6),
      "M300 130H276",
      rect(232, 108, 44, 44, 6),
      "M254 152V176",
      rect(232, 176, 44, 44, 6),
      "M248 52l12 12M260 52l-12 12",
    ],
    dims: [dim(50, 10, 50, 250), dim(232, 236, 344, 236)],
  },
  // Web app: sidebar, KPI cards, chart and table
  web: {
    lines: [
      rect(30, 14, 340, 222, 10),
      "M30 34H370",
      circle(46, 24, 3),
      circle(58, 24, 3),
      circle(70, 24, 3),
      rect(40, 44, 60, 182, 4),
      ...[58, 74, 90, 106, 122].map((y) => rect(50, y, 40, 4, 2)),
      rect(110, 44, 78, 36, 4),
      rect(195, 44, 78, 36, 4),
      rect(280, 44, 80, 36, 4),
      rect(110, 90, 250, 64, 4),
      "M120 140L150 120L180 128L210 104L240 114L270 98L300 108L330 100L350 104",
      ...[166, 182, 198, 214].map((y) => `M110 ${y}H360`),
      "M190 166V226M270 166V226",
    ],
    dims: [dim(16, 14, 16, 236), dim(30, 250, 370, 250)],
  },
};

function Drawing({ kind, reveal }: { kind: Kind; reveal?: boolean }) {
  const d = DRAWINGS[kind];
  const line = (path: string, i: number) => (
    <path key={i} d={path} data-bp-line={reveal ? "" : undefined} pathLength={1} vectorEffect="non-scaling-stroke" />
  );
  return (
    <svg viewBox="0 0 400 260" aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <g strokeWidth={1.4}>{d.lines.map(line)}</g>
      <g strokeWidth={1} opacity={0.45}>{d.dims.map(line)}</g>
    </svg>
  );
}

const GRID: CSSProperties = {
  backgroundColor: "#0b0b0b",
  backgroundImage:
    "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgb(0 0 0 / .55)), linear-gradient(rgb(246 88 2 / .13) 1px, transparent 1px), linear-gradient(90deg, rgb(246 88 2 / .13) 1px, transparent 1px), linear-gradient(rgb(246 88 2 / .06) 1px, transparent 1px), linear-gradient(90deg, rgb(246 88 2 / .06) 1px, transparent 1px)",
  backgroundSize: "100% 100%, 100px 100px, 100px 100px, 20px 20px, 20px 20px",
};

export function BlueprintCard({ project: p, number, size = "sm", sizes = "(min-width: 1024px) 40vw, 100vw", className }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const cover = `work-${p.slug}-cover`;
  const hasCover = Boolean(useMedia(cover));
  const kind = KIND[p.slug] ?? "system";
  // The drawing sits above the text: the large card has more room for it.
  const area = size === "lg" ? "bottom-[42%]" : "bottom-[52%]";

  useEffect(() => {
    const card = ref.current;
    const scan = card?.querySelector<HTMLElement>("[data-bp-scan]");
    if (!card || !scan || reduce) return;
    const lines = card.querySelectorAll<SVGPathElement>("[data-bp-line]");
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    card.style.setProperty("--p", "0");
    let tl: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setRevealed(true);
        tl = gsap
          .timeline()
          .to(lines, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: { amount: 0.7 } }, 0)
          .to(scan, { autoAlpha: 1, duration: 0.2 }, 1.5)
          .to(card, { "--p": 100, duration: 1.7, ease: "power2.inOut" }, 1.5)
          .to(scan, { autoAlpha: 0, duration: 0.35 }, 3.0);
      },
      { threshold: 0.35 },
    );
    io.observe(card);
    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, [reduce]);

  return (
    <TransitionLink
      ref={ref}
      href={`/work/${p.slug}`}
      transitionTitle={p.title}
      data-cursor="view"
      data-cursor-label="View"
      style={{ ["--p" as string]: 100 }}
      className={cn("group border-overlay relative block overflow-hidden rounded-2xl", className)}
    >
      {/* The finished product (the cover), revealed behind the scan line */}
      {hasCover && (
        <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--p) * 1%) 0 0)" }}>
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out pointer-fine:group-hover:scale-[1.06]">
            <MediaSlot id={cover} fill alt="" sizes={sizes} />
          </div>
        </div>
      )}

      {/* The blueprint: grid, drawing and a drawing number */}
      <div
        aria-hidden
        className={cn("absolute inset-0 transition-opacity duration-500", !hasCover && "opacity-80 pointer-fine:group-hover:opacity-100")}
        style={{ ...GRID, ...(hasCover ? { clipPath: "inset(0 0 0 calc(var(--p) * 1%))" } : null) }}
      >
        <div className={cn("absolute inset-x-6 top-14 text-accent md:inset-x-10 md:top-16", area)}>
          <Drawing kind={kind} reveal />
        </div>
        <span className="type-micro tabular absolute right-5 top-6 text-accent/70 md:right-6">
          DWG-{number} · REV {p.year}
        </span>
      </div>

      {/* Hover: the blueprint flickers back over the cover */}
      {hasCover && (
        <div
          aria-hidden
          className={cn(area, "pointer-events-none absolute inset-x-6 top-14 text-accent opacity-0 mix-blend-screen transition-opacity duration-300 md:inset-x-10 md:top-16 pointer-fine:group-hover:animate-[bp-flicker_0.6s_steps(1)_1] pointer-fine:group-hover:opacity-60")}
        >
          <Drawing kind={kind} />
        </div>
      )}

      {/* Scan line */}
      <span
        data-bp-scan=""
        aria-hidden
        className="pointer-events-none invisible absolute inset-y-0 z-[1] w-[2px] -translate-x-1/2 bg-[#ffd2b3] opacity-0"
        style={{
          left: "calc(var(--p) * 1%)",
          boxShadow: "0 0 14px 3px rgb(246 88 2 / .85), 0 0 60px 18px rgb(246 88 2 / .28)",
        }}
      />

      <CardText p={p} number={number} size={size} revealed={revealed} reduce={reduce} />
    </TransitionLink>
  );
}
