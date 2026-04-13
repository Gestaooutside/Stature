/**
 * Procedimentos oferecidos pelo Dr. David de Mello.
 * Dados consumidos pela seção "Procedimentos" (ex-featured-products).
 */

import { IMAGES } from '@/lib/config/brand'

export interface ProcedureItem {
  id: string
  name: string
  shortName: string
  gain: string
  duration: string
  description: string
  image: string
  highlights: string[]
}

export const procedures: ProcedureItem[] = [
  {
    id: 'femur',
    name: 'Alongamento de Fêmur',
    shortName: 'Fêmur',
    gain: '6–8 cm',
    duration: '6–8 meses',
    description:
      'Alongamento do osso do fêmur com fixador externo linear monolateral associado à haste intramedular. Técnica minimamente invasiva que permite carga precoce e retorno acelerado à rotina.',
    image: IMAGES.procedures.femur,
    highlights: [
      'Ganho médio de 6 a 8 cm',
      'Fixador externo + haste intramedular',
      'Reabilitação desde o primeiro dia',
    ],
  },
  {
    id: 'tibia',
    name: 'Alongamento de Tíbia',
    shortName: 'Tíbia',
    gain: '5–7 cm',
    duration: '6–9 meses',
    description:
      'Alongamento da tíbia indicado quando se busca complementar o ganho do fêmur ou tratar discrepâncias específicas. Protocolo combinado para manter força, mobilidade e proporcionalidade.',
    image: IMAGES.procedures.tibia,
    highlights: [
      'Ganho médio de 5 a 7 cm',
      'Ideal para complementar o fêmur',
      'Cálculo de proporcionalidade corporal',
    ],
  },
  {
    id: 'correcao',
    name: 'Correção de Discrepância',
    shortName: 'Correção',
    gain: 'Personalizado',
    duration: 'Variável',
    description:
      'Tratamento da diferença de comprimento entre os membros inferiores (dismetria) causada por sequelas, fraturas antigas, poliomielite ou deformidades. Planejamento individual baseado em exames de imagem.',
    image: IMAGES.procedures.correction,
    highlights: [
      'Correção milimétrica da dismetria',
      'Planejamento por exame de imagem',
      'Reabilitação personalizada',
    ],
  },
]
