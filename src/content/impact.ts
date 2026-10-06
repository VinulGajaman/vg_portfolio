/** Impact rail panels (DESIGN.md §3.8). Every value comes from the CV. */

export type ImpactPanel = {
  /** Full SSR / reduced-motion string. */
  display: string;
  counter: {
    from: number;
    to: number;
    /** Static text before the counting number (e.g. "~2s → "). */
    prefix?: string;
    /** Static text after the counting number (e.g. "%", "k+"). */
    suffix?: string;
  };
  /** Optional label that replaces the number when the count finishes (panel 6, via SlotSwap). */
  swapTo?: string;
  unit: string;
  label: string;
  context: string;
};

export const impactPanels: ImpactPanel[] = [
  {
    display: "~2s → 50ms",
    counter: { from: 2000, to: 50, prefix: "~2s → ", suffix: "ms" },
    unit: "scan-to-display latency",
    label: "Real-time RFID pipeline",
    context:
      "AASL Access Control · Coding Legends. In-memory O(1) authorization engine and Socket.io gateway; ~50–200ms.",
  },
  {
    display: "35%",
    counter: { from: 0, to: 35, suffix: "%" },
    unit: "faster API responses",
    label: "Query design and data handling",
    context: "Tour Management System · DMS",
  },
  {
    display: "100k+",
    counter: { from: 0, to: 100, suffix: "k+" },
    unit: "records migrated",
    label: "Two legacy systems, zero data loss",
    context: "Ahead of schedule · DMS",
  },
  {
    display: "150+",
    counter: { from: 0, to: 150, suffix: "+" },
    unit: "concurrent users supported",
    label: "Across five production environments",
    context: "End-to-end support · DMS",
  },
  {
    display: "7 + 1",
    counter: { from: 0, to: 7, suffix: " + 1" },
    unit: "chains in one wallet",
    label: "7 EVM chains plus Bitcoin",
    context: "Jova Wallet · Coding Legends",
  },
  {
    display: "~20 min → secs",
    counter: { from: 20, to: 0, prefix: "~", suffix: " min" },
    swapTo: "secs",
    unit: "photo-upload time",
    label: "Head-of-line blocking bug fixed",
    context: "Offline-first platform · Coding Legends",
  },
];

export const impact = {
  eyebrow: "Impact",
  title: ["MEASURED", "IN PRODUCTION"],
  counter: `${impactPanels.length} Results`,
} as const;
