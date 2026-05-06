import type React from "react"
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter_Tight, IBM_Plex_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { NavigationTracker } from "@/components/navigation-tracker"
import {
  BRAND,
  URLS,
  COLORS,
  IMAGES,
  SEO,
  SOCIAL,
  CONTACT,
  PROFESSIONAL,
  LOCATION,
  CITIES,
} from "@/lib/config/brand"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter-tight",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
})

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: [...SEO.keywords],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  alternates: {
    canonical: `${URLS.domain}/`,
  },
  openGraph: {
    siteName: BRAND.name,
    title: SEO.ogTitle,
    description: SEO.ogDescription,
    type: "website",
    url: `${URLS.domain}/`,
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.ogTitle,
    description: SEO.twitterDescription,
    site: URLS.twitterHandle,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: COLORS.primary },
    { media: "(prefers-color-scheme: dark)", color: COLORS.primary },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const physicianSchema = {
    "@context": "https://schema.org",
    "@type": ["Physician", "MedicalBusiness"],
    name: BRAND.name,
    url: URLS.domain,
    image: `${URLS.domain}/logo-stature.svg`,
    description: BRAND.fullDescription,
    medicalSpecialty: "Orthopedic",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: LOCATION.address,
      addressLocality: LOCATION.city,
      addressRegion: LOCATION.state,
      addressCountry: LOCATION.country,
      postalCode: LOCATION.zipCode,
    },
    areaServed: CITIES.map((c) => ({
      "@type": "City",
      name: c.name,
      addressRegion: c.state,
      addressCountry: "BR",
    })),
    hospitalAffiliation: {
      "@type": "Hospital",
      name: LOCATION.hospital,
    },
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    sameAs: SOCIAL.schemaUrls,
    availableService: [
      {
        "@type": "MedicalProcedure",
        name: "Alongamento Ósseo com Fitbone",
        description:
          "Alongamento ósseo e aumento de estatura com Fitbone, haste intramedular motorizada aprovada pela Anvisa, controlada por controle remoto. Alongamento médio de 8 cm no fêmur e 6 cm na tíbia.",
      },
      {
        "@type": "MedicalProcedure",
        name: "Alongamento Ósseo com Método LON",
        description:
          "Alongamento de fêmur ou tíbia com fixador externo linear monolateral combinado a haste intramedular.",
      },
      {
        "@type": "MedicalProcedure",
        name: "Correção de Discrepância dos Membros Inferiores",
        description:
          "Tratamento cirúrgico de dismetria dos membros inferiores com planejamento individualizado.",
      },
    ],
    award: [
      "Pioneiro no Brasil em alongamento ósseo estético",
      "Referência na América Latina em alongamento ósseo",
    ],
    memberOf: {
      "@type": "MedicalOrganization",
      name: PROFESSIONAL.crm,
    },
  }

  return (
    <html lang={BRAND.lang} className={`${cormorant.variable} ${interTight.variable} ${plexMono.variable} antialiased`}>
      <head>
        <link rel="preload" href={IMAGES.hero.desktop} as="image" type="image/jpeg" />
      </head>
      <body className="font-sans overflow-x-hidden" style={{ background: "#F5EFE4", color: "#0F2A1D" }}>
        <NavigationTracker />
        {children}

        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="clarity-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}

        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){
                  if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianSchema) }}
        />
      </body>
    </html>
  )
}
