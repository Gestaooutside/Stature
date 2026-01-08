"use client"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrustBar } from "@/components/trust-bar"
import { SolutionIntro } from "@/components/solution-intro"
import { ProblemSolution } from "@/components/problem-solution"
import { FeaturedProducts } from "@/components/featured-products"
import { HowItWorks } from "@/components/how-it-works"
import { CollectionStrip } from "@/components/collection-strip"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { duoTestimonials } from "@/data/testimonials"
import { IngredientsSection } from "@/components/ingredients-section"
import { MaterialsSection } from "@/components/materials-section"
import { AnvisaAuthorization } from "@/components/ui/anvisa-authorization"
import { ComparisonSection } from "@/components/comparison-section"
import { GuaranteeSection } from "@/components/guarantee-section"
import { FAQSection } from "@/components/faq-section"
import { PremiumFAQSection } from "@/components/premium-faq-section"
import { FinalCTA } from "@/components/final-cta"
import { AccreditedPharmacies } from "@/components/accredited-pharmacies"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/ui/footer"
import { SideNav } from "@/components/side-nav"
import { useCartStore } from "@/lib/stores/cart-store"
export default function HomePage() {
  const { openCart } = useCartStore()

  return (
    <main className="min-h-screen">
      <Header />
      <SideNav />
      <HeroSection onOpenPaymentModal={openCart} />
      <TrustBar />
      <ProblemSolution />
      <SolutionIntro onOpenPaymentModal={openCart} />
      <FeaturedProducts onOpenPaymentModal={openCart} />
      <HowItWorks />
      <CollectionStrip />
      <TestimonialsSection
        title="Quem experimentou, não volta atrás"
        description="Histórias reais de pessoas que recuperaram o controle sobre ansiedade, compulsão e sono"
        testimonials={duoTestimonials}
        className="bg-gradient-to-br from-[#dad7ce]/20 via-white to-[#dad7ce]/10"
      />
      <IngredientsSection />
      <MaterialsSection />
      <AnvisaAuthorization />
      <ComparisonSection onOpenPaymentModal={openCart} />
      <GuaranteeSection onOpenPaymentModal={openCart} />
      <FinalCTA onOpenPaymentModal={openCart} />
      <PremiumFAQSection onOpenPaymentModal={openCart} />
      <AccreditedPharmacies />
      <NewsletterSection />
      <Footer />

      {/* Modal de Pagamento Controlado Globalmente */}
    </main>
  )
}
