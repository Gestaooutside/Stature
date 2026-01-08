"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { SpinningText } from "./ui/spinning-text"
import { useCartStore } from "@/lib/stores/cart-store"
import { getProductCompositionDescription } from "@/lib/config/products"

// Define tipos para os cards de produtos da seção featured
interface ProductCardProps {
  product: {
    id: string
    name: string
    price: string
    image: string
    isVideo?: boolean // Indica se a mídia é um vídeo
    badge?: "Novo" | "Back in stock" | "Limitado"
    materials: string[]
    swatches: { name: string; color: string }[]
    quickLookImages: string[]
    dimensions: string
  }
  onQuickLook: (product: any) => void
  onAddToCart?: () => void // Callback para abrir modal de pagamento
}

export function ProductCard({ product, onQuickLook, onAddToCart }: ProductCardProps) {
  const { addItem } = useCartStore()
  const compositionDescription = getProductCompositionDescription(product.id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Adiciona produto ao carrinho e abre modal de pagamento
  const handleCardClick = () => {
    if (onAddToCart) {
      // Converte preço de "R$ 149,99" para número 149.99
      const priceNumber = parseFloat(product.price.replace('R$ ', '').replace(',', '.'))

      // Adiciona produto ao carrinho com quantidade 1
      addItem(
        {
          id: product.id,
          name: product.name,
          price: priceNumber,
          image: product.image,
        },
        1
      )

      // Abre modal de pagamento
      onAddToCart()
    }
  }

  // Controla reprodução do vídeo no hover (desktop)
  const handleMouseEnter = () => {
    if (product.isVideo && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleMouseLeave = () => {
    if (product.isVideo && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Intersection Observer para autoplay no mobile
  useEffect(() => {
    if (!product.isVideo || !videoRef.current || !containerRef.current) return

    const video = videoRef.current
    const container = containerRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Reproduz quando 50% ou mais do vídeo está visível
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play()
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
        })
      },
      {
        threshold: [0.5], // Detecta quando 50% está visível
        rootMargin: "0px",
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [product.isVideo])

  return (
    <motion.div
      className="group relative bg-white overflow-hidden cursor-pointer"
      style={{
        borderRadius: "24px",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
      }}
      layout
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Badge */}
      {product.badge && (
        <div className={cn(
          "absolute z-20",
          product.badge === "Limitado" ? "top-0 right-0 translate-x-[25%] -translate-y-[25%]" : "top-4 left-4"
        )}>
          {product.badge === "Limitado" ? (
            <div className="w-42 h-42 flex items-center justify-center relative">
              {/* Círculo marrom de fundo - stamp effect */}
              <div className="absolute inset-0 bg-[#8d7f72] rounded-full border-4 border-white shadow-xl" />
              {/* Texto girante */}
              <SpinningText
                radius={6}
                fontSize={0.65}
                duration={10}
                className="relative z-10 font-bold text-white"
              >
                {`• MELHOR VALOR • MELHOR VALOR • `}
              </SpinningText>
            </div>
          ) : (
            <span
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm",
                product.badge === "Novo" && "bg-green-500/90 text-white",
                product.badge === "Back in stock" && "bg-blue-500/90 text-white",
              )}
            >
              {product.badge}
            </span>
          )}
        </div>
      )}

      {/* Product Image/Video */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ aspectRatio: "25/42" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full">
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {product.isVideo ? (
              <>
                {/* Vídeo do produto */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={product.image} type="video/mp4" />
                </video>

                {/* Ícone de play glassmórfico */}
                {!isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Product Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Overlay bege escuro para melhor contraste do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#8d7f72]/90 via-[#8d7f72]/50 to-transparent" />
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-lg"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
          }}
        />
        <div className="relative z-20">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">{product.name}</h3>
            <p className="text-sm font-semibold text-white mb-2 drop-shadow-lg">{product.materials.join(", ")}</p>
            <span className="text-xl font-bold text-white drop-shadow-lg">{product.price}</span>
            {compositionDescription && (
              <p className="text-xs text-white/90 mt-1 drop-shadow-lg">
                Inclui {compositionDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
