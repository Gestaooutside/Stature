"use client"

import { Cloud, Moon, Utensils } from "lucide-react"
import { Reveal } from "./reveal"
import { Timeline } from "./ui/timeline"

export function ProblemSolution() {
  // Dados dos problemas para Timeline
  const problemsData = [
    {
      title: "Ansiedade muito forte",
      content: (
        <div className="pb-12 md:pb-16 lg:pb-20">
          {/* Ícone */}
          <div className="mb-6 md:mb-8">
            <div className="inline-flex p-3 md:p-4 lg:p-5 rounded-full bg-[#a89a8d]/10">
              <Cloud className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-[#a89a8d]" strokeWidth={1.5} />
            </div>
          </div>

          {/* Descrição expandida */}
          <div className="max-w-2xl">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-700 leading-relaxed mb-4 md:mb-5 lg:mb-6 font-light">
              Aquele aperto no peito que surge do nada. O coração acelerado sem motivo aparente.
            </p>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed">
              A sensação de que algo ruim vai acontecer, mesmo quando tudo está bem. Você tenta controlar, mas quanto mais tenta, mais forte fica.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Compulsão alimentar",
      content: (
        <div className="pb-12 md:pb-16 lg:pb-20">
          {/* Ícone */}
          <div className="mb-6 md:mb-8">
            <div className="inline-flex p-3 md:p-4 lg:p-5 rounded-full bg-[#8d7f72]/10">
              <Utensils className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-[#8d7f72]" strokeWidth={1.5} />
            </div>
          </div>

          {/* Descrição expandida */}
          <div className="max-w-2xl">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-700 leading-relaxed mb-4 md:mb-5 lg:mb-6 font-light">
              Às 23h, você está na geladeira. Não é fome. É impulso.
            </p>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed">
              A culpa vem depois, mas o padrão se repete toda noite. Você promete que amanhã será diferente, mas o ciclo continua.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Cabeça não desliga",
      content: (
        <div className="pb-12 md:pb-16 lg:pb-20">
          {/* Ícone */}
          <div className="mb-6 md:mb-8">
            <div className="inline-flex p-3 md:p-4 lg:p-5 rounded-full bg-[#b8a592]/10">
              <Moon className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-[#b8a592]" strokeWidth={1.5} />
            </div>
          </div>

          {/* Descrição expandida */}
          <div className="max-w-2xl">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-700 leading-relaxed mb-4 md:mb-5 lg:mb-6 font-light">
              Deitado na cama por horas. A mente acelerada, revivendo o dia que acabou.
            </p>
            <p className="text-sm md:text-base lg:text-lg text-neutral-600 leading-relaxed">
              O corpo cansado, mas o cérebro em alerta máximo. Você conta ovelhas, controla a respiração, mas nada funciona. O sono não vem.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section className="py-16 md:py-24 lg:py-32 xl:py-40 bg-white">
      <div className="container-custom">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-14 lg:mb-16 xl:mb-20 max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light text-neutral-900 mb-4 md:mb-6 lg:mb-8 tracking-tight leading-[1.1]">
              Você conhece <span className="italic font-normal">essas sensações?</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-600 leading-relaxed font-light">
              Milhões de pessoas vivem presas nesses ciclos. Não porque querem, mas porque o corpo e a mente perderam o equilíbrio natural.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Timeline dos problemas */}
      <Timeline data={problemsData} />
    </section>
  )
}
