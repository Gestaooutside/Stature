/**
 * Diferenciais técnicos do tratamento oferecido pela Stature Clinic.
 * Consumido pela seção "Técnica e Diferenciais" (ingredients-section).
 *
 * Atualizado para refletir a tecnologia Fitbone (principal) e
 * remover qualquer referência ao fixador circular (Ilizarov).
 */

import type { LucideIcon } from 'lucide-react'
import {
  Cpu,
  Radio,
  ShieldCheck,
  HeartPulse,
  Ruler,
  Dumbbell,
} from 'lucide-react'

export interface DifferentialItem {
  id: string
  name: string
  icon: LucideIcon
  benefit: string
}

export const differentials: DifferentialItem[] = [
  {
    id: 'fitbone',
    name: 'Fitbone · Haste Motorizada',
    icon: Cpu,
    benefit:
      'Haste intramedular motorizada posicionada dentro do osso, aprovada pela Anvisa. Invisível externamente, sem hardware aparente. Cicatrizes mínimas e reabilitação mais rápida.',
  },
  {
    id: 'controle-remoto',
    name: 'Controle Externo por Controle Remoto',
    icon: Radio,
    benefit:
      'O alongamento é acionado com precisão milimétrica por um controle remoto externo. Nada preso ao corpo entre as sessões — rotina, sono e conforto preservados.',
  },
  {
    id: 'minimamente',
    name: 'Minimamente Invasiva',
    icon: ShieldCheck,
    benefit:
      'Incisões pequenas, menor risco de infecção e menos desconforto durante a fase de alongamento. Retorno ao cotidiano desde o início.',
  },
  {
    id: 'fisio',
    name: 'Fisioterapia Integrada',
    icon: HeartPulse,
    benefit:
      'Reabilitação iniciada no primeiro dia pós-operatório. Academia para membros inferiores liberada nas semanas iniciais, com autonomia para ir à fisioterapia sozinho.',
  },
  {
    id: 'proporcao',
    name: 'Proporcionalidade',
    icon: Ruler,
    benefit:
      'Cálculos individualizados para manter a harmonia entre tronco, fêmur e tíbia. Alongamento médio de 8 cm no fêmur e 6 cm na tíbia — no fêmur, na tíbia ou em ambos.',
  },
  {
    id: 'vida-normal',
    name: 'Vida Normal Durante e Após',
    icon: Dumbbell,
    benefit:
      'Trabalho, direção e rotina mantidos durante o tratamento. Aos 6 meses, atividades de impacto liberadas: correr, saltar, academia, esportes.',
  },
]
