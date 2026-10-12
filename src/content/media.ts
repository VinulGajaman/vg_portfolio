/**
 * Media slot registry (DESIGN.md §5.1, §5.2).
 * Every file lives flat at /public/media/<slot-id>.<ext>. src/lib/media.server.ts scans the
 * folder at build time; <MediaSlot> renders the placeholder until the file exists.
 */
import { projects } from "./projects";
import { stackTiles } from "./stack";

export type MediaKind = "image" | "video" | "svg" | "pdf";

export type MediaSlotDef = {
  id: string;
  kind: MediaKind;
  /** Aspect label, e.g. "16:9". */
  aspect: string;
  /** Numeric width / height, used for the box's aspect-ratio. 0 = free (logos, pdf). */
  ratio: number;
  /** Recommended pixel size, e.g. "3200×1800". */
  px: string;
  usedIn: string;
  required: boolean;
  alt: string;
  /** Image slots that need transparency. */
  alpha?: boolean;
};

/** Extension resolution order per kind (§5.1). */
export const MEDIA_EXTENSIONS: Record<MediaKind, string[]> = {
  image: [".avif", ".webp", ".jpg", ".jpeg", ".png"],
  video: [".mp4", ".webm"],
  svg: [".svg"],
  pdf: [".pdf"],
};

/** Expected-path hint shown on placeholders (§5.3). */
export const MEDIA_PATH_HINT: Record<MediaKind, string> = {
  image: "(webp|jpg|png)",
  video: "(mp4|webm)",
  svg: "svg",
  pdf: "pdf",
};

const r = (w: number, h: number) => w / h;

const base: MediaSlotDef[] = [
  {
    id: "hero-portrait",
    kind: "image",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "3200×1800",
    usedIn: "Hero single layer (desktop, tablet)",
    required: true,
    alt: "Side-profile portrait of Vinul Gajaman, rim-lit against an orange-to-crimson backdrop",
  },
  {
    id: "hero-portrait-mobile",
    kind: "image",
    aspect: "9:16",
    ratio: r(9, 16),
    px: "1080×1920",
    usedIn: "Hero on phone",
    required: true,
    alt: "Portrait of Vinul Gajaman, rim-lit against an orange-to-crimson backdrop",
  },
  {
    id: "hero-bg-plate",
    kind: "image",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "3200×1800",
    usedIn: "Hero depth layer L0",
    required: false,
    alt: "",
  },
  {
    id: "hero-subject",
    kind: "image",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "3200×1800",
    usedIn: "Hero depth layer L2",
    required: false,
    alpha: true,
    alt: "Vinul Gajaman in side profile",
  },
  {
    id: "hero-loop",
    kind: "video",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "1920×1080",
    usedIn: "Hero cinemagraph (desktop)",
    required: false,
    alt: "",
  },
  {
    id: "hero-thumb-01",
    kind: "image",
    aspect: "6:5",
    ratio: r(6, 5),
    px: "520×440",
    usedIn: "Hero carousel",
    required: true,
    alt: "Front portrait of Vinul Gajaman on an orange backdrop",
  },
  {
    id: "hero-thumb-02",
    kind: "image",
    aspect: "6:5",
    ratio: r(6, 5),
    px: "520×440",
    usedIn: "Hero carousel",
    required: true,
    alt: "Vinul Gajaman working at a desk with a laptop, lit by an orange rim light",
  },
  {
    id: "hero-thumb-03",
    kind: "image",
    aspect: "6:5",
    ratio: r(6, 5),
    px: "520×440",
    usedIn: "Hero carousel",
    required: true,
    alt: "Vinul Gajaman holding a handheld RFID scanner",
  },
  {
    id: "about-portrait",
    kind: "image",
    aspect: "2:3",
    ratio: r(2, 3),
    px: "1200×1800",
    usedIn: "About card",
    required: true,
    alt: "Vinul Gajaman in profile at night, lit by the warm glow of code on a monitor",
  },
  {
    id: "expertise-01",
    kind: "image",
    aspect: "6:7",
    ratio: r(6, 7),
    px: "720×840",
    usedIn: "Expertise row 01",
    required: true,
    alt: "Server rack with glowing cables in a dark room lit orange",
  },
  {
    id: "expertise-02",
    kind: "image",
    aspect: "6:7",
    ratio: r(6, 7),
    px: "720×840",
    usedIn: "Expertise row 02",
    required: true,
    alt: "Hands holding a handheld RFID scanner under orange light",
  },
  {
    id: "expertise-03",
    kind: "image",
    aspect: "6:7",
    ratio: r(6, 7),
    px: "720×840",
    usedIn: "Expertise row 03",
    required: true,
    alt: "Abstract grid of light trails on glass",
  },
  {
    id: "expertise-04",
    kind: "image",
    aspect: "6:7",
    ratio: r(6, 7),
    px: "720×840",
    usedIn: "Expertise row 04",
    required: true,
    alt: "A phone with a lock glyph drawn in light",
  },
  {
    id: "expertise-05",
    kind: "image",
    aspect: "6:7",
    ratio: r(6, 7),
    px: "720×840",
    usedIn: "Expertise row 05",
    required: true,
    alt: "Stacked shipping containers crossed by orange light beams",
  },
  {
    id: "showreel",
    kind: "video",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "1920×1080",
    usedIn: "Showreel pinned zoom",
    required: true,
    alt: "Showreel: Vinul coding at night, with app demo footage",
  },
  {
    id: "showreel-720",
    kind: "video",
    aspect: "16:9",
    ratio: r(16, 9),
    px: "1280×720",
    usedIn: "Showreel (phone, data saver)",
    required: false,
    alt: "Showreel: Vinul coding at night, with app demo footage",
  },
  {
    id: "contact-bg",
    kind: "image",
    aspect: "3:2",
    ratio: r(3, 2),
    px: "3000×2000",
    usedIn: "Contact background (desktop, tablet)",
    required: true,
    alt: "",
  },
  {
    id: "contact-bg-mobile",
    kind: "image",
    aspect: "4:5",
    ratio: r(4, 5),
    px: "1080×1350",
    usedIn: "Contact background (phone)",
    required: true,
    alt: "",
  },
  {
    id: "contact-loop",
    kind: "video",
    aspect: "3:2",
    ratio: r(3, 2),
    px: "1920×1280",
    usedIn: "Contact cinemagraph",
    required: false,
    alt: "",
  },
  {
    id: "og-image",
    kind: "image",
    aspect: "1.91:1",
    ratio: 1.91,
    px: "1200×630",
    usedIn: "Open Graph / Twitter card",
    required: true,
    alt: "Vinul Gajaman, Software Engineer (Full-Stack & Mobile)",
  },
  {
    id: "cv-pdf",
    kind: "pdf",
    aspect: "—",
    ratio: 0,
    px: "—",
    usedIn: "Download CV button (a version without the References section)",
    required: false,
    alt: "Vinul Gajaman CV",
  },
];

