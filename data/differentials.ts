/**
 * Diferenciais técnicos do tratamento oferecido pelo Dr. David.
 * Consumido pela seção "Técnica e Diferenciais" (ex-ingredients-section).
 */

import type { LucideIcon } from 'lucide-react'
import {
  Layers,
  Activity,
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
    id: 'fixador',
    name: 'Fixador Externo Linear',
    icon: Layers,
    benefit:
      'Monolateral, mais leve e confortável que o Ilizarov. Permite roupas comuns e é removido ao final da fase de alongamento.',
  },
  {
    id: 'haste',
    name: 'Haste Intramedular',
    icon: Activity,
    benefit:
      'Posicionada dentro do osso, invisível externamente. Reduz o tempo de uso do fixador externo e acelera a carga.',
  },
  {
    id: 'minimamente',
    name: 'Minimamente Invasiva',
    icon: ShieldCheck,
    benefit:
      'Poucas e pequenas incisões, com menor risco de infecção e cicatrizes discretas após a consolidação.',
  },
  {
    id: 'fisio',
    name: 'Fisioterapia Integrada',
    icon: HeartPulse,
    benefit:
      'Reabilitação iniciada no primeiro dia pós-operatório. Força, mobilidade, treino de marcha e prevenção de rigidez.',
  },
  {
    id: 'proporcao',
    name: 'Proporcionalidade',
    icon: Ruler,
    benefit:
      'Cálculos individualizados para manter a harmonia entre tronco, fêmur e tíbia. Ganho seguro e esteticamente natural.',
  },
  {
    id: 'vida-normal',
    name: 'Vida Normal Após',
    icon: Dumbbell,
    benefit:
      'Correr, saltar, academia, esportes. O osso formado é tão resistente quanto o original, sem restrições permanentes.',
  },
]
