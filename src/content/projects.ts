/**
 * The 6 CV projects (DESIGN.md §3.7 card data + §4.3 case-study copy).
 * Fields marked `tbc` are not stated in the CV and await Vinul's confirmation (§9 item 1).
 */

export type ProjectResult = {
  /** Full display string, used by SSR, no-JS and reduced motion. */
  display: string;
  label: string;
  /** Optional count-up spec for <Counter>. */
  counter?: { from?: number; to: number; prefix?: string; suffix?: string; decimals?: number };
};

export type Project = {
  index: string;
  slug: string;
  title: string;
  /** Long title from the CV heading, used on the case-study page. */
  fullTitle: string;
  tags: [string, string, string];
  /** Card description (≤ 30 words). */
  description: string;
  year: string;
  company: string;
  /** Stack chips (the CV's "Tech:" line). */
  stack: string[];
  /** Which fields are unconfirmed (†). */
  tbc: { year: boolean; role: boolean; company: boolean };
  caseStudy: {
    role: string;
    summary: string;
    overview: string;
    challenge: string;
    built: string[];
    results: ProjectResult[];
    resultsNote?: string;
  };
};

export const projects: Project[] = [
  {
    index: "01",
    slug: "aasl-access-control",
    title: "AASL Airport Access Control Platform",
    fullTitle: "AASL Airport Access Control Platform",
    tags: ["REAL-TIME", "BACKEND", "WEB"],
    description:
      "Real-time UHF RFID and facial-recognition access control for airport personnel, cutting scan-to-display latency from ~2s to ~50–200ms.",
    year: "2026",
    company: "Coding Legends",
    stack: ["NestJS", "Next.js", "Socket.io", "TimescaleDB"],
    tbc: { year: true, role: true, company: false },
    caseStudy: {
      role: "Backend & Web Engineer",
      summary:
        "A real-time access-control platform for airports, combining UHF RFID tracking and facial recognition to authorize personnel movement.",
      overview:
        "Built for Airport and Aviation Sri Lanka (AASL). The platform authorizes personnel movement against an external permit authority, using UHF RFID tracking and facial recognition, and shows every scan on a live monitoring console.",
      challenge:
        "UHF readers stream binary frames over persistent TCP connections. Every scan has to be authorized and reach the security console almost instantly. The system must survive restarts without losing state, and access must fail closed.",
      built: [
        "The RFID backend in NestJS over persistent TCP to UHF readers (binary protocol)",
        "A Socket.io gateway for live updates",
        "An in-memory O(1) authorization engine with full restart durability",
        "Movement detection from antenna pairings (in/out direction)",
        "A 3-tier TimescaleDB data lifecycle",
        "Streaming CSV exports",
        "Fail-closed RBAC",
        "A rebuilt live monitoring console in Next.js",
      ],
      results: [
        {
          display: "~2s → 50ms",
          label: "Scan-to-display latency (~50–200ms)",
          counter: { from: 2000, to: 50, prefix: "~2s → ", suffix: "ms" },
        },
      ],
    },
  },
  {
    index: "02",
    slug: "jova-wallet",
    title: "Jova Multi-Chain Crypto Wallet",
    fullTitle: "Jova Multi-Chain Crypto Wallet (Android + Backend)",
    tags: ["WEB3", "ANDROID", "BACKEND"],
    description:
      "Non-custodial wallet for Bitcoin and 7 EVM chains, with on-device key derivation and signing, salted PIN lockout and staking APIs.",
    year: "2026",
    company: "Coding Legends",
    stack: ["Kotlin", "Jetpack Compose", "Web3j", "NestJS"],
    tbc: { year: true, role: true, company: false },
    caseStudy: {
      role: "Mobile & Backend Engineer",
      summary:
        "A non-custodial wallet for Bitcoin and 7 EVM chains, with keys derived and used only on the device.",
      overview:
        "An Android wallet and its NestJS backend. Users hold their own keys: the app derives keys and signs on the device, and the backend serves token data, prices and staking.",
      challenge:
        "Keep seed phrases and private keys secure on a phone, support many chains from one seed, and keep price and chart data fast without a custodial server.",
      built: [
        "BIP39/32/44 key derivation",
        "A salted PIN with progressive lockout",
        "Root detection",
        "On-device EVM signing",
        "AES-GCM seed encryption via Android Keystore, with biometric/PIN unlock",
        "A backend with CoinGecko token-registry sync, cached price and OHLC chart pipelines, and staking APIs built from the contract ABI",
        "JWT/Passport auth built from scratch, admin token and market management, a 1inch-powered swap service, and unsigned-transaction building for client-side signing",
      ],
      results: [
        {
          display: "7 + 1",
          label: "Bitcoin + 7 EVM chains in one non-custodial wallet",
          counter: { from: 0, to: 7, suffix: " + 1" },
        },
      ],
      resultsNote: "Android (Kotlin) and iOS/Android (React Native) clients.",
    },
  },
  {
    index: "03",
    slug: "offline-expense-platform",
    title: "Offline-First Construction Expense Platform",
    fullTitle: "Offline-First Construction Expense Platform",
    tags: ["MOBILE", "OFFLINE-FIRST", "BACKEND"],
    description:
      "Local-first expense tracking for crews without coverage: instant offline writes, maker-checker approvals, and uploads cut from ~20 minutes to seconds.",
    year: "2026",
    company: "Coding Legends",
    stack: ["React Native (Expo)", "NestJS", "PostgreSQL", "PowerSync", "SQLite"],
    tbc: { year: true, role: true, company: false },
    caseStudy: {
      role: "Full-Stack Engineer",
      summary:
        "Local-first expense and bill tracking for construction teams working without reliable coverage.",
      overview:
        "Every write commits instantly to local SQLite and syncs on reconnect via PowerSync. A server-side approval state machine enforces maker-checker controls on every money-moving action.",
      challenge:
        "Site crews often have no signal, but expenses, bills and photos still need to be recorded and approved safely. Photo uploads were taking far too long.",
      built: [
        "Instant offline writes on SQLite",
        "PowerSync sync on reconnect",
        "A maker-checker approval state machine on the server",
        "The diagnosis and fix of a head-of-line blocking bug in the photo-upload queue",
      ],
      results: [
        // No counter: a count-down to "~0 min" would misstate "seconds".
        { display: "~20 min → secs", label: "Photo-upload time" },
      ],
    },
  },
  {
    index: "04",
    slug: "uhf-rfid-scanner",
    title: "Android UHF RFID Handheld Scanner",
    fullTitle: "Android UHF RFID Handheld Scanner",
    tags: ["ANDROID", "HARDWARE", "IOT"],
    description:
      "Native Android app reading UHF tag EPC data over serial in real time, with ML Kit QR ticket and member verification.",
    year: "2026",
    company: "Coding Legends",
    stack: ["Kotlin", "Jetpack Compose", "Retrofit", "ML Kit"],
    tbc: { year: true, role: true, company: false },
    caseStudy: {
      role: "Android Engineer",
      summary: "A native Android app for handheld UHF RFID devices, built for AASL.",
      overview:
        "The app interfaces with the UHFRManager hardware SDK over a serial port to read tag EPC data in real time, uploads scans to a REST API, and verifies tickets and members through ML Kit QR scanning.",
      challenge:
        "Talk to scanner hardware directly, read tags continuously without dropping scans, and verify people in the field.",
      built: [
        "UHFRManager SDK integration over serial",
        "Real-time EPC reads",
        "Scan upload to a REST API",
        "ML Kit QR ticket and member verification",
        "JWT authentication with token refresh",
        "Configurable backend URLs",
      ],
      results: [
        {
          display: "Real-time",
          label: "Ticket and member verification on handheld devices",
        },
      ],
    },
  },
  {
    index: "05",
    slug: "techsalary-lk",
    title: "TechSalary LK",
    fullTitle: "TechSalary LK (Cloud-Native Salary Transparency Platform)",
    tags: ["CLOUD-NATIVE", "KUBERNETES", "CI/CD"],
    description:
      "Salary-transparency platform built as 7 containerised microservices on Azure AKS, with a BFF gateway and zero-downtime rolling deploys.",
    year: "2026",
    company: "Independent",
    stack: ["Docker", "Kubernetes (Azure AKS)", "GitHub Actions", "Jest"],
    tbc: { year: true, role: true, company: true },
    caseStudy: {
      role: "Cloud & Backend Engineer",
      summary:
        "A salary-transparency web app built as 7 containerised microservices on Azure Kubernetes Service.",
      overview:
        "A Backend-for-Frontend gateway handles JWT auth and routing in front of 7 services. A community approval workflow publishes submissions after 3 upvotes, and published submissions feed search and aggregate statistics.",
      challenge: "Run many small services reliably and deploy them without downtime.",
      built: [
        "7 containerised microservices",
        "A BFF gateway with JWT auth",
        "The 3-upvote approval workflow",
        "Full CI/CD in GitHub Actions: parallel Jest tests, Docker builds to Azure Container Registry, and kubectl rolling updates",
      ],
      results: [
        { display: "Zero-downtime", label: "Rolling deploys" },
        { display: "7", label: "Services on AKS", counter: { from: 0, to: 7 } },
      ],
    },
  },
  {
    index: "06",
    slug: "ai-chatbot-backend",
    title: "AI Chatbot Backend",
    fullTitle: "AI Chatbot Backend",
    tags: ["AI", "RAG", "BACKEND"],
    description:
      "Spring AI chatbot using retrieval-augmented generation over a product PDF knowledge base, exposed through REST endpoints.",
    year: "2025",
    company: "DMS Software Technologies",
    stack: ["Spring AI", "OpenAI API", "RAG"],
    tbc: { year: true, role: false, company: false },
    caseStudy: {
      role: "Software Engineer Intern",
      summary:
        "A chatbot backend using Spring AI with retrieval-augmented generation over a product PDF knowledge base.",
      overview:
        "REST endpoints expose domain-specific AI support, grounded in the company's own product documentation.",
      challenge:
        "Answer product questions accurately from internal documents instead of general model knowledge.",
      built: [
        "A Spring AI service",
        "A RAG pipeline over a PDF knowledge base",
        "REST endpoints for domain-specific support",
      ],
      results: [
        { display: "100+", label: "Daily queries handled", counter: { from: 0, to: 100, suffix: "+" } },
        { display: "50%", label: "Fewer manual support tickets", counter: { from: 0, to: 50, suffix: "%" } },
      ],
      // † From the DMS experience section; confirm it is the same system (§9 item 2).
      resultsNote: "Measured on the deployed OpenAI + RAG support chatbot at DMS.",
    },
  },
];

export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Wrap-around neighbours for Prev/Next pills (§4.1). */
export function getNeighbours(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
}

export const work = {
  eyebrow: "Selected Work",
  title: ["SYSTEMS BUILT", "FOR PRODUCTION"],
  counter: `${projects.length} Projects`,
} as const;
