'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ShieldCheck,
  Clock,
  Pill,
  Heart,
  Truck,
  CreditCard,
  RefreshCw,
  Users,
  MessageCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Reveal } from './reveal';
import type { LucideIcon } from 'lucide-react';

/**
 * Categoria de FAQ para organização e filtragem
 */
type FAQCategory = 'produto' | 'uso' | 'compra' | 'entrega' | 'suporte';

/**
 * Item de FAQ expandido com categoria e ícone
 */
interface FAQItem {
  id: string;
  category: FAQCategory;
  number: string;
  question: string;
  answer: string;
  icon: LucideIcon;
  highlighted?: boolean; // Destaque especial
}

/**
 * Perguntas frequentes completas sobre Duo Natural
 * Organizadas por categoria para melhor navegação
 */
const faqs: FAQItem[] = [
  // CATEGORIA: PRODUTO
  {
    id: 'what-is',
    category: 'produto',
    number: '01',
    question: 'O que é Duo Natural?',
    answer:
      'Duo Natural é um sistema de duas fórmulas naturais que trabalham em sinergia: Fórmula DIA (cápsulas) para controle de ansiedade e compulsão alimentar, e Fórmula NOITE (gotas sublinguais) para sono profundo e restaurador. 100% natural, sem tarja, sem dependência.',
    icon: Heart,
    highlighted: true,
  },
  {
    id: 'results-time',
    category: 'produto',
    number: '02',
    question: 'Quanto tempo até sentir os primeiros resultados?',
    answer:
      'Muitos usuários relatam melhorias já nas primeiras 24-48 horas, especialmente na qualidade do sono e redução da ansiedade imediata. Para resultados completos e consolidados, recomendamos uso contínuo por 30-90 dias, quando o corpo atinge o equilíbrio ideal de neurotransmissores.',
    icon: Clock,
  },
  {
    id: 'side-effects',
    category: 'produto',
    number: '03',
    question: 'Causa dependência ou efeitos colaterais?',
    answer:
      'Não. Ao contrário de medicamentos controlados (tarja preta), Duo Natural não causa dependência química, sonolência excessiva ou efeitos colaterais. Os ingredientes naturais trabalham reequilibrando seu organismo gradualmente, sem criar tolerância ou necessidade de aumento de dose.',
    icon: ShieldCheck,
    highlighted: true,
  },
  {
    id: 'ingredients',
    category: 'produto',
    number: '04',
    question: 'Quais são os ingredientes?',
    answer:
      'Fórmula DIA contém Rhodiola Rosea, Ashwagandha, L-Teanina, 5-HTP e vitaminas do complexo B. Fórmula NOITE possui Melatonina vegetal, Passiflora, Valeriana, Magnésio e GABA. Todos os ativos são farmacêuticos, rastreáveis e certificados.',
    icon: Pill,
  },

  // CATEGORIA: USO
  {
    id: 'how-to-use',
    category: 'uso',
    number: '05',
    question: 'Como devo tomar? Existe dosagem ideal?',
    answer:
      'Ritual matinal: tome 2 cápsulas da Fórmula DIA com água após o café da manhã. Ritual noturno: 30 minutos após escovar os dentes, aplique 2 a 5 gotas da Fórmula NOITE debaixo da língua e deixe absorver. Não engula imediatamente. Essa rotina cria o ciclo perfeito para transformar seu bem-estar.',
    icon: Heart,
    highlighted: true,
  },
  {
    id: 'prescription',
    category: 'uso',
    number: '06',
    question: 'Preciso de receita médica?',
    answer:
      'Não é necessário. Duo Natural é classificado como suplemento natural de venda livre. No entanto, se você faz tratamento psiquiátrico, toma medicações controladas (antidepressivos, ansiolíticos) ou tem condições médicas específicas, consulte seu médico antes de começar.',
    icon: ShieldCheck,
  },
  {
    id: 'other-meds',
    category: 'uso',
    number: '07',
    question: 'Posso tomar com outros medicamentos?',
    answer:
      'Duo Natural é 100% natural e geralmente compatível com a maioria dos medicamentos. Porém, sempre recomendamos consultar seu médico antes de combinar com medicamentos controlados, especialmente antidepressivos (ISRS, tricíclicos), ansiolíticos (benzodiazepínicos) ou indutores do sono.',
    icon: Pill,
  },
  {
    id: 'stop-using',
    category: 'uso',
    number: '08',
    question: 'Posso parar de tomar quando melhorar?',
    answer:
      'Sim, sem problemas. Como não há dependência química, você pode interromper o uso a qualquer momento sem sintomas de abstinência. Para manter os resultados a longo prazo, muitos usuários optam por ciclos contínuos de 2-3 meses ou uso intermitente conforme necessidade.',
    icon: RefreshCw,
  },

  // CATEGORIA: COMPRA E ENTREGA
  {
    id: 'subscription',
    category: 'compra',
    number: '09',
    question: 'Como funciona a assinatura?',
    answer:
      'Nossos planos funcionam como assinatura recorrente. Você faz um pedido único e recebe automaticamente seus produtos a cada mês ou trimestre, sem se preocupar em renovar manualmente. Pode pausar ou cancelar a qualquer momento sem taxas ou burocracia.',
    icon: RefreshCw,
    highlighted: true,
  },
  {
    id: 'delivery',
    category: 'entrega',
    number: '10',
    question: 'Quanto tempo demora a entrega?',
    answer:
      'Seu pedido é manipulado e enviado com código de rastreamento para acompanhamento em tempo real.',
    icon: Truck,
  },
  {
    id: 'payment',
    category: 'compra',
    number: '11',
    question: 'Quais formas de pagamento aceitas?',
    answer:
      'Aceitamos cartão de crédito (até 12x sem juros), PIX (aprovação instantânea) e boleto bancário. Para assinaturas recorrentes, recomendamos cartão de crédito para garantir continuidade sem interrupções no seu tratamento.',
    icon: CreditCard,
  },
  {
    id: 'cancel',
    category: 'compra',
    number: '12',
    question: 'Posso cancelar minha assinatura?',
    answer:
      'Sim, a qualquer momento! Você tem controle total da sua assinatura através do painel do cliente ou pode solicitar cancelamento pelo WhatsApp (61) 9316-8859. Não há multas, taxas ou burocracia. Sua saúde, suas regras.',
    icon: RefreshCw,
  },

  // CATEGORIA: DIFERENCIAÇÃO
  {
    id: 'vs-remedios',
    category: 'produto',
    number: '13',
    question: 'Qual a diferença para remédios de tarja preta?',
    answer:
      'Remédios controlados suprimem sintomas rapidamente mas podem causar dependência, efeitos colaterais graves (tontura, náusea, ganho de peso) e perda de eficácia com o tempo. Duo Natural trata a raiz do problema, reequilibrando neurotransmissores naturalmente, sem risco de dependência ou efeitos adversos.',
    icon: ShieldCheck,
    highlighted: true,
  },
  {
    id: 'anxiety-types',
    category: 'produto',
    number: '14',
    question: 'Funciona para qualquer tipo de ansiedade?',
    answer:
      'Sim! Duo Natural é eficaz para ansiedade generalizada, ansiedade social, estresse crônico, síndrome do pânico leve a moderada e compulsão alimentar de origem emocional. Para transtornos graves ou crises agudas, recomendamos acompanhamento médico profissional complementar.',
    icon: Users,
  },
  {
    id: 'who-manual',
    category: 'suporte',
    number: '15',
    question: 'A Duo Natural é farmácia? Quem manipula os produtos?',
    answer:
      'Não, a Duo Natural não é uma farmácia. Somos uma plataforma que conecta você a farmácias de manipulação credenciadas e certificadas pela ANVISA. Todos os produtos são manipulados por farmacêuticos especializados em nossos parceiros auditados. Garantimos qualidade total.',
    icon: Building2,
  },
  {
    id: 'support',
    category: 'suporte',
    number: '16',
    question: 'Como funciona o suporte?',
    answer:
      'Durante todo o seu tratamento, você tem acesso ilimitado a profissionais de saúde pelo WhatsApp (61) 9316-8859. Tire dúvidas, ajuste dosagens, relate progressos. Nossa equipe está disponível todos os dias para garantir a melhor experiência e resultados.',
    icon: MessageCircle,
    highlighted: true,
  },
];

