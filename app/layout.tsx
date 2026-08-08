import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getPublicSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/hooks/use-cart";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { PageTransition } from "@/components/motion/PageTransition";
import { IntroLoader } from "@/components/motion/IntroLoader";
import { safeJsonLd } from "@/lib/seo";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicSettings(); const title = settings.seo.siteTitle || settings.general.websiteTitle; const description = settings.seo.metaDescription || settings.general.websiteDescription; const canonical = settings.seo.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; return { metadataBase: new URL(canonical), title: { default: title, template: `%s — ${settings.general.companyName}` }, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website", images: settings.seo.ogImage ? [settings.seo.ogImage] : undefined }, twitter: { card: "summary_large_image", title, description, images: settings.seo.twitterImage ? [settings.seo.twitterImage] : undefined } }; }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, currentUser] = await Promise.all([getPublicSettings(), getCurrentUser()]);
  const themeStyle = { "--joyguru-primary": settings.brand.primary, "--joyguru-secondary": settings.brand.secondary, "--joyguru-background": settings.brand.background, "--joyguru-card": settings.brand.card, "--joyguru-heading": settings.brand.heading, "--joyguru-text": settings.brand.text, "--joyguru-border": settings.brand.border, "--joyguru-hover": settings.brand.hover, "--joyguru-footer": settings.brand.footer } as CSSProperties;
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /></head><body style={themeStyle}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "Organization", name: settings.general.companyName, url: settings.seo.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", logo: settings.general.logoUrl || `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/images/brand/joyguru-logo.png`, email: `mailto:${settings.general.businessEmail}`, telephone: settings.general.phone, address: { "@type": "PostalAddress", streetAddress: settings.general.address, addressCountry: "IN" } }) }} /><ThemeProvider><ServiceWorkerRegister /><IntroLoader /><SmoothScroll /><ScrollProgress /><CursorGlow /><CartProvider><Header user={currentUser ? { name: currentUser.name, email: currentUser.email } : null} /><PageTransition>{children}</PageTransition><Footer /></CartProvider></ThemeProvider></body></html>;
}
