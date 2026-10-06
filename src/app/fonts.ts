import localFont from "next/font/local";

/**
 * Clash Display 600/700 (ITF Free Font License), self-hosted (DESIGN.md §1.3).
 * adjustFontFallback is off: portvio's measured fallback face ("Clash Display Fallback",
 * local Arial with ascent 83.42% / descent 23.43% / line-gap 8.44% / size-adjust 106.69%)
 * is declared in globals.css and listed here as the first fallback, so swapping causes no shift.
 */
export const clash = localFont({
  src: [
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["Clash Display Fallback", "Arial", "sans-serif"],
});

/**
 * Inter 400/500/600/700: portvio's exact latin woff2 files (research/portvio/structure/fonts),
 * self-hosted so the static export never depends on a network fetch at build time.
 * The automatic Arial fallback reproduces portvio's metric overrides
 * (ascent 89.79%, descent 22.36%, size-adjust 107.89%).
 */
export const inter = localFont({
  src: [
    { path: "../fonts/Inter-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Inter-600-latin.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Inter-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});
