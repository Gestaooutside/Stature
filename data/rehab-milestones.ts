/**
 * Marcos de reabilitação — apresentados na seção "Recuperação".
 * Mensagem padrão: vida continua durante o tratamento;
 * impacto pleno liberado em torno dos 6 meses.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Footprints,
  Dumbbell,
  Briefcase,
  Medal,
} from 'lucide-react'

export interface RehabMilestone {
  id: string
  when: string
  title: string
  description: string
  icon: LucideIcon
}

export const rehabMilestones: readonly RehabMilestone[] = [
  {
    id: 'dia-1',
    when: 'Dia 1',
    title: 'Caminhada liberada',
    description:
      'Carga parcial assistida liberada já no primeiro dia pós-operatório, com orientação da equipe e fisioterapeuta.',
    icon: Footprints,
  },
  {
    id: 'semanas-iniciais',
    when: 'Semanas iniciais',
    title: 'Fisio precoce + academia',
    description:
      'Fisioterapia estruturada desde o início. Academia para membros inferiores permitida desde o primeiro período.',
    icon: Dumbbell,
  },
  {
    id: 'durante-tratamento',
    when: 'Durante o tratamento',
    title: 'Rotina preservada',
    description:
      'Possível manter o trabalho, dirigir e ir à fisioterapia sozinho. Autonomia sem comprometer o resultado.',
    icon: Briefcase,
  },
  {
    id: 'seis-meses',
    when: '6 meses',
    title: 'Impacto liberado',
    description:
      'Corrida, saltos e esportes de impacto liberados após a consolidação óssea e a reabilitação completa.',
    icon: Medal,
  },
]