const projectSlots: MediaSlotDef[] = projects.flatMap((p) => [
  {
    id: `work-${p.slug}-cover`,
    kind: "image" as const,
    aspect: "4:3",
    ratio: r(4, 3),
    px: "2400×1800",
    usedIn: `Work card: ${p.title}`,
    required: true,
    alt: `${p.title} cover`,
  },
  {
    id: `work-${p.slug}-hover`,
    kind: "image" as const,
    aspect: "4:3",
    ratio: r(4, 3),
    px: "2400×1800",
    usedIn: `Work card hover: ${p.title}`,
    required: false,
    alt: `${p.title} detail`,
  },
  {
    id: `work-${p.slug}-preview`,
    kind: "video" as const,
    aspect: "4:3",
    ratio: r(4, 3),
    px: "1600×1200",
    usedIn: `Work card hover video: ${p.title}`,
    required: false,
    alt: `${p.title} screen recording`,
  },
  {
    id: `work-${p.slug}-banner`,
    kind: "image" as const,
    aspect: "14:9",
    ratio: r(14, 9),
    px: "2800×1800",
    usedIn: `Case-study banner: ${p.title}`,
    required: true,
    alt: `${p.title} banner`,
  },
  {
    id: `work-${p.slug}-gallery-01`,
    kind: "image" as const,
    aspect: "5:4",
    ratio: r(5, 4),
    px: "1600×1280",
    usedIn: `Case-study gallery: ${p.title}`,
    required: false,
    alt: `${p.title} screen`,
  },
  {
    id: `work-${p.slug}-gallery-02`,
    kind: "image" as const,
    aspect: "5:4",
    ratio: r(5, 4),
    px: "1600×1280",
    usedIn: `Case-study gallery: ${p.title}`,
    required: false,
    alt: `${p.title} detail shot`,
  },
  {
    id: `work-${p.slug}-gallery-03`,
    kind: "image" as const,
    aspect: "7:4",
    ratio: r(7, 4),
    px: "2800×1600",
    usedIn: `Case-study gallery (wide): ${p.title}`,
    required: false,
    alt: `${p.title} in context`,
  },
]);

const logoSlots: MediaSlotDef[] = stackTiles.map((t) => ({
  id: t.logo,
  kind: "svg" as const,
  aspect: "—",
  ratio: 0,
  px: "40px tall, white",
  usedIn: "Tech Stack marquee",
  required: true,
  alt: `${t.name} logo`,
}));

export const mediaSlots: MediaSlotDef[] = [...base, ...projectSlots, ...logoSlots];

const byId = new Map(mediaSlots.map((s) => [s.id, s]));

export function getSlot(id: string): MediaSlotDef | undefined {
  return byId.get(id);
}
