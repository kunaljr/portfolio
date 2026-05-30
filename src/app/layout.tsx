import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ProgressBar } from "@/components/ProgressBar";
import { BackToTop } from "@/components/BackToTop";
import { CursorGlow } from "@/components/CursorGlow";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const SITE_URL = "https://kunalshelke.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kunal Shelke — Senior Full Stack Engineer · React & Node.js",
  description:
    "Full Stack Engineer at Eccentric Engine — built AI tools for automotive (EchoAI), IoT fintech platforms, and OTT streaming products with React, NestJS, and GCP.",
  keywords: [
    "Full Stack Engineer",
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "React Developer",
    "Node.js",
    "NestJS",
    "TypeScript",
    "SaaS",
    "GCP",
    "AWS",
    "Kunal Shelke",
    "Mumbai",
    "Pune",
    "Bangalore",
  ],
  authors: [{ name: "Kunal Shelke", url: SITE_URL }],
  creator: "Kunal Shelke",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kunal Shelke",
    title: "Kunal Shelke — Senior Full Stack Engineer · React & Node.js",
    description:
      "Full Stack Engineer at Eccentric Engine — built AI tools for automotive (EchoAI), IoT fintech platforms, and OTT streaming products with React, NestJS, and GCP.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kunal Shelke — Senior Full Stack Engineer · React & Node.js",
    description:
      "Full Stack Engineer at Eccentric Engine — built AI tools for automotive (EchoAI), IoT fintech platforms, and OTT streaming products with React, NestJS, and GCP.",
    creator: "@kunalshelke",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "0d30a9e0946dcfa3",
  },
};

// Hardcoded static object — no user input, no XSS risk.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kunal Shelke",
  jobTitle: "Senior Full Stack Engineer",
  url: SITE_URL,
  image: `${SITE_URL}/profesional-picture.JPEG`,
  worksFor: {
    "@type": "Organization",
    name: "Eccentric Engine",
  },
  knowsAbout: [
    "React",
    "Node.js",
    "TypeScript",
    "NestJS",
    "REST",
    "GraphQL",
    "GCP",
    "AWS",
    "SaaS",
    "Generative AI",
  ],
  sameAs: [
    "https://www.linkedin.com/in/kunal-shelke-47a5841a2/",
    "https://github.com/kunaljr",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before paint to apply saved theme — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));})();` }} />
        {/* JSON-LD structured data — static hardcoded content, no XSS risk */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <ProgressBar />
        <CursorGlow />
        {children}
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
