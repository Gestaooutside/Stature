"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pill,
  Droplet,
  Leaf,
  Brain,
  Moon,
  Zap,
  Sun,
  Flower2,
  TreeDeciduous,
  Salad,
  Heart,
  Wheat,
  Beaker,
  Sprout,
  CheckCircle2,
  Microscope,
  TestTube,
  Battery,
  Clover,
  Flame
} from "lucide-react"
import { Reveal } from "./reveal"
import { cn } from "@/lib/utils"

const ingredientsDia = [
  { name: "Vitamina D", icon: Sun, benefit: "Regula humor e produção de serotonina" },
  { name: "Triptofano", icon: Brain, benefit: "Precursor da serotonina, reduz ansiedade" },
  { name: "L-Fenilalanina", icon: Zap, benefit: "Estimula dopamina, aumenta energia mental" },
  { name: "Passiflora", icon: Leaf, benefit: "Ação calmante natural, reduz estresse" },
  { name: "Eritrina", icon: Flower2, benefit: "Propriedades ansiolíticas, diminui irritabilidade" },
  { name: "L-Teanina", icon: TreeDeciduous, benefit: "Relaxamento e foco, reduz cortisol" },
  { name: "LipoArtich II", icon: Salad, benefit: "Auxilia digestão e saciedade" },
  { name: "Magnésio Taurato", icon: Heart, benefit: "Relaxamento muscular e mental" },
  { name: "Valeriana", icon: Wheat, benefit: "Calmante natural, melhora sono" },
  { name: "Picolinato de Cromo", icon: Beaker, benefit: "Regula glicemia, reduz compulsão por doces" },
  { name: "Cápsulas naturais", icon: Sprout, benefit: "100% vegetais, livres de gelatina animal" },
  { name: "Excipientes naturais", icon: CheckCircle2, benefit: "Sem corantes, conservantes ou aditivos químicos" },
]

const ingredientsNoite = [
  { name: "Vitamina B12", icon: Zap, benefit: "Essencial para sistema nervoso" },
  { name: "Vitamina B6", icon: Pill, benefit: "Produção de serotonina e melatonina" },
  { name: "Vitamina B9", icon: Microscope, benefit: "Apoia sistema nervoso e equilíbrio mental" },
  { name: "Magnésio L-Treonato", icon: TestTube, benefit: "Biodisponível para cérebro, melhora sono" },
  { name: "Melatonina", icon: Moon, benefit: "Hormônio natural do sono, regula ciclo circadiano" },
  { name: "Piridoxal-5-Fosfato", icon: Battery, benefit: "Forma ativa da B6, potencializa efeitos" },
  { name: "Melissa", icon: Clover, benefit: "Calmante natural, sono profundo" },
  { name: "Pepper Pro R", icon: Flame, benefit: "Melhora absorção de nutrientes" },
  { name: "Sorbitol", icon: Droplet, benefit: "Melhora textura e absorção" },
]

const ingredientsEnergy = [
  { name: "NADH 10", icon: Zap, benefit: "Energia celular e clareza mental" },
  { name: "Magnésio Dimalato", icon: Battery, benefit: "Combate fadiga e aumenta disposição" },
  { name: "Powder Lymp II", icon: Beaker, benefit: "Suporte ao sistema linfático" },
  { name: "Mucuna Pruriens", icon: Leaf, benefit: "Dopamina natural, melhora humor e motivação" },
  { name: "Coenzima Q10", icon: Heart, benefit: "Antioxidante, energia para células" },
]

type TabType = "dia" | "noite" | "energy"

export function IngredientsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("dia")

  const currentIngredients =
    activeTab === "dia"
      ? ingredientsDia
      : activeTab === "noite"
        ? ingredientsNoite
        : ingredientsEnergy

  return (
    <section id="ingredients" className="py-24 lg:py-32 bg-white">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-neutral-900 mb-6 tracking-tight">
              Cada <span className="italic font-normal">ingrediente</span> importa
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Conheça exatamente o que você está colocando no seu corpo. Ingredientes premium com base científica comprovada.
            </p>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal>
          <div className="inline-flex flex-nowrap justify-center gap-2 mb-12 lg:mb-16">
            <button
                onClick={() => setActiveTab("dia")}
                onMouseEnter={() => setActiveTab("dia")}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm",
                  activeTab === "dia"
                    ? "bg-[#355E3B] text-white shadow-lg"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                )}
              >
                <Pill className="w-4 h-4" />
                Fórmula Dia
              </button>
              <button
                onClick={() => setActiveTab("noite")}
                onMouseEnter={() => setActiveTab("noite")}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm",
                  activeTab === "noite"
                    ? "bg-[#1a365d] text-white shadow-lg"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                )}
              >
                <Droplet className="w-4 h-4" />
                Fórmula Noite
              </button>
              <button
                onClick={() => setActiveTab("energy")}
                onMouseEnter={() => setActiveTab("energy")}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm",
                  activeTab === "energy"
                    ? "bg-[#f97316] text-white shadow-lg"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                )}
              >
                <Zap className="w-4 h-4" />
                Fórmula Energy
              </button>

        {/* Ingredients Grid */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 will-change-transform"
          >
            {currentIngredients.map((ingredient, index) => {
              const Icon = ingredient.icon
              return (
                <motion.div
                  key={ingredient.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="p-6 rounded-2xl border-2 border-neutral-200 hover:border-[#a89a8d]/40 bg-white hover:shadow-lg transition-all duration-500 group"
                >
                  {/* Icon & Name */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 rounded-full bg-[#a89a8d]/10 group-hover:bg-[#a89a8d]/20 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-[#a89a8d]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-neutral-900 group-hover:text-[#a89a8d] transition-colors duration-300">
                        {ingredient.name}
                      </h3>
                    </div>
                  </div>

                  {/* Benefit */}
                  <p className="text-sm text-neutral-600 leading-relaxed">{ingredient.benefit}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Scientific Reference */}
        <Reveal>
          <div className="mt-16 lg:mt-20 text-center">
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-[#dad7ce]/30 to-[#a89a8d]/10 border border-[#a89a8d]/20 max-w-3xl">
              <p className="text-neutral-700 leading-relaxed mb-2">
                <span className="font-semibold">Base científica comprovada:</span> Estudos publicados em Nutrients (2022) e Sleep Research Society demonstram eficácia desses compostos no controle de <br />ansiedade, compulsão e sono.
              </p>
              <p className="text-sm text-neutral-600">
                Todas as dosagens seguem protocolos internacionais de segurança e eficácia.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
