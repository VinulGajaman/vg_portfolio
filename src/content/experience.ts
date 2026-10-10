/** Experience shell, timeline and education (DESIGN.md §3.9). Copy from the CV. */

export type Role = {
  company: string;
  role: string;
  roleDetail?: string;
  years: string;
  dates: string;
  location: string;
  current: boolean;
  label: string;
  bullets: string[];
  chips: string[];
  /** Highlighted (gradient) card in the shell. */
  highlighted: boolean;
};

/** Desktop order: DMS left, Coding Legends right. On phone the current role leads (§3.9). */
export const roles: Role[] = [
  {
    company: "DMS Software Technologies (Pvt) Ltd",
    role: "Software Engineer Intern",
    roleDetail:
    "",
   //   "Tour Management System (Spring Boot · React.js · Docker · MySQL, microservices)",
    years: "2024 – 2025",
    dates: "06/2024 – 11/2025",
    location: "Colombo",
    current: false,
    label: "WHAT I DID:",
    bullets: [
      "Cut average API response time by 35% through efficient query design",
      "Built 15 responsive Material-UI components with filtering and pagination for 5,000+ records",
      "Shipped an OpenAI + RAG chatbot handling 100+ daily queries, cutting manual tickets by 50%",
      "Containerised apps with Docker, cutting setup from hours to under 5 minutes",
      "Led the migration of two legacy systems with 100,000+ records and zero data loss",
      "Maintained five production environments for 150+ concurrent users",
    ],
    chips: ["Spring Boot", "React.js", "MySQL", "Docker", "OpenAI"],
    highlighted: false,
  },
  {
    company: "Coding Legends (Pvt) Ltd",
    role: "Junior Software Engineer",
    years: "2025 – NOW",
    dates: "11/2025 – Present",
    location: "Colombo",
    current: true,
    label: "WHAT I DID:",
    bullets: [
      "Real-time RFID and biometric access control for Airport and Aviation Sri Lanka; latency ~2s → ~50–200ms",
      "Owned the RFID backend over persistent TCP to UHF readers, with fail-closed RBAC and a 3-tier TimescaleDB lifecycle",
      "Native Android app for UHF RFID handhelds with the UHFRManager SDK and ML Kit QR",
      "Non-custodial wallets for Bitcoin and 7 EVM chains with Android Keystore AES-GCM and biometric/PIN security",
      "NestJS wallet backends: JWT/Passport from scratch, 1inch swaps, staking, unsigned-transaction building",
      "Offline-first expense platform; fixed a head-of-line upload bug, ~20 minutes → seconds",
    ],
    chips: ["NestJS", "Next.js", "Socket.io", "TimescaleDB", "Kotlin", "React Native"],
    highlighted: true,
  },
];

export const timelineNodes = [
  { label: "06/2024 · DMS Intern", at: 0, now: false },
  { label: "11/2025 · Coding Legends", at: 0.5, now: false },
  { label: "NOW", at: 1, now: true },
] as const;

export type Education = {
  degree: string;
  institution: string;
  awardedBy: string;
  note?: string;
  years: string;
  yearFrom: number;
  yearTo: number | null;
};

export const education: Education[] = [
  {
    degree: "MSc in Advanced Software Engineering",
    institution: "Informatics Institute of Technology (IIT), Colombo",
    awardedBy: "Awarded by University of Westminster, UK",
    note: "Expected 09/2027",
    years: "2025 – NOW",
    yearFrom: 2025,
    yearTo: null,
  },
  {
    degree: "BSc (Hons) in Software Engineering",
    institution: "Java Institute for Advanced Technology, Sri Lanka",
    awardedBy: "Awarded by Birmingham City University, UK",
    years: "2020 – 2024",
    yearFrom: 2020,
    yearTo: 2024,
  },
];

export const experience = {
  eyebrow: "Experience",
  title: ["WHERE I'VE", "BUILT IT"],
  educationEyebrow: "Education",
  currentPill: "Current",
} as const;
