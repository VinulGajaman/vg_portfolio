/**
 * Motion tokens (DESIGN.md §2.1 – §2.4). Pure data: safe to import from server or client.
 */

/* -------------------------------------------------------------------------- */
/* Motion profile (§2.4)                                                       */
/* -------------------------------------------------------------------------- */

export type MotionProfile = "plus" | "portvio";

/** `plus` ships. `portvio` falls back to portvio's exact baselines for side-by-side checks. */
export const MOTION_PROFILE: MotionProfile =
  process.env.NEXT_PUBLIC_MOTION_PROFILE === "portvio" ? "portvio" : "plus";

export const isPlus = MOTION_PROFILE === "plus";

/* -------------------------------------------------------------------------- */
/* Cubic-bezier tokens (§2.1)                                                  */
/* -------------------------------------------------------------------------- */

export type Bezier = [number, number, number, number];

export const BEZIER = {
  portvio: [0.44, 0, 0.56, 1],
  mask: [0.645, 0.045, 0.355, 1],
  roll: [0.42, 0, 0.58, 1],
  out: [0.23, 1, 0.32, 1],
  drawer: [0.32, 0.72, 0, 1],
  expoInOut: [0.87, 0, 0.13, 1],
} as const satisfies Record<string, Bezier>;

/** Lenis easing [pv: motion §0]. */
export const lenisEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/** Smoothstep x*x*(3-2x) [sc: easing]. */
export const smoothstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Dwell remap (1-L)x + L(4(x-.5)^3 + .5), L ≤ 0.6 [sc: dwell]. f(0)=0, f(1)=1. */
export const dwell = (x: number, L = 0.4) => {
  const l = Math.min(0.6, Math.max(0, L));
  return (1 - l) * x + l * (4 * Math.pow(x - 0.5, 3) + 0.5);
};

/* -------------------------------------------------------------------------- */
/* Spring samples (§2.1): 25 equally spaced samples of portvio's Framer springs */
/* -------------------------------------------------------------------------- */

export const SPRING_SAMPLES = {
  springHero: {
    duration: 1.007,
    points: [0, 0.0624, 0.1884, 0.3303, 0.4648, 0.582, 0.679, 0.7567, 0.8175, 0.8643, 0.8997, 0.9264, 0.9458, 0.9606, 0.9714, 0.9794, 0.9851, 0.9893, 0.9923, 0.9945, 0.9961, 0.9972, 0.998, 0.9986, 1],
  },
  springReveal: {
    duration: 1.207,
    points: [0, 0.0609, 0.188, 0.3287, 0.4624, 0.579, 0.6777, 0.7551, 0.8159, 0.8636, 0.899, 0.9257, 0.9456, 0.9606, 0.9714, 0.9793, 0.9851, 0.9893, 0.9923, 0.9945, 0.9961, 0.9972, 0.998, 0.9986, 1],
  },
  springLayout: {
    duration: 0.809,
    points: [0, 0.0647, 0.189, 0.3327, 0.4685, 0.5863, 0.6809, 0.759, 0.8198, 0.8653, 0.9008, 0.9274, 0.9471, 0.9613, 0.972, 0.9799, 0.9854, 0.9895, 0.9925, 0.9946, 0.9962, 0.9973, 0.9981, 0.9986, 1],
  },
  springUI: {
    duration: 0.63,
    points: [0, 0.0686, 0.2069, 0.3534, 0.4894, 0.6058, 0.704, 0.7782, 0.8355, 0.879, 0.9127, 0.9365, 0.9541, 0.9669, 0.9766, 0.9832, 0.988, 0.9915, 0.994, 0.9957, 0.997, 0.9979, 0.9985, 0.9989, 1],
  },
  springFade: {
    duration: 0.442,
    points: [0, 0.0767, 0.226, 0.3777, 0.5225, 0.6369, 0.7328, 0.8027, 0.8557, 0.8971, 0.9258, 0.9477, 0.9626, 0.9734, 0.9815, 0.9869, 0.9909, 0.9936, 0.9956, 0.9969, 0.9978, 0.9985, 0.9989, 0.9993, 1],
  },
  springSnappy: {
    duration: 0.42,
    points: [0, 0.077, 0.2184, 0.3893, 0.5428, 0.6821, 0.7871, 0.8707, 0.9268, 0.9666, 0.9902, 1.0045, 1.0111, 1.0135, 1.0132, 1.0114, 1.0093, 1.007, 1.0051, 1.0034, 1.0022, 1.0013, 1.0007, 1.0002, 1],
  },
  springCard: {
    duration: 2.243,
    points: [0, 0.23, 0.4241, 0.568, 0.6769, 0.7576, 0.8187, 0.864, 0.8983, 0.9237, 0.9429, 0.9572, 0.9679, 0.976, 0.982, 0.9865, 0.9899, 0.9924, 0.9943, 0.9958, 0.9968, 0.9976, 0.9982, 0.9987, 1],
  },
} as const;

export type SpringName = keyof typeof SPRING_SAMPLES;

/* -------------------------------------------------------------------------- */
/* motion-library springs (§2.2): pass the Framer form directly                */
/* -------------------------------------------------------------------------- */

export const SPRING = {
  springHero: { type: "spring", duration: 1, bounce: 0 },
  springReveal: { type: "spring", duration: 1.2, bounce: 0 },
  springLayout: { type: "spring", duration: 0.8, bounce: 0 },
  springUI: { type: "spring", duration: 0.6, bounce: 0 },
  springFade: { type: "spring", duration: 0.4, bounce: 0 },
  springSnappy: { type: "spring", duration: 0.4, bounce: 0.2 },
  springCursor: { type: "spring", stiffness: 400, damping: 60, mass: 1 },
  springToggle: { type: "spring", stiffness: 500, damping: 60, mass: 1 },
  springCard: { type: "spring", stiffness: 300, damping: 100, mass: 1 },
} as const;

/* -------------------------------------------------------------------------- */
/* Durations and staggers (§2.3), in seconds                                   */
/* -------------------------------------------------------------------------- */

export const DUR = {
  press: 0.1,
  hover: 0.18,
  roll: 0.2,
  rollLg: 0.3,
  colour: 0.2,
  ui: 0.63,
  layout: 0.8,
  hero: 1.0,
  reveal: 1.2,
  count: 1.4,
  transition: 0.7,
  /** Reduced-motion fades (§6.3). */
  reduced: 0.4,
} as const;

export const STAGGER = {
  roll: 0.025,
  rollLg: 0.03,
  chars: 0.02,
  charsWordmark: 0.035,
  words: 0.05,
  lines: 0.08,
  menu: 0.05,
  menuCap: 0.15,
  siblings: [0.2, 0.3, 0.4],
} as const;

/** ScrollTrigger scrub smoothing that reproduces portvio's k500 c60 scroll spring. */
export const SCRUB = 0.7;

/* -------------------------------------------------------------------------- */
/* Media query contexts (§2.4)                                                 */
/* -------------------------------------------------------------------------- */

export const MQ = {
  isDesktop: "(min-width: 1200px)",
  isTablet: "(min-width: 810px) and (max-width: 1199.98px)",
  isPhone: "(max-width: 809.98px)",
  reduce: "(prefers-reduced-motion: reduce)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export type MQConditions = { [K in keyof typeof MQ]: boolean };
