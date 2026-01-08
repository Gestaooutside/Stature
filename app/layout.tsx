import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import DuoChat from "@/components/chat"
import { ElevenLabsWidget } from "@/components/elevenlabs-widget" // TODO: Re-ligar widget ElevenLabs no futuro
import { PaymentModalRoot } from "@/components/payment-modal/payment-modal-root"
import { NavigationTracker } from "@/components/navigation-tracker"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
  fallback: ['system-ui', 'arial', 'sans-serif'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: "DUO NATURAL — Controle da Ansiedade e Compulsão Alimentar",
  description: "Controle ansiedade, compulsão alimentar e sono profundo com DUO NATURAL. Sistema 360º 100% natural. 97% de aprovação. Resultados em 24 horas. Garantia de 30 dias.",
  keywords: [
    'ansiedade',
    'compulsão alimentar',
    'sono profundo',
    'suplemento natural',
    'controle ansiedade',
    'melatonina natural',
    'triptofano',
    'passiflora',
    'tratamento natural ansiedade',
    'suplemento sono',
    'compulsão noturna',
    'DUO NATURAL',
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
  },
  alternates: {
    canonical: "https://duonatural.com.br/",
  },
  openGraph: {
    siteName: "DUO NATURAL",
    title: "Controle da Ansiedade e Compulsão Alimentar | DUO NATURAL",
    description: "Sistema 360º com fórmulas naturais para controle de ansiedade, compulsão alimentar e sono profundo. 100% natural, sem dependência.",
    type: "website",
    url: "https://duonatural.com.br/",
    images: [
      {
        url: "https://duonatural.com.br/duo-dia-ambiente.png",
        alt: "DUO NATURAL - Fórmula Dia e Noite para controle de ansiedade e compulsão alimentar",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Controle da Ansiedade e Compulsão Alimentar | DUO NATURAL",
    description: "Sistema 360º com fórmulas naturais. 97% de aprovação, resultados em 15 dias. 100% natural, sem dependência.",
    images: [
      {
        url: "https://duonatural.com.br/duo-dia-ambiente.png",
        alt: "DUO NATURAL - Sistema completo para controle de ansiedade e sono profundo",
      },
    ],
    site: "@duonatural",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a89a8d' },
    { media: '(prefers-color-scheme: dark)', color: '#a89a8d' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Schema JSON-LD para SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DUO NATURAL',
    url: 'https://duonatural.com.br',
    logo: 'https://duonatural.com.br/duo-logo-light.svg',
    description: 'Sistema natural para controle de ansiedade, compulsão alimentar e sono profundo',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'Portuguese',
    },
    sameAs: [
      'https://instagram.com/duonatural',
      'https://facebook.com/duonatural',
    ],
  }

  return (
    <html lang="pt-BR" className={`${montserrat.variable} antialiased`}>
      <head>
        <link rel="preload" href="/hero-section.jpg" as="image" type="image/jpeg" />
        <link rel="preload" href="/duo-logo-light.svg" as="image" type="image/svg+xml" />
      </head>
      <body className="font-sans bg-neutral-50 text-neutral-900 overflow-x-hidden">
        <NavigationTracker />
        {children}

        {/* Modal global de pagamento (habilita abertura em qualquer página pública) */}
        <PaymentModalRoot />

        {/* Chat DUO Flutuante */}
        <DuoChat />

        {/* Widget de voz ElevenLabs flutuante - DESATIVADO TEMPORARIAMENTE */}
        {/* <ElevenLabsWidget /> */}

        {/* Microsoft Clarity - Analytics e Rastreamento de Comportamento */}
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

        {/* Facebook Pixel - Rastreamento de Conversões e Remarketing */}
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

        {/* Schema JSON-LD para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  )
}
