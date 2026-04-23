"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CredentialsStrip } from "@/components/credentials-strip"
import { AboutDoctor } from "@/components/about-doctor"
import { TechniquesSection } from "@/components/techniques-section"
import { FeaturedProducts } from "@/components/featured-products"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { patientTestimonials } from "@/data/testimonials"
import { IngredientsSection } from "@/components/ingredients-section"
import { RehabSection } from "@/components/rehab-section"
import { PatientGallery } from "@/components/patient-gallery"
import { CitiesStrip } from "@/components/cities-strip"
import { FAQSection } from "@/components/faq-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/ui/footer"
import { WhatsAppFab } from "@/components/whatsapp-fab"
import { COPY } from "@/lib/config/brand"

/**
 * Landing page única da Stature Clinic.
 * Fluxo: hero → confiança → credenciais → médico → técnicas cirúrgicas
 *        → procedimentos → depoimentos → diferenciais → recuperação
 *        → galeria → cidades → FAQ → contato → footer + WhatsApp fab
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />

      <HeroSection />
      <CredentialsStrip />
      <AboutDoctor />
      <TechniquesSection />
      <FeaturedProducts />

      <section id="resultados">
        <TestimonialsSection
          title={COPY.testimonials.title}
          description={COPY.testimonials.description}
          testimonials={patientTestimonials}
        />
      </section>

      <IngredientsSection />
      <RehabSection />
      <PatientGallery />
      <CitiesStrip />
      <FAQSection />
      <NewsletterSection />

      <Footer />

      <WhatsAppFab />
    </main>
  )
}
