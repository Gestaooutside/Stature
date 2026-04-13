"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrustBar } from "@/components/trust-bar"
import { AboutDoctor } from "@/components/about-doctor"
import { FeaturedProducts } from "@/components/featured-products"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { patientTestimonials } from "@/data/testimonials"
import { IngredientsSection } from "@/components/ingredients-section"
import { FAQSection } from "@/components/faq-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/ui/footer"
import { WhatsAppFab } from "@/components/whatsapp-fab"
import { COPY } from "@/lib/config/brand"

/**
 * Landing page única do Dr. David de Mello.
 * Fluxo: hero → confiança → médico → procedimentos → depoimentos
 *        → técnica → FAQ → contato → footer + WhatsApp fab
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />

      <HeroSection />
      <TrustBar />
      <AboutDoctor />
      <FeaturedProducts />

      <section id="resultados">
        <TestimonialsSection
          title={COPY.testimonials.title}
          description={COPY.testimonials.description}
          testimonials={patientTestimonials}
        />
      </section>

      <IngredientsSection />
      <FAQSection />
      <NewsletterSection />

      <Footer />

      <WhatsAppFab />
    </main>
  )
}
