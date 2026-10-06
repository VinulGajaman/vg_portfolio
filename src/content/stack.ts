/** Tech Stack marquee tiles and the full skills index (DESIGN.md §3.4). */

export type StackTile = {
  name: string;
  /** Media slot id of the white monochrome logo SVG (§5.2). */
  logo: `logo-${string}`;
};

/** 20 tiles, in §3.4 order. */
export const stackTiles: StackTile[] = [
  { name: "NestJS", logo: "logo-nestjs" },
  { name: "Spring Boot", logo: "logo-springboot" },
  { name: "Java", logo: "logo-java" },
  { name: "Next.js", logo: "logo-nextjs" },
  { name: "React", logo: "logo-react" },
  { name: "React Native", logo: "logo-react-native" },
  { name: "Kotlin", logo: "logo-kotlin" },
  { name: "Jetpack Compose", logo: "logo-jetpack-compose" },
  { name: "TypeScript", logo: "logo-typescript" },
  { name: "PostgreSQL", logo: "logo-postgresql" },
  { name: "MySQL", logo: "logo-mysql" },
  { name: "TimescaleDB", logo: "logo-timescaledb" },
  { name: "MongoDB", logo: "logo-mongodb" },
  { name: "Firebase", logo: "logo-firebase" },
  { name: "Docker", logo: "logo-docker" },
  { name: "Kubernetes", logo: "logo-kubernetes" },
  { name: "Azure", logo: "logo-azure" },
  { name: "GitHub Actions", logo: "logo-github-actions" },
  { name: "OpenAI", logo: "logo-openai" },
  { name: "Socket.io", logo: "logo-socketio" },
];

export type SkillGroup = { label: string; items: string[] };

/** The CV's complete skills list, verbatim, in 7 groups using the CV's own headings. */
export const skillGroups: SkillGroup[] = [
  { label: "Languages", items: ["Java", "TypeScript", "JavaScript", "Kotlin", "SQL"] },
  {
    label: "Backend",
    items: [
      "NestJS",
      "Spring Boot",
      "Spring AI",
      "REST APIs",
      "Microservices",
      "Socket.io",
      "JWT/Passport",
    ],
  },
  {
    label: "Frontend & Mobile",
    items: [
      "React.js",
      "Next.js",
      "React Native (Expo)",
      "Jetpack Compose",
      "Tailwind CSS",
      "Material-UI",
    ],
  },
  {
    label: "Databases",
    items: ["PostgreSQL", "MySQL", "TimescaleDB", "MongoDB", "SQLite/PowerSync", "Firebase"],
  },
  {
    label: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "Azure AKS", "GitHub Actions", "Git", "Bitbucket", "JIRA"],
  },
  { label: "Web3", items: ["ethers.js", "Web3j", "BitcoinJ", "BDK", "BIP39/32/44", "1inch API"] },
  { label: "Generative AI", items: ["OpenAI API", "Gemini API", "RAG", "Claude Code"] },
];

export const stack = {
  eyebrow: "Tech Stack",
  centre: "Tools I Build With",
} as const;
