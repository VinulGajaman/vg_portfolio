"use client";

/**
 * Impact `#impact` (DESIGN.md §3.8, U10). Pinned horizontal rail: 1:1 travel + 15% dwell, velocity
 * skew, progress fill (all in <HorizontalRail>). Each panel reveals and counts at "left 75%" of
 * the rail tween; panels tilt (max 6°) on fine pointers unless the rail moves faster than 300px/s.
 * Phone: a one-column stack, counters trigger as they enter.
 */
import { useState } from "react";
import { HorizontalRail, RailPanel, useRail } from "@/components/motion/HorizontalRail";
import { Counter } from "@/components/motion/Counter";
import { Tilt } from "@/components/motion/Tilt";
import { SlotSwap } from "@/components/motion/SlotSwap";
import { AmbientGlow } from "@/components/motion/AmbientGlow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Sparkle } from "@/components/ui/Sparkle";
import { Divider } from "@/components/ui/Divider";
import { useReducedMotion } from "@/lib/hooks";
import { impact, impactPanels, type ImpactPanel } from "@/content/impact";

function PanelNumber({ panel }: { panel: ImpactPanel }) {
  const { tween } = useRail();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const { from, to, prefix = "", suffix = "" } = panel.counter;

  // A "→" prefix (e.g. "~2s → ") is static and sits on a small line above the counting value.
  const arrowPrefix = panel.swapTo ? panel.display.split("→")[0] + "→" : prefix.includes("→") ? prefix.trim() : "";
  const inlinePrefix = panel.swapTo || prefix.includes("→") ? "" : prefix;
  const counter = (
    <Counter
      from={from}
      to={to}
      prefix={inlinePrefix}
      suffix={suffix}
      duration={1.4}
      start="left 75%"
      containerAnimation={tween ?? undefined}
      onComplete={panel.swapTo ? () => setDone(true) : undefined}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="sr-only">{panel.display}</span>
      <span aria-hidden className="type-number min-h-[1.2em] text-ink-soft">
        {arrowPrefix}
      </span>
      <span aria-hidden className="type-display-impact flex text-ink">
        {panel.swapTo ? (
          reduce ? (
            panel.swapTo
          ) : (
            <SlotSwap a={counter} b={<span>{panel.swapTo}</span>} active={done} distance={60} />
          )
        ) : (
          counter
        )}
      </span>
    </div>
  );
}

function Panel({ panel }: { panel: ImpactPanel }) {
  const { getVelocity } = useRail();
  return (
    <RailPanel className="w-full md:w-[380px] lg:w-[440px]">
      <Tilt max={6} isDisabled={() => getVelocity() > 300} className="h-full">
        <article className="border-overlay edge-light flex h-full flex-col justify-between gap-10 rounded-2xl bg-surface p-[30px] md:h-[460px] lg:h-[520px]">
          <div className="flex items-start justify-between gap-4">
            <PanelNumber panel={panel} />
            <Sparkle size={20} className="mt-2 shrink-0 text-accent" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="type-lead text-ink">{panel.unit}</p>
            <p className="type-ui text-ink">{panel.label}</p>
            <Divider className="my-2" />
            <p className="type-body text-ink-soft">{panel.context}</p>
          </div>
        </article>
      </Tilt>
    </RailPanel>
  );
}

export default function Impact() {
  return (
    <HorizontalRail
      id="impact"
      aria-labelledby="impact-title"
      className="section-pad-heavy md:motion-safe:pb-0"
      header={
        <SectionHeader
          eyebrow={impact.eyebrow}
          title={impact.title}
          counter={impact.counter}
          titleId="impact-title"
          className="heading-gap md:motion-safe:mb-0"
        />
      }
      background={<AmbientGlow preset="b" />}
    >
      {impactPanels.map((p) => (
        <Panel key={p.label} panel={p} />
      ))}
    </HorizontalRail>
  );
}
