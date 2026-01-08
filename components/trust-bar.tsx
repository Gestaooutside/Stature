"use client"

import { motion } from "framer-motion"
import { Package, Users, Award, Target } from "lucide-react"
import { Reveal } from "./reveal"

const trustMetrics = [
  {
    id: "vendas",
    icon: Package,
    value: "+620mil",
    label: "cápsulas vendidas",
  },
  {
    id: "aprovacao",
    icon: Award,
    value: "97%",
    label: "aprovação",
  },
  {
    id: "vidas",
    icon: Users,
    value: "+10mil",
    label: "vidas transformadas",
  },
  {
    id: "resultados",
    icon: Target,
    value: "24 horas",
    label: "RESULTADOS RÁPIDOS",
  },
]

export function TrustBar() {
  return (
    <section className="py-16 lg:py-20 bg-[#dad7ce]/30 border-y border-[#a89a8d]/20">
      <div className="container-custom">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {trustMetrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={metric.id}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-[#a89a8d]/20">
                      <Icon className="w-6 h-6 text-[#a89a8d]" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-light text-neutral-900 mb-1 tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-sm text-neutral-600 uppercase tracking-wider font-medium">
                    {metric.label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
