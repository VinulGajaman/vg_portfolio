/** Expertise accordion rows (DESIGN.md §3.5). Copy from the CV's skills and experience. */

export type ExpertiseRow = {
  number: string;
  title: string;
  description: string;
  bullets: string[];
  media: `expertise-0${1 | 2 | 3 | 4 | 5}`;
};

export const expertiseRows: ExpertiseRow[] = [
  {
    number: "01.",
    title: "BACKEND & REAL-TIME SYSTEMS",
    description:
      "APIs, gateways and services that hold persistent connections and answer in milliseconds.",
    bullets: [
      "NestJS & Spring Boot",
      "REST APIs & Microservices",
      "Socket.io & persistent TCP",
      "JWT/Passport auth & fail-closed RBAC",
    ],
    media: "expertise-01",
  },
  {
    number: "02.",
    title: "MOBILE ENGINEERING",
    description:
      "Native Android and cross-platform apps that talk to hardware and keep working without signal.",
    bullets: [
      "Kotlin & Jetpack Compose",
      "React Native (Expo)",
      "Hardware SDKs: UHF RFID, ML Kit",
      "Offline-first sync with SQLite & PowerSync",
    ],
    media: "expertise-02",
  },
  {
    number: "03.",
    title: "WEB PLATFORMS",
    description: "Responsive interfaces for live monitoring consoles and data-heavy products.",
    bullets: [
      "Next.js & React.js",
      "TypeScript",
      "Tailwind CSS & Material-UI",
      "Filtering and pagination for 5,000+ record datasets",
    ],
    media: "expertise-03",
  },
  {
    number: "04.",
    title: "WEB3 & WALLET SECURITY",
    description: "Non-custodial wallets where keys are derived and kept on the device.",
    bullets: [
      "ethers.js, Web3j, BitcoinJ, BDK",
      "BIP39/32/44 key derivation",
      "AES-GCM seed encryption via Android Keystore",
      "1inch swaps & staking APIs",
    ],
    media: "expertise-04",
  },
  {
    number: "05.",
    title: "CLOUD, DEVOPS & AI",
    description: "Containerised services, automated pipelines and retrieval-augmented AI.",
    bullets: [
      "Docker & Kubernetes (Azure AKS)",
      "GitHub Actions CI/CD",
      "OpenAI, Gemini & Spring AI",
      "RAG pipelines",
    ],
    media: "expertise-05",
  },
];

export const expertise = {
  eyebrow: "Expertise",
  title: ["ENGINEERING", "ACROSS THE STACK"],
  counter: `${expertiseRows.length} Disciplines`,
} as const;
