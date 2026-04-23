/**
 * Técnicas cirúrgicas oferecidas pela Stature Clinic.
 * Consumido pela seção "Técnicas Cirúrgicas" (TechniquesSection).
 *
 * IMPORTANTE: Fitbone é a técnica principal (destaque).
 * LON é apresentado como segunda opção, de forma neutra —
 * sem superlativos e sem disputar peso com o Fitbone.
 */

import { IMAGES } from '@/lib/config/brand'

export type TechniqueMediaKind = 'video' | 'image'

export interface TechniqueMedia {
  kind: TechniqueMediaKind
  /** URL da mídia principal (vídeo ou imagem). */
  src: string
  /** Poster frame para vídeo / thumb para imagem, opcional. */
  poster?: string
  /** Texto alternativo (acessibilidade). */
  alt: string
  /** Aspect ratio preferido para o frame da mídia. */
  aspect: '9/16' | '16/9' | '4/5' | '1/1'
}

export interface Technique {
  id: string
  /** Identificador curto para badges/tags. */
  shortName: string
  /** Nome completo exibido no card. */
  name: string
  /** Descrição curta usada como lead do card. */
  shortDefinition: string
  /** Rótulo opcional acima do nome — ex.: "Mais moderno". */
  tag?: string
  /** Credencial regulatória / selo oficial. */
  credentialBadge?: string
  /** Lista de vantagens (bullets com ícones no componente). */
  advantages: string[]
  /** Mídia principal do card. */
  media: TechniqueMedia
  /** Se `true`, o card é renderizado com destaque (tamanho maior). */
  featured: boolean
}

export const techniques: readonly Technique[] = [
  {
    id: 'fitbone',
    shortName: 'Fitbone',
    name: 'Fitbone',
    tag: 'Mais moderno',
    shortDefinition:
      'Haste intramedular motorizada, controlada externamente por controle remoto. Nada externo ao corpo.',
    credentialBadge: 'Aprovado pela Anvisa · Tecnologia de ponta mundial',
    advantages: [
      'Zero hardware externo aparente',
      'Sem limitações mecânicas — dorme de lado normalmente',
      'Cicatrizes mínimas',
      'Menos invasiva',
      'Menos desconforto',
      'Reabilitação mais rápida e tranquila',
    ],
    media: {
      kind: 'video',
      src: IMAGES.fitboneVideo,
      // TODO: Gerar um poster .jpg a partir do frame mais representativo do vídeo
      // (momento do controle remoto acionando o alongamento) e referenciar aqui.
      poster: undefined,
      alt: 'Animação do alongamento ósseo com Fitbone — haste intramedular motorizada acionada por controle remoto.',
      aspect: '4/5',
    },
    featured: true,
  },
  {
    id: 'lon',
    shortName: 'LON',
    name: 'Método LON',
    shortDefinition:
      'Fixador externo combinado com haste intramedular, aplicado na tíbia.',
    advantages: [
      'Indicado para casos específicos de tíbia',
      'Fixador externo linear monolateral',
      'Haste intramedular associada',
      'Técnica consolidada e amplamente documentada',
    ],
    media: {
      kind: 'image',
      // TODO: Substituir pela foto real do paciente com método LON (rosto oculto/crop).
      // Placeholder: imagem neutra do fluxo atual.
      src: IMAGES.procedures.tibia,
      alt: 'Método LON — fixador externo linear associado a haste intramedular na tíbia. Identidade do paciente preservada.',
      aspect: '4/5',
    },
    featured: false,
  },
]
