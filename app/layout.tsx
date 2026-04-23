import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"]
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"]
});

const siteUrl = "https://ghost-job-detector.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ghost Job Detector | Identify Fake Job Postings Before Applying",
  description:
    "Ghost Job Detector scores job legitimacy using posting language signals and company hiring history so you avoid dead-end applications.",
  keywords: [
    "ghost jobs",
    "fake job postings",
    "job search tools",
    "career coach software",
    "job legitimacy checker"
  ],
  openGraph: {
    title: "Ghost Job Detector",
    description:
      "Identify fake or stale job postings before you spend hours applying.",
    url: siteUrl,
    siteName: "Ghost Job Detector",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost Job Detector",
    description: "Spot fake job postings with signal-based risk scoring."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${heading.variable} ${mono.variable} bg-[#0d1117] font-[var(--font-heading)] text-[#e6edf3] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
