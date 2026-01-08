"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "./product-card"
import { QuickLookModal } from "./quick-look-modal"
import { Reveal } from "./reveal"
import { PRODUCT_PRICES } from "@/lib/config/products"

// Dados visuais dos produtos (imagens, badges, swatches) combinados com preços dinâmicos
const featuredProducts = [
  {
    id: "duo-dia",
    name: "DUO DIA",
    price: `R$ ${PRODUCT_PRICES.DUO_DIA.toFixed(2).replace('.', ',')}`,
    image: "/duo-dia-video-1.mp4",
    isVideo: true,
    badge: "Novo" as const,
    materials: ["100% Natural", "Sem Contraindicações"],
    swatches: [
      { name: "Verde Natural", color: "#355E3B" },
      { name: "Bege Calmante", color: "#9CAF88" },
      { name: "Dourado Premium", color: "#B87333" },
    ],
    quickLookImages: [
      "/duo-dia-2.jpg",
    ],
    dimensions: "60 cápsulas × Fórmula Dia",
  },
  {
    id: "duo-noite",
    name: "DUO NOITE",
    price: `R$ ${PRODUCT_PRICES.DUO_NOITE.toFixed(2).replace('.', ',')}`,
    image: "/duo-noite-video-1.mp4",
    isVideo: true,
    badge: "Novo" as const,
    materials: ["100% Natural", "Sem Contraindicações"],
    swatches: [
      { name: "Azul Noturno", color: "#1a365d" },
      { name: "Roxo Profundo", color: "#553c9a" },
      { name: "Dourado Premium", color: "#B87333" },
    ],
    quickLookImages: [
      "/duo-noite-2.jpg",
    ],
    dimensions: "30ml × Fórmula Noite",
  },
  {
    id: "duo-completo",
    name: "Kit DUO Completo",
    price: `R$ ${PRODUCT_PRICES.DUO_COMPLETO.toFixed(2).replace('.', ',')}`,
    image: "/duo-dia-noite-2.jpg",
    badge: "Limitado" as const,
    materials: ["Dia + Noite", "Resultado em 15 dias"],
    swatches: [
      { name: "Verde Natural", color: "#9CAF88" },
      { name: "Azul Noturno", color: "#1a365d" },
      { name: "Dourado Premium", color: "#B87333" },
    ],
    quickLookImages: [
      "/duo-dia-noite-2.jpg",
    ],
    dimensions: "Kit Completo × 30 dias",
  },
]

// Define props do componente
interface FeaturedProductsProps {
  onOpenPaymentModal?: () => void // Callback para abrir modal de pagamento
}

export function FeaturedProducts({ onOpenPaymentModal }: FeaturedProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleQuickLook = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Product Schemas para SEO
  const productSchemas = featuredProducts.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `${product.name} - ${product.materials.join(', ')}. ${product.dimensions}`,
    image: `https://duonatural.com.br${product.image}`,
    brand: {
      '@type': 'Brand',
      name: 'DUO NATURAL',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://duonatural.com.br/#featured-products',
      priceCurrency: 'BRL',
      price: product.price.replace('R$ ', '').replace(',', '.'),
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '10000',
      bestRating: '5',
      worstRating: '1',
    },
  }))

  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-32 2xl:py-40" id="featured-products">
      <div className="container-custom">
        <Reveal>
          <div className="text-left mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-neutral-900 mb-3 md:mb-4">
              Nossas <span className="italic font-light">Soluções</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl">
              Descubra o sistema completo DUO NATURAL: fórmulas naturais que atuam 24h para controlar ansiedade, compulsão alimentar e restaurar seu sono.
            </p>
          </div>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
        >
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  },
                },
              }}
            >
              <Reveal delay={index * 0.1}>
                <ProductCard
                  product={product}
                  onQuickLook={handleQuickLook}
                  onAddToCart={onOpenPaymentModal}
                />
              </Reveal>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />

      {/* Product Schema Markup para SEO */}
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </section>
  )
}
