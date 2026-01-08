"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Check, MessageCircle, Copy } from "lucide-react"
import { Reveal } from "./reveal"

export function NewsletterSection() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  // Pega código do cupom da variável de ambiente ou usa padrão
  const discountCode = process.env.NEXT_PUBLIC_WHATSAPP_DISCOUNT_CODE || "WHATSAPP05"

  /**
   * Formata número de telefone brasileiro
   * Aceita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
   */
  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Limita a 11 dígitos (DDD + número)
    const limited = numbers.slice(0, 11)

    // Aplica máscara
    if (limited.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      return limited
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    } else {
      // Formato: (XX) XXXXX-XXXX
      return limited
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
    }
  }

  /**
   * Valida número de telefone brasileiro
   * DDD: 11-99, Número: 8-9 dígitos
   */
  const validateWhatsApp = (phone: string) => {
    // Remove formatação
    const numbers = phone.replace(/\D/g, "")

    // Valida: 10 ou 11 dígitos, DDD válido (11-99)
    const regex = /^([1-9]{2})(9?\d{8})$/
    return regex.test(numbers)
  }

  /**
   * Copia cupom para área de transferência
   */
  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(discountCode)
      setIsCopied(true)

      // Reseta estado após 2 segundos
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Erro ao copiar cupom:", err)
    }
  }

  /**
   * Processa envio do formulário e captura lead
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Valida nome e WhatsApp
    if (!name.trim() || !validateWhatsApp(whatsapp)) {
      setIsValid(false)
      return
    }

    setIsValid(true)

    // Prepara dados para enviar à API
    const leadData = {
      sourceType: 'newsletter' as const,
      name: name.trim(),
      whatsapp: whatsapp,
      couponCode: discountCode,
    }

    try {
      // Envia lead para API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Lead capturado com sucesso:', data.lead.id)
        setIsSubmitted(true)
      } else {
        console.error('Erro ao capturar lead:', data.error)
        // Em caso de erro, ainda mostra sucesso para o usuário
        // mas loga o erro para debugging
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Erro de rede ao capturar lead:', error)
      // Em caso de erro de rede, ainda mostra sucesso para o usuário
      // mas loga o erro para debugging
      setIsSubmitted(true)
    }
  }

  /**
   * Atualiza WhatsApp com formatação
   */
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setWhatsapp(formatted)
    setIsValid(true)
  }

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container-custom">
        <Reveal>
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 rounded-full bg-[#a89a8d]/10 border border-[#a89a8d]/20">
                <span className="text-sm font-medium text-neutral-700 uppercase tracking-wider">
                  Cupom Exclusivo 5% OFF
                </span>
              </div>
            </div>

            <div className="p-10 lg:p-16 bg-white border-2 border-[#a89a8d]/20 rounded-2xl">
              <div className="text-center mb-10 lg:mb-12">
                <h2 className="text-3xl lg:text-4xl font-light text-neutral-900 mb-4 tracking-tight">
                  Ganhe <span className="italic font-normal">5% de desconto</span>
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  Compartilhe seu WhatsApp e receba um cupom exclusivo para usar na sua primeira compra.
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Campo Nome */}
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setIsValid(true)
                      }}
                      placeholder="Digite seu nome"
                      className={`w-full px-4 py-4 bg-white border-2 rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        !isValid && !name.trim()
                          ? "border-red-300 focus:ring-red-500"
                          : "border-[#a89a8d]/20 focus:ring-[#a89a8d]/40"
                      }`}
                    />
                  </div>

                  {/* Campo WhatsApp */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MessageCircle size={20} className="text-[#a89a8d]" />
                    </div>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={handleWhatsAppChange}
                      placeholder="(11) 99999-9999"
                      className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        !isValid && !validateWhatsApp(whatsapp)
                          ? "border-red-300 focus:ring-red-500"
                          : "border-[#a89a8d]/20 focus:ring-[#a89a8d]/40"
                      }`}
                    />
                  </div>

                  {/* Mensagem de erro */}
                  {!isValid && (
                    <motion.p
                      className="text-sm text-red-600 text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    >
                      Por favor, preencha seu nome e um WhatsApp válido
                    </motion.p>
                  )}

                  {/* Botão Submit */}
                  <motion.button
                    type="submit"
                    className="w-full bg-[#a89a8d] text-white py-4 rounded-full font-medium hover:bg-[#8d7f72] transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Quero meu cupom de 5%
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {/* Ícone de sucesso */}
                  <div className="w-16 h-16 bg-[#a89a8d]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={28} className="text-[#a89a8d]" strokeWidth={2.5} />
                  </div>

                  {/* Mensagem de sucesso */}
                  <h3 className="text-xl font-medium text-neutral-900 mb-2">Cupom gerado com sucesso!</h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">
                    Obrigado, {name}! Use o cupom abaixo no checkout:
                  </p>

                  {/* Box do cupom */}
                  <div className="p-6 bg-gradient-to-br from-[#a89a8d]/10 to-[#a89a8d]/5 border-2 border-[#a89a8d]/30 rounded-xl mb-6">
                    <p className="text-sm text-neutral-600 mb-2 uppercase tracking-wider">Seu cupom de desconto</p>
                    <p className="text-3xl font-bold text-[#a89a8d] mb-4 tracking-wide">{discountCode}</p>

                    {/* Botão copiar */}
                    <motion.button
                      onClick={handleCopyCoupon}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                        isCopied
                          ? "bg-green-500 text-white"
                          : "bg-[#a89a8d] text-white hover:bg-[#8d7f72]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCopied ? (
                        <>
                          <Check size={18} />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Copiar cupom
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Instruções */}
                  <p className="text-sm text-neutral-500">
                    Cole este código no campo de cupom durante o checkout para ganhar 5% de desconto.
                  </p>
                </motion.div>
              )}

              {/* Footer com privacidade */}
              <p className="text-xs text-neutral-500 text-center mt-6 leading-relaxed">
                Seus dados estão seguros conosco. Leia nossa{" "}
                <a href="#" className="underline hover:text-[#a89a8d] transition-colors duration-300">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
