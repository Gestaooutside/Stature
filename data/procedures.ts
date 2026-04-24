/**
 * Procedimentos oferecidos pela Stature Clinic.
 * Números alinhados à mensagem padrão: 8 cm no fêmur, 6 cm na tíbia.
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
    gain: '8 cm',
    duration: '6 a 8 meses',
    description:
      'Alongamento do fêmur realizado com Fitbone (haste intramedular motorizada, acionada por controle remoto) ou Método LON (fixador externo combinado com haste intramedular), conforme indicação clínica.',
    image: IMAGES.procedures.femur,
    highlights: [
      'Alongamento médio de 8 cm',
      'Fitbone ou Método LON conforme indicação',
      'Reabilitação desde o primeiro dia',
    ],
  },
  {
    id: 'tibia',
    name: 'Alongamento de Tíbia',
    shortName: 'Tíbia',
    gain: '6 cm',
    duration: '6 a 9 meses',
    description:
      'Alongamento da tíbia indicado para complementar o ganho do fêmur ou tratar discrepâncias específicas. Conforme o caso, realizado com Fitbone ou Método LON (fixador linear + haste intramedular).',
    image: IMAGES.procedures.tibia,
    highlights: [
      'Alongamento médio de 6 cm',
      'Fitbone ou Método LON conforme indicação',
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
      'Tratamento da diferença de comprimento entre os membros inferiores (dismetria) por sequelas, fraturas antigas, poliomielite ou deformidades. Planejamento individual baseado em exames de imagem.',
    image: IMAGES.procedures.correction,
    highlights: [
      'Correção milimétrica da dismetria',
      'Planejamento por exame de imagem',
      'Reabilitação personalizada',
    ],
  },
]
