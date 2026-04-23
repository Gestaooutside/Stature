"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"
import { CITIES, COPY } from "@/lib/config/brand"

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

/**
 * Mini-mapa do Brasil + pinos das 5 capitais.
 * Contorno derivado da projeção simplificada do território brasileiro:
 * bounding box long [-73.9, -34.8] × lat [5.2, -33.75] → viewBox 440×480.
 * As coordenadas em CITIES.pin são lat/long reais normalizadas (0–1)
 * sobre a mesma bounding box, então caem sobre as cidades corretas.
 */
function BrazilMiniMap() {
  const width = 440
  const height = 480
  // Contorno do Brasil (sentido horário, a partir da fronteira norte com Venezuela).
  // Marcas preservadas: Monte Roraima (N), Oiapoque/Amapá (NE), saliência de
  // Natal/RN, ponto mais oriental (E), afunilamento do Chuí/RS (S extremo),
  // "pé" do Acre (W extremo), fronteira com Colômbia/Peru (NW).
  const brazilPath =
    "M 95 15 Q 125 8 155 5 Q 200 8 225 18 L 258 28 Q 275 55 280 85 Q 298 92 320 95 Q 350 100 380 110 Q 400 115 412 125 Q 430 135 436 148 Q 440 160 440 175 Q 438 188 430 200 Q 420 215 410 228 Q 403 248 398 268 Q 392 290 383 310 Q 372 325 355 340 Q 338 352 320 360 Q 305 370 290 380 Q 283 392 280 405 Q 270 420 258 432 Q 248 455 230 478 Q 215 460 200 445 Q 188 432 175 420 Q 168 400 165 380 Q 167 360 170 340 Q 172 315 175 290 Q 172 270 170 250 Q 165 235 155 220 Q 110 200 70 185 Q 35 195 10 200 Q 18 180 30 165 Q 50 148 70 130 Q 82 100 90 70 Q 90 40 95 15 Z"

  return (
    <div className="relative w-full max-w-[440px] aspect-[11/12]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="brazil-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A5243" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#0F2A1D" stopOpacity="0.62" />
          </linearGradient>
          <radialGradient id="pin-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D9C89E" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D9C89E" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d={brazilPath}
          fill="url(#brazil-fill)"
          stroke="#0F2A1D"
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {CITIES.map((city, i) => {
          const cx = city.pin.x * width
          const cy = city.pin.y * height
          return (
            <g key={city.id}>
              <motion.circle
                cx={cx}
                cy={cy}
                r={22}
                fill="url(#pin-halo)"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: [1, 1.25, 1], opacity: [0.9, 0.35, 0.9] }}
                viewport={{ once: false }}
                transition={{
                  duration: 2.4,
                  delay: 0.4 + i * 0.12,
                  ease: EASE,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
              <motion.circle
                cx={cx}
                cy={cy}
                r={13}
                fill="none"
                stroke="#D9C89E"
                strokeOpacity="0.75"
                strokeWidth="1.25"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: EASE }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
              <motion.circle
                cx={cx}
                cy={cy}
                r={7}
                fill="#D9C89E"
                stroke="#0F2A1D"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: EASE }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function CitiesStrip() {
  return (
    <section
      aria-label="Cidades onde a cirurgia está disponível"
      className="relative py-24 md:py-32"
      style={{ background: "#F5EFE4" }}
    >
      <span className="hairline-gold absolute top-0 left-0 right-0" />

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Map */}
          <Reveal className="lg:col-span-5 flex justify-center lg:justify-start">
            <BrazilMiniMap />
          </Reveal>

          {/* Copy + list */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-center gap-5 mb-8">
                <span className="eyebrow text-[#3A5243]">Cobertura</span>
                <span className="h-px flex-1 bg-[#3A5243]/20" />
              </div>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-[#0F2A1D] tracking-[-0.01em] leading-[1.05]">
                {COPY.cities.title}{" "}
                <span className="italic text-[#3A5243]">{COPY.cities.titleItalic}</span>
              </h2>

              <span className="hairline-gold w-16 block mb-8" />

              <p className="text-base md:text-lg text-[#0F2A1D]/75 leading-[1.85] font-light max-w-[56ch] mb-10">
                {COPY.cities.description}
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-[#3A5243]/15 pt-8">
              {CITIES.map((city, i) => (
                <motion.div
                  key={city.id}
                  className="flex items-baseline gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                >
                  <span className="font-display italic text-[#D9C89E] text-sm w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-display text-lg md:text-xl font-light text-[#0F2A1D] leading-tight">
                      {city.name}
                    </div>
                    <div className="eyebrow text-[#3A5243]/65 mt-1">{city.state}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 inline-flex items-center gap-4 px-5 py-3 border border-[#3A5243]/25 bg-[#F5EFE4]">
              <span className="w-2 h-2 rounded-full bg-[#D9C89E] animate-pulse" />
              <span className="eyebrow text-[#3A5243]">
                Consulta 100% online · Qualquer cidade do Brasil
              </span>
            </div>
          </div>
        </div>
      </div>

      <span className="hairline-gold absolute bottom-0 left-0 right-0" />
    </section>
  )
}
