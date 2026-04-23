/**
 * Selos de confiança exibidos na TrustBar.
 * Alinhados ao lançamento do Fitbone e à cobertura em 5 capitais.
 */

import type { LucideIcon } from 'lucide-react'
import { Cpu, Award, BadgeCheck, MapPin } from 'lucide-react'

export interface TrustItem {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
}

export const trustItems: TrustItem[] = [
  {
    id: 'fitbone',
    icon: Cpu,
    title: 'Fitbone',
    subtitle: 'Haste motorizada · Anvisa',
  },
  {
    id: 'pioneiro',
    icon: Award,
    title: 'Pioneiro no Brasil',
    subtitle: 'Referência na América Latina',
  },
  {
    id: 'crm',
    icon: BadgeCheck,
    title: 'CRM-MG 72397',
    subtitle: 'RQE 38488 · Ortopedia e Traumatologia',
  },
  {
    id: 'capitais',
    icon: MapPin,
    title: '5 capitais',
    subtitle: 'Consulta online nacional',
  },
]
