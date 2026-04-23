"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, X } from "lucide-react"
import { Reveal } from "./reveal"
import { galleryItems, type GalleryItem } from "@/data/gallery"
import { COPY } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

const ASPECT_CLASS: Record<GalleryItem["aspect"], string> = {
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "9/16": "aspect-[9/16]",
}

function GalleryCard({
  item,
  onOpen,
  index,
}: Readonly<{ item: GalleryItem; onOpen: (item: GalleryItem) => void; index: number }>) {
  const isPending = item.pending === true
  const aspectClass = ASPECT_CLASS[item.aspect]

  return (
    <motion.button
      type="button"
      onClick={() => !isPending && onOpen(item)}
      className={`group relative w-full overflow-hidden border border-[#3A5243]/20 text-left ${aspectClass}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.72, delay: index * 0.07, ease: EASE }}
      aria-label={item.caption}
      disabled={isPending}
    >
      {isPending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#EDE4D0]/40">
          <ImageIcon className="w-8 h-8 text-[#3A5243]/40" strokeWidth={1} />
          <span className="font-mono-label text-[#3A5243]/60 uppercase">Mídia pendente</span>
          <span className="text-xs text-[#3A5243]/50 font-light px-4 text-center max-w-[22ch]">
            {item.caption}
          </span>
        </div>
      ) : item.kind === "video" ? (
        <>
          <video
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
            src={item.src}
            poster={item.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={item.alt}
          />
          <span
            aria-hidden
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-2.5 py-1 bg-[#081A12]/55 backdrop-blur-[2px] border border-[#D9C89E]/30"
          >
            <span className="relative flex items-center justify-center w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-[#D9C89E] animate-ping opacity-70" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#D9C89E]" />
            </span>
            <span className="font-mono-label text-[10px] text-[#D9C89E] uppercase tracking-[0.12em]">
              Vídeo
            </span>
          </span>
        </>
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}

      {!isPending && (
        <>
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,42,29,0) 50%, rgba(15,42,29,0.85) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[720ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
            <span className="font-mono-label text-[#D9C89E] block uppercase">{item.caption}</span>
          </div>
        </>
      )}
    </motion.button>
  )
}

function buildColumns(items: readonly GalleryItem[], cols: number): GalleryItem[][] {
  const columns: GalleryItem[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => {
    columns[i % cols].push(item)
  })
  return columns
}

export function PatientGallery() {
  const [active, setActive] = useState<GalleryItem | null>(null)

  const columnsDesktop = buildColumns(galleryItems, 3)
  const columnsTablet = buildColumns(galleryItems, 2)

  return (
    <section
      id="galeria"
      className="relative py-32 md:py-40"
      style={{ background: "#F5EFE4" }}
    >
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom max-w-6xl">
        <Reveal>
          <div className="mb-20 md:mb-24 max-w-2xl">
            <div className="flex items-center gap-5 mb-10">
              <span className="eyebrow text-[#3A5243]">{COPY.gallery.badge}</span>
              <span className="font-display italic text-[#D9C89E]/80 text-sm">Cap. 06</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-[-0.02em] text-[#0F2A1D] leading-[1.02]">
              {COPY.gallery.title} <span className="italic">{COPY.gallery.titleItalic}</span>
            </h2>
            <span className="hairline-gold w-24 block mb-10" />
            <p className="text-base md:text-lg text-[#0F2A1D]/75 leading-[1.85] font-light">
              {COPY.gallery.description}
            </p>
          </div>
        </Reveal>

        {/* Mobile: single-column stack */}
        <div className="flex flex-col gap-4 md:hidden">
          {galleryItems.map((item, i) => (
            <GalleryCard key={item.id} item={item} onOpen={setActive} index={i} />
          ))}
        </div>

        {/* Tablet: 2-col masonry */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
          {columnsTablet.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-4">
              {col.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={setActive}
                  index={galleryItems.indexOf(item)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Desktop: 3-col masonry with mixed aspects */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          {columnsDesktop.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-5">
              {col.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={setActive}
                  index={galleryItems.indexOf(item)}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="text-xs md:text-sm text-[#3A5243]/60 font-light italic text-center mt-12 max-w-2xl mx-auto leading-relaxed">
          Identidades preservadas. Imagens e vídeos publicados com autorização expressa dos pacientes.
        </p>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#081A12]/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.caption}
          >
            <button
              type="button"
              className="absolute top-6 right-6 md:top-10 md:right-10 w-11 h-11 border border-[#D9C89E]/40 text-[#D9C89E] flex items-center justify-center hover:bg-[#D9C89E] hover:text-[#0F2A1D] transition-all duration-[240ms] ease-luxe"
              aria-label="Fechar"
              onClick={() => setActive(null)}
            >
              <X className="w-4 h-4" strokeWidth={1.25} />
            </button>

            <motion.div
              className={`relative max-w-4xl w-full max-h-[85vh] ${ASPECT_CLASS[active.aspect]}`}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {active.kind === "video" ? (
                <video
                  className="w-full h-full object-contain"
                  src={active.src}
                  poster={active.poster}
                  controls
                  autoPlay
                  aria-label={active.alt}
                />
              ) : (
                <Image src={active.src} alt={active.alt} fill className="object-contain" sizes="100vw" />
              )}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-[#081A12]/70">
                <span className="font-mono-label text-[#D9C89E] uppercase">{active.caption}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
