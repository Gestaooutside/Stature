/**
 * Galeria de pacientes reais — jornada completa do tratamento.
 *
 * Narrativa: cirurgia → cuidados → imagens médicas → fisioterapia →
 * autonomia. Mescla momentos clínicos e cotidianos para mostrar
 * o tratamento real, não idealizado.
 *
 * Ordem otimizada para o masonry round-robin de 3 colunas:
 * col 0 (0,3,6), col 1 (1,4,7), col 2 (2,5,8) — cada coluna com
 * mistura de aspectos (4/5 e 9/16) para equilibrar alturas.
 *
 * Identidades preservadas: rostos sempre ocultos (crop/blur).
 * Mídias em /public/pacientes/ — autorizadas pelo Dr. David.
 */

export type GalleryKind = 'image' | 'video'
export type GalleryAspect = '4/5' | '1/1' | '9/16'

export interface GalleryItem {
  id: string
  kind: GalleryKind
  /** URL da mídia (imagem ou vídeo). */
  src: string
  /** Poster frame para vídeos, opcional. */
  poster?: string
  /** Texto alternativo — descreve a cena sem identificar o paciente. */
  alt: string
  /** Legenda curta exibida sobre a imagem no hover/lightbox. */
  caption: string
  /**
   * Aspect ratio do tile — usado pelo layout masonry assimétrico
   * da galeria (DESIGN.md §7.4). Mistura deliberada de 4:5, 1:1 e
   * 9:16 para quebrar simetria.
   */
  aspect: GalleryAspect
  /**
   * Se `true`, a mídia ainda não foi recebida e o componente
   * deve exibir um placeholder sinalizando "mídia pendente".
   */
  pending?: boolean
}

export const galleryItems: readonly GalleryItem[] = [
  {
    id: 'cirurgia-finalizada',
    kind: 'image',
    src: '/pacientes/cirurgia-finalizada.jpeg',
    alt: 'Momento final da cirurgia de alongamento ósseo, identidade preservada.',
    caption: 'Cirurgia finalizada',
    aspect: '4/5',
  },
  {
    id: 'cirurgia-curativo',
    kind: 'image',
    src: '/pacientes/cirurgia-curativo.jpeg',
    alt: 'Primeiro curativo após a cirurgia, cuidado clínico documentado com autorização.',
    caption: 'Primeiro curativo',
    aspect: '4/5',
  },
  {
    id: 'raio-x-pos-op',
    kind: 'image',
    src: '/pacientes/procedimento-raiox-1.jpeg',
    alt: 'Raio-X pós-operatório mostrando a haste intramedular Fitbone posicionada.',
    caption: 'Raio-X · pós-operatório',
    aspect: '9/16',
  },
  {
    id: 'pos-cirurgia-tibia',
    kind: 'image',
    src: '/pacientes/pos-cirurgia-tibia.jpeg',
    alt: 'Paciente em repouso após cirurgia na tíbia, identidade preservada.',
    caption: 'Pós-cirurgia · tíbia',
    aspect: '4/5',
  },
  {
    id: 'fisio-precoce',
    kind: 'image',
    src: '/pacientes/fisio-precoce.jpeg',
    alt: 'Paciente em sessão inicial de fisioterapia, retomada do movimento. Identidade preservada.',
    caption: 'Antes e depois',
    aspect: '4/5',
  },
  {
    id: 'raio-x-evolucao',
    kind: 'image',
    src: '/pacientes/procedimento-raiox-2.jpeg',
    alt: 'Raio-X intermediário acompanhando a evolução do alongamento ósseo.',
    caption: 'Raio-X · evolução',
    aspect: '9/16',
  },
  {
    id: 'dirigindo-normalmente',
    kind: 'video',
    src: '/pacientes/dirigindo-normalmente.mp4',
    alt: 'Paciente dirigindo com autonomia durante o tratamento — identidade preservada.',
    caption: 'Dirigindo normalmente',
    aspect: '9/16',
  },
  {
    id: 'raio-x-consolidacao',
    kind: 'image',
    src: '/pacientes/procedimento-raiox-3.jpeg',
    alt: 'Raio-X documentando a consolidação óssea após o alongamento.',
    caption: 'Raio-X · consolidação',
    aspect: '9/16',
  },
  {
    id: 'trabalho-normal',
    kind: 'video',
    src: '/pacientes/trabalho-normal.mp4',
    alt: 'Paciente em ambiente de trabalho, mantendo a rotina durante o tratamento — identidade preservada.',
    caption: 'Trabalhando normalmente',
    aspect: '4/5',
  },
]
