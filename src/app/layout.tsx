import type { Metadata, Viewport } from "next";
import "./globals.css";
import { clash, inter } from "./fonts";
import { site } from "@/content/site";
import { education } from "@/content/experience";
import { getMediaMap } from "@/lib/media.server";
import { MOTION_PROFILE } from "@/lib/motion-tokens";
import { Providers } from "@/components/providers/Providers";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransitionProvider } from "@/components/motion/PageTransition";
import { Cursor } from "@/components/motion/Cursor";
import { Preloader } from "@/components/motion/Preloader";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Nav } from "@/components/layout/Nav";
import { CompactNav } from "@/components/layout/CompactNav";
import { Menu } from "@/components/layout/Menu";
import { Footer } from "@/components/layout/Footer";

export function generateMetadata(): Metadata {
  const og = getMediaMap()["og-image"];
  return {
    metadataBase: new URL(site.siteUrl),
    title: { default: site.metaTitle, template: `%s | ${site.name}` },
    description: site.summary,
    applicationName: site.name,
    // iOS Safari otherwise rewrites numbers / dates / addresses into links before React hydrates;
    // that mismatch makes React rebuild the page (and drop the classes on <html>).
    formatDetection: { telephone: false, date: false, address: false, email: false, url: false },
    authors: [{ name: site.name }],
    openGraph: {
      type: "website",
      title: site.metaTitle,
      description: site.summary,
      siteName: site.name,
      images: og ? [{ url: og.src, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title: site.metaTitle,
      description: site.summary,
      images: og ? [og.src] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  colorScheme: "dark",
};

/**
 * Skips the splash only for reduced motion or the portvio profile (§2.4). `js` is also part of the
 * React-owned className below: if React ever re-renders <html> (it clears every attribute it does
 * not own), the splash and the intro gate must keep working. No-JS visitors get the noscript styles.
 */
const headScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(${
  MOTION_PROFILE === "portvio" ? "true" : "false"
}||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('no-preloader')}catch(e){d.classList.add('no-preloader')}})();`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.roleLong,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.countryCode },
  sameAs: [site.socials.linkedin.href, site.socials.github.href],
  alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const media = getMediaMap();
  return (
    <html lang="en" className={`${clash.variable} ${inter.variable} js`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <noscript
          dangerouslySetInnerHTML={{ __html: "<style>.preloader{display:none!important}[data-intro]{opacity:1!important}</style>" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="type-ui pointer-events-none fixed left-4 top-4 z-[90] -translate-y-[200%] rounded-pill bg-accent px-5 py-2 text-accent-ink opacity-0 focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          Skip to content
        </a>
        <Providers media={media}>
          <SmoothScroll>
            <PageTransitionProvider>
              <Nav />
              <CompactNav />
              <Menu />
              <main id="main" tabIndex={-1} className="relative flex flex-col overflow-clip outline-none">
                {children}
              </main>
              <Footer />
            </PageTransitionProvider>
          </SmoothScroll>
          <ScrollProgress />
          <Cursor />
          <Preloader />
        </Providers>
      </body>
    </html>
  );
}