/**
 * Configurações de categorias para filtros
 */
const categories = [
  { id: 'all', label: 'Todas', icon: HelpCircle },
  { id: 'produto', label: 'Produto', icon: Heart },
  { id: 'uso', label: 'Como Usar', icon: Pill },
  { id: 'compra', label: 'Compra', icon: CreditCard },
  { id: 'entrega', label: 'Entrega', icon: Truck },
  { id: 'suporte', label: 'Suporte', icon: MessageCircle },
];

interface PremiumFAQSectionProps {
  onOpenPaymentModal?: () => void;
}

/**
 * PremiumFAQSection - FAQ ultra sofisticado com filtros e animações premium
 * 
 * Design editorial de alta qualidade com:
 * - Accordion interativo numerado
 * - Filtros por categoria
 * - Animações suaves e elegantes
 * - Destaque para perguntas importantes
 * - Layout responsivo premium
 * - SEO otimizado com schema markup
 */
export function PremiumFAQSection({ onOpenPaymentModal }: PremiumFAQSectionProps) {
  const [activeId, setActiveId] = useState<string | null>('what-is');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtra FAQs por categoria
  const filteredFaqs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  // FAQ Schema para SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-white via-[#dad7ce]/5 to-white"
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 grain-texture opacity-10" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-[#a89a8d]/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#dad7ce]/30 border border-[#a89a8d]/20 rounded-full mb-6"
            >
              <HelpCircle className="w-4 h-4 text-[#a89a8d]" />
              <span className="text-sm font-medium text-neutral-700 uppercase tracking-wider">
                Perguntas Frequentes
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight leading-tight">
              Tudo o que você{' '}
              <span className="italic font-normal">precisa saber</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Respostas detalhadas para as dúvidas mais comuns sobre Duo Natural,
              desde como funciona até entrega e suporte.
            </p>
          </div>
        </Reveal>

        {/* Filtros de Categoria */}
        <Reveal>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 md:mb-16 px-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    relative px-4 py-2.5 rounded-full text-sm font-medium
                    transition-all duration-300
                    ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-[#a89a8d]/40'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-category"
                      className="absolute inset-0 bg-gradient-to-br from-[#a89a8d] to-[#8d7f72] rounded-full"
                      transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Reveal>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-0"
            >
              {filteredFaqs.map((item, index) => {
                const isActive = activeId === item.id;
                const isHovered = hoveredId === item.id;
                const Icon = item.icon;

                return (
                  <Reveal key={item.id} delay={index * 0.05}>
                    <div className="relative">
                      <motion.button
                        onClick={() => setActiveId(isActive ? null : item.id)}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`
                          w-full group relative
                          ${item.highlighted ? 'bg-[#dad7ce]/10' : ''}
                        `}
                        initial={false}
                      >
                        <div className="flex items-center gap-4 md:gap-6 py-6 md:py-7 px-4 md:px-6">
                          {/* Number com círculo animado */}
                          <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
                            <motion.div
                              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#a89a8d] to-[#8d7f72]"
                              initial={false}
                              animate={{
                                scale: isActive ? 1 : isHovered ? 0.9 : 0,
                                opacity: isActive ? 1 : isHovered ? 0.2 : 0,
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                            />
                            <motion.span
                              className="relative z-10 text-sm font-bold tracking-wide"
                              animate={{
                                color: isActive
                                  ? '#ffffff'
                                  : isHovered
                                    ? '#a89a8d'
                                    : '#9ca3af',
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.number}
                            </motion.span>
                          </div>

                          {/* Ícone da categoria */}
                          <div className="flex-shrink-0">
                            <motion.div
                              className="p-2 rounded-xl"
                              animate={{
                                backgroundColor: isActive
                                  ? 'rgba(168, 154, 141, 0.1)'
                                  : 'transparent',
                              }}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  isActive
                                    ? 'text-[#a89a8d]'
                                    : 'text-neutral-400 group-hover:text-[#a89a8d]'
                                } transition-colors duration-300`}
                              />
                            </motion.div>
                          </div>

                          {/* Pergunta */}
                          <motion.h3
                            className="text-left text-base md:text-lg lg:text-xl font-semibold tracking-tight flex-1"
                            animate={{
                              x: isActive || isHovered ? 4 : 0,
                              color: isActive
                                ? '#0b0b0b'
                                : isHovered
                                  ? '#1a1a1a'
                                  : '#525252',
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          >
                            {item.question}
                          </motion.h3>

                          {/* Indicador + ou - animado */}
                          <div className="ml-auto flex items-center justify-center w-10 h-10 flex-shrink-0">
                            <motion.div
                              animate={{ rotate: isActive ? 45 : 0 }}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                className={`${
                                  isActive
                                    ? 'text-[#a89a8d]'
                                    : 'text-neutral-400 group-hover:text-[#a89a8d]'
                                } transition-colors duration-300`}
                              >
                                <path
                                  d="M10 2V18M2 10H18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </motion.div>
                          </div>
                        </div>

                        {/* Linha animada */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
                        <motion.div
                          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#a89a8d] to-[#8d7f72]"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: isActive ? 1 : isHovered ? 0.4 : 0,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                          style={{ transformOrigin: 'left' }}
                        />
                      </motion.button>

                      {/* Resposta */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: 'auto',
                              opacity: 1,
                              transition: {
                                height: {
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 30,
                                },
                                opacity: { duration: 0.2, delay: 0.1 },
                              },
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              transition: {
                                height: {
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 30,
                                },
                                opacity: { duration: 0.1 },
                              },
                            }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              className="pl-20 md:pl-24 pr-6 md:pr-8 py-6 md:py-8"
                              initial={{ y: -10 }}
                              animate={{ y: 0 }}
                              exit={{ y: -10 }}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                              }}
                            >
                              <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed">
                                {item.answer}
                              </p>

                              {/* Indicador de destaque */}
                              {item.highlighted && (
                                <div className="mt-4 flex items-center gap-2 text-[#a89a8d]">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-medium uppercase tracking-wider">
                                    Informação importante
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

          </div>

      {/* FAQ Schema Markup para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
