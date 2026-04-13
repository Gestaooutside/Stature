/**
 * Selos de confiança exibidos na TrustBar.
 */

import type { LucideIcon } from 'lucide-react'
import { Building2, Scissors, BadgeCheck, Plane } from 'lucide-react'

export interface TrustItem {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
}

export const trustItems: TrustItem[] = [
  {
    id: 'hospital',
    icon: Building2,
    title: 'Hospital Orthomed Center',
    subtitle: 'Uberlândia, MG',
  },
  {
    id: 'minimamente-invasiva',
    icon: Scissors,
    title: 'Técnica Minimamente Invasiva',
    subtitle: 'Fixador + haste intramedular',
  },
  {
    id: 'crm',
    icon: BadgeCheck,
    title: 'CRM-MG',
    subtitle: 'Registro Profissional',
  },
  {
    id: 'brasil',
    icon: Plane,
    title: 'Pacientes de Todo o Brasil',
    subtitle: 'Uberlândia tem aeroporto',
  },
]
