"use client";

import React from 'react';
import Image from 'next/image';
import { Reveal } from './reveal';
import { Building2 } from 'lucide-react';

const pharmacies = [
  {
    id: 1,
    name: 'Zurich Pharma LTDA',
    cnpj: '54.472.026/0001-61',
    responsible: 'Josiane Da Rocha Pereira Melo',
    crf: '2970'
  },
  {
    id: 2,
    name: 'Viva Farmácia de Manipulação LTDA',
    cnpj: '50.475.119/0001-99',
    responsible: 'Raissa Brasil',
    crf: '6492'
  }
];

export function AccreditedPharmacies() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-[#dad7ce]/20 via-white to-[#dad7ce]/10">
      <div className="container-custom relative z-10">
        <Reveal>
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm border border-[#a89a8d]/20 rounded-full mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8d7f72] to-[#a89a8d] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
                Farmácias Credenciadas
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-6">
              Qualidade <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8d7f72] to-[#a89a8d]">certificada</span>
            </h2>

            <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              A <span className="font-semibold text-[#8d7f72]">DUO NATURAL</span> conecta você a farmácias de manipulação
              credenciadas e certificadas pela ANVISA, garantindo os mais altos padrões de qualidade e segurança.
            </p>
          </div>
        </Reveal>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <Reveal delay={0.2}>
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    src="/pharmacy-1.jpg"
                    alt="Farmácia Credenciada DUO NATURAL"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </Reveal>

            {/* Pharmacies List */}
            <Reveal delay={0.4}>
              <div className="space-y-6">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="py-6 border-b border-[#dad7ce]/30 last:border-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {pharmacy.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                        <span>CNPJ {pharmacy.cnpj}</span>
                        <span>CRF {pharmacy.crf}</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {pharmacy.responsible}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}