import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { company, integrations } = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${company.name} | ${company.tagline}`, template: `%s | ${company.name}` },
    description: company.description,
    applicationName: company.name,
    openGraph: { type: "website", siteName: company.name, locale: "en" },
    twitter: { card: "summary_large_image" },
    verification: {
      google: integrations.google_site_verification || undefined,
      other: integrations.bing_site_verification ? { "msvalidate.01": integrations.bing_site_verification } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Suspense fallback={null}>
          <AnalyticsWithSettings />
        </Suspense>
      </body>
    </html>
  );
}

async function AnalyticsWithSettings() {
  const { integrations } = await getSettings();
  return <Analytics gaId={integrations.ga_measurement_id} />;
}
