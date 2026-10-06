/** Process staircase cards (DESIGN.md §3.6). A description of how Vinul works; no claims. */

export type ProcessStep = {
  index: string;
  title: string;
  copy: string;
  /** Line-drawing glyph for the inner panel (§3.6). */
  glyph: "graph" | "grid" | "brackets" | "cycle";
};

export const processSteps: ProcessStep[] = [
  {
    index: "//01",
    title: "Understand & Model",
    copy: "I start with the domain: who uses it, what must never fail and where the data comes from. Then I model it before writing code.",
    glyph: "graph",
  },
  {
    index: "//02",
    title: "Architect & Prototype",
    copy: "Contracts, schemas and a thin working slice first, so latency, security and offline behaviour are proven early.",
    glyph: "grid",
  },
  {
    index: "//03",
    title: "Build & Integrate",
    copy: "Typed services, real hardware and third-party APIs wired together, with tests and CI from day one.",
    glyph: "brackets",
  },
  {
    index: "//04",
    title: "Ship & Support",
    copy: "Containerised releases, zero-downtime deploys and hands-on production support after launch.",
    glyph: "cycle",
  },
];

export const processSection = {
  eyebrow: "Process",
  title: ["FROM PROBLEM", "TO PRODUCTION"],
} as const;
