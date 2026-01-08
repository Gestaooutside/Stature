/**
 * Hook useReducedMotion para acessibilidade e performance
 *
 * Detecta se o usuário prefere movimento reduzido (prefers-reduced-motion)
 * ou se está em um device lento. Retorna true para desabilitar animações
 * complexas e melhorar performance.
 *
 * Casos de uso:
 * - Acessibilidade (usuários com sensibilidade a movimento)
 * - Performance (devices lentos, economia de bateria)
 * - UX (evitar animações desnecessárias)
 */

import { useState, useEffect } from "react"

export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Detecta preferência do sistema operacional
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Set inicial
    setShouldReduceMotion(mediaQuery.matches)

    // Listener para mudanças (usuário pode alterar preferência)
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches)
    }

    // Adiciona listener (API moderna)
    mediaQuery.addEventListener("change", handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return shouldReduceMotion
}
