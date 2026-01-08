/**
 * Hook useInView - Detecta quando elemento está visível no viewport
 *
 * Usa Intersection Observer API (nativa do browser) para detectar
 * visibilidade de elementos. Ideal para controlar animações, lazy loading,
 * e otimizar performance pausando processos fora da tela.
 *
 * Features:
 * - Performance otimizada (sem scroll listeners)
 * - Threshold configurável (% do elemento visível)
 * - rootMargin para pré-carregamento
 * - triggerOnce para executar apenas uma vez
 *
 * Uso:
 * const ref = useRef(null)
 * const isInView = useInView(ref, { threshold: 0.2 })
 */

import { useEffect, useState, RefObject } from "react"

interface UseInViewOptions {
  threshold?: number      // 0-1: porcentagem visível para trigger (padrão: 0.2 = 20%)
  rootMargin?: string     // Margem extra (ex: "100px" para pré-carregar)
  triggerOnce?: boolean   // Se true, só ativa uma vez (não desativa ao sair)
}

export function useInView(
  ref: RefObject<Element>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false)
  const { threshold = 0.2, rootMargin = "0px", triggerOnce = false } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Cria Intersection Observer com configurações
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting

        // Se triggerOnce ativo, só atualiza uma vez
        if (triggerOnce) {
          if (inView && !isInView) {
            setIsInView(true)
          }
        } else {
          // Modo padrão: atualiza sempre que visibilidade muda
          setIsInView(inView)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    // Cleanup: desconecta observer ao desmontar
    return () => {
      observer.disconnect()
    }
  }, [ref, threshold, rootMargin, triggerOnce, isInView])

  return isInView
}
