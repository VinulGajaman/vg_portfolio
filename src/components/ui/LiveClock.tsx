"use client";

/**
 * <LiveClock tz="Asia/Colombo">: ticks every second, "11:38:34 PM" (DESIGN.md §2.5).
 * SSR renders a fixed-width invisible placeholder, so there is no hydration mismatch.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function LiveClock({ tz = "Asia/Colombo", className }: { tz?: string; className?: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", second: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tz]);
  return (
    <span className={cn("tabular inline-block", className)} suppressHydrationWarning>
      {time ?? <span className="invisible">00:00:00 PM</span>}
    </span>
  );
}
