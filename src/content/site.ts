/**
 * Site-wide copy (DESIGN.md §3, §6.1). Every value comes from docs/Vinul Gajaman CV.pdf.
 * The CV's References section is never reproduced anywhere in this project.
 */

export const site = {
  name: "Vinul Gajaman",
  firstName: "Vinul",
  lastName: "Gajaman",
  role: "Software Engineer",
  roleDetail: "Full-Stack & Mobile",
  roleLong: "Software Engineer (Full-Stack & Mobile)",
  location: "Colombo, Sri Lanka",
  city: "Colombo",
  countryCode: "LK",
  timeZone: "Asia/Colombo",
  email: "puldithvinul@gmail.com",
  phone: "+94 71 033 4443",
  phoneHref: "tel:+94710334443",
  socials: {
    linkedin: {
      label: "LinkedIn",
      href: "https://linkedin.com/in/vinul-gajaman-a788a92b8",
    },
    github: { label: "GitHub", href: "https://github.com/VinulGajaman" },
  },
  /** First sentence of the CV summary (§6.1 metadata description). */
  summary:
    "Software Engineer with 2+ years of experience building full-stack, mobile, and real-time systems across enterprise, IoT, and Web3 domains.",
  /** Full CV professional summary. */
  summaryLong: [
    "Software Engineer with 2+ years of experience building full-stack, mobile, and real-time systems across enterprise, IoT, and Web3 domains.",
    "Experienced in NestJS, Spring Boot, React/Next.js, React Native, and Kotlin/Jetpack Compose, with production work in REST APIs, microservices, Docker/Kubernetes, and CI/CD.",
    "Recently built a real-time RFID access-control platform for airport security and non-custodial crypto wallets supporting Bitcoin and 7 EVM chains.",
  ],
  metaTitle: "Vinul Gajaman | Software Engineer, Full-Stack & Mobile",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const mailto = `mailto:${site.email}`;

/** Menu links (§3.0). Detail pages link back with `/#anchor`. */
export const navLinks = [
  { label: "Home", anchor: "hero" },
  { label: "About", anchor: "about" },
  { label: "Expertise", anchor: "expertise" },
  { label: "Work", anchor: "work" },
  { label: "Experience", anchor: "experience" },
  { label: "Contact", anchor: "contact" },
] as const;

/** One label per intent (§3.0). */
export const ctaLabels = {
  contact: "Let's Talk",
  project: "View Case Study",
  submit: "Send Message",
  cv: "Download CV",
} as const;

/** Homepage section anchors in §3.0 order. */
export const sections = {
  hero: "hero",
  about: "about",
  stack: "stack",
  expertise: "expertise",
  process: "process",
  work: "work",
  impact: "impact",
  experience: "experience",
  showreel: "showreel",
  contact: "contact",
} as const;

export const hero = {
  wordmark: "VINUL GAJAMAN",
  wordmarkLines: ["VINUL", "GAJAMAN"],
  srHeading: "Vinul Gajaman, Software Engineer (Full-Stack & Mobile)",
  tagline: "Full-Stack & Mobile Software Engineer Building Real-Time Systems.",
  paragraph:
    "2+ years shipping full-stack, mobile and real-time systems across enterprise, IoT and Web3.",
  chips: [
    "NestJS",
    "Next.js",
    "React Native",
    "Kotlin",
    "Jetpack Compose",
    "Spring Boot",
    "TimescaleDB",
    "Kubernetes",
    "Socket.io",
    "TypeScript",
  ],
  thumbs: ["hero-thumb-01", "hero-thumb-02", "hero-thumb-03"],
} as const;

export const about = {
  eyebrow: "About Me",
  /** Statement split so the accent span can be coloured (§3.3). */
  statement: [
    { text: "I ENGINEER " },
    { text: "REAL-TIME, MOBILE & WEB SYSTEMS", accent: true },
    {
      text: ", FROM AIRPORT ACCESS CONTROL TO MULTI-CHAIN CRYPTO WALLETS, BUILT TO BE FAST, SECURE AND READY FOR PRODUCTION.",
    },
  ],
  stats: [
    { value: 2, suffix: "+", label: "Years of Experience" },
    { value: 5, suffix: "", label: "Production Environments Maintained" },
  ],
  paragraph:
    "Experienced in NestJS, Spring Boot, React/Next.js, React Native and Kotlin/Jetpack Compose, with production work in REST APIs, microservices, Docker/Kubernetes and CI/CD.",
  media: "about-portrait",
} as const;

export const contact = {
  eyebrow: "Contact",
  title: "LET'S TALK",
  subline:
    "Have a project, a role or a hard engineering problem? Send a message and I'll reply by email.",
  fields: {
    firstName: { label: "First Name", placeholder: "Vinul", autoComplete: "given-name" },
    lastName: { label: "Last Name", placeholder: "Gajaman", autoComplete: "family-name" },
    email: { label: "Email Address", placeholder: "you@company.com", autoComplete: "email" },
    message: { label: "Message", placeholder: "Tell me about it", autoComplete: "off" },
  },
  submit: "Send Message",
  success: "Message sent",
  endpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
} as const;

export const footer = {
  label: "Let's work together",
  line: "Have a project or a role in mind? Let's build it.",
  copy: "Copy",
  copied: "Copied",
  columns: {
    menu: {
      label: "Menu",
      links: [
        { label: "Home", anchor: "hero" },
        { label: "About", anchor: "about" },
        { label: "Work", anchor: "work" },
        { label: "Experience", anchor: "experience" },
      ],
    },
    social: { label: "Social" },
    location: { label: "Location" },
  },
  emailLabel: "Email",
  phoneLabel: "Phone",
  copyright: "© 2026 Vinul Gajaman. Designed and built by Vinul.",
  backToTop: "Back to top",
} as const;

export const preloader = {
  topLeft: "Software Engineer · Full-Stack & Mobile",
  topRight: "Colombo, Sri Lanka",
  name: "VINUL GAJAMAN",
} as const;

export const notFound = {
  title: "PAGE NOT FOUND",
  lead: "This page wandered off.",
  body: "The page you're looking for doesn't exist, may have moved, or the URL might be wrong.",
  cta: "Back to Home",
} as const;

export const showreel = {
  left: "SHOWREEL",
  right: "//2026©",
} as const;
