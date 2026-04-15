/**
 * ============================================================
 * BRAND CONFIGURATION - STATURA CLINIC
 * ============================================================
 *
 * Fonte única de verdade para a identidade visual, textos e
 * contatos do site institucional da Statura Clinic —
 * Alongamento Ósseo (médico responsável: Dr. David de Mello).
 *
 * Os nomes dos exports (BRAND, COLORS, LOGO, IMAGES, CONTACT,
 * SOCIAL, SEO, COPY, FOOTER_CONFIG, TESTIMONIALS, TRUST_METRICS,
 * URLS, DEVELOPER) são preservados para continuar compatíveis
 * com a estrutura white-label da Base 1.
 * ============================================================
 */

// ─── IDENTIDADE DA MARCA ─────────────────────────────────────

export const BRAND = {
  name: 'Statura Clinic',
  shortName: 'Statura',
  tagline: 'Clínica de Alongamento Ósseo',
  shortDescription: 'Statura Clinic, Alongamento Ósseo em Uberlândia-MG',
  fullDescription:
    'Statura Clinic: clínica especializada em alongamento ósseo e aumento de estatura com técnica minimamente invasiva. Médico responsável: Dr. David de Mello. Hospital Orthomed Center, Uberlândia-MG.',
  lang: 'pt-BR',
  foundedYear: '2026',
} as const

// ─── PROFISSIONAL ────────────────────────────────────────────

export const PROFESSIONAL = {
  prefix: 'Dr.',
  firstName: 'David',
  lastName: 'de Mello',
  fullName: 'David de Mello',
  specialty: 'Ortopedia e Traumatologia, Alongamento Ósseo',
  crm: 'CRM-MG 72397',
  rqe: 'RQE 38488',
  registry: 'CRM-MG 72397 · RQE 38488',
  education: [
    'Graduação e residência em Ortopedia e Traumatologia pela Pontifícia Universidade Católica de São Paulo (PUC-SP).',
    'Especialização em Alongamento e Reconstrução Óssea e Correção de Deformidades com Fixadores Externos pela Escola Paulista de Medicina (UNIFESP).',
  ],
  bio: 'Médico ortopedista com graduação e residência em Ortopedia e Traumatologia pela Pontifícia Universidade Católica de São Paulo (PUC-SP) e especialização em Alongamento e Reconstrução Óssea e Correção de Deformidades com Fixadores Externos pela Escola Paulista de Medicina (UNIFESP). Atua no Hospital Orthomed Center, em Uberlândia-MG, com foco em alongamento ósseo e aumento de estatura utilizando técnica minimamente invasiva (fixador externo linear monolateral + haste intramedular). Registrado sob CRM-MG 72397 e RQE 38488.',
} as const

// ─── DOMÍNIO E URLs ──────────────────────────────────────────

export const URLS = {
  domain: 'https://staturaclinic.com.br',
  twitterHandle: '@daviddemello.orto',
} as const

// ─── CORES DA MARCA ──────────────────────────────────────────

export const COLORS = {
  // Quiet-luxury palette extracted from the Statura mark
  primary: '#0F2A1D', // Deep forest — backgrounds, header, footer
  primaryDark: '#0F2A1D', // Alias preservado para compat
  primaryDarker: '#081A12', // Deep shadow — base absoluta
  secondary: '#3A5243', // Muted sage — borders, dividers
  accent: '#D9C89E', // Champagne gold — typography accent
  accentHover: '#C5B485', // Champagne pressed
  surface: '#F5EFE4', // Soft ivory — secondary surfaces
  textOnDark: '#EDE4D0',
  textOnLight: '#0F2A1D',
  forestFrom: '#0F2A1D',
  forestTo: '#1B3A2A',
} as const

// ─── LOGO ────────────────────────────────────────────────────

export const LOGO = {
  // light = logo de cor clara, para fundos escuros (hero, footer)
  light: '/logo-statura.svg',
  // dark = logo de cor escura, para fundos claros (header)
  dark: '/logo-statura-dark.svg',
  alt: 'Statura Clinic, Alongamento Ósseo',
  // Proporção 4:1 matches viewBox recortado dos SVGs (880 x 220).
  headerWidth: 240,
  headerHeight: 60,
  heroWidth: 532,
  heroHeight: 133,
  footerWidth: 344,
  footerHeight: 86,
} as const

// ─── IMAGENS ─────────────────────────────────────────────────

export const IMAGES = {
  hero: { desktop: '/hero-section.jpg', mobile: '/hero-section-mobile.jpg' },
  // OG image agora é gerada dinamicamente em app/opengraph-image.tsx
  // (Next.js file convention). Este campo é mantido para fallback/schema.
  ogImage: '/logo-statura.svg',
  doctor: '/David-de-Melo-Marin.jpg',
  hospital: '/hospital.jpg',
  procedures: {
    femur: '/proc-femur.png',
    tibia: '/proc-tibia.png',
    correction: '/proc-correcao.png',
  },
} as const

// ─── CONTATO ─────────────────────────────────────────────────

export const CONTACT = {
  phone: '(34) 3233-0555',
  phoneDisplay: '+55 34 3233-0555',
  mobile: '(34) 99164-9910',
  mobileDisplay: '+55 34 99164-9910',
  whatsappSales: '5534991649910',
  whatsappSupport: '5534991649910',
  whatsappPartnership: '5534991649910',
  whatsappMessage:
    'Olá, vim pelo site da Statura Clinic e gostaria de saber mais sobre o alongamento ósseo!',
  whatsappUrl:
    'https://wa.me/5534991649910?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Statura%20Clinic%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20alongamento%20%C3%B3sseo!',
  email: 'contato@statura.clinic', // TODO: confirmar email final
  partnershipMessage:
    'Olá, vim pelo site da Statura Clinic e gostaria de saber mais sobre o alongamento ósseo!',
} as const

// ─── LOCALIZAÇÃO ─────────────────────────────────────────────

export const LOCATION = {
  hospital: 'Hospital Orthomed Center',
  address: 'Av. Rondon Pacheco, 555',
  city: 'Uberlândia',
  state: 'MG',
  country: 'BR',
  zipCode: '38400-000',
  fullAddress: 'Av. Rondon Pacheco, 555, Uberlândia, MG',
  hasAirport: true,
  airportNote:
    'Uberlândia tem aeroporto com voos para diversas cidades do país.',
  googleMapsEmbed: '',
} as const

// ─── REDES SOCIAIS ───────────────────────────────────────────

export const SOCIAL = {
  instagram: 'https://instagram.com/daviddemello.orto',
  instagramHandle: '@daviddemello.orto',
  twitter: '#',
  facebook: '#',
  schemaUrls: ['https://instagram.com/daviddemello.orto'],
} as const

// ─── DESENVOLVEDOR ───────────────────────────────────────────

export const DEVELOPER = {
  name: 'Matheus Alves',
  whatsapp: '5561999230677',
} as const

// ─── SEO E METADATA ──────────────────────────────────────────

export const SEO = {
  title: 'Statura Clinic: Alongamento Ósseo com Dr. David de Mello | Uberlândia-MG',
  description:
    'Statura Clinic: clínica especializada em alongamento ósseo e aumento de estatura. Técnica minimamente invasiva com fixador externo + haste intramedular. Médico responsável: Dr. David de Mello. Hospital Orthomed Center, Uberlândia-MG.',
  keywords: [
    'Statura Clinic',
    'Statura',
    'alongamento ósseo',
    'aumento de estatura',
    'cirurgia ortopédica',
    'fixador externo',
    'haste intramedular',
    'Dr David de Mello',
    'Uberlândia',
    'Orthomed Center',
    'ortopedia',
    'discrepância de membros',
  ],
  ogTitle: 'Statura Clinic: Alongamento Ósseo | Uberlândia-MG',
  ogDescription:
    'Statura Clinic: alongamento ósseo e aumento de estatura com técnica minimamente invasiva. Médico responsável: Dr. David de Mello. Hospital Orthomed Center, Uberlândia-MG.',
  twitterDescription:
    'Statura Clinic: alongamento ósseo e aumento de estatura com técnica minimamente invasiva. Uberlândia-MG.',
  categories: ['medical', 'health', 'orthopedics'] as string[],
} as const

// ─── MÉTRICAS DE CONFIANÇA (TRUST BAR) ───────────────────────

export const TRUST_METRICS = {
  hospital: 'Orthomed',
  hospitalLabel: 'Hospital Orthomed Center',
  technique: 'Minimamente',
  techniqueLabel: 'Técnica Minimamente Invasiva',
  crm: 'CRM-MG 72397',
  crmLabel: 'RQE 38488 · Ortopedia e Traumatologia',
  reach: 'Brasil',
  reachLabel: 'Pacientes de Todo o Brasil',
} as const

// ─── DEPOIMENTOS ─────────────────────────────────────────────
// Placeholders — substituir por depoimentos reais com autorização dos pacientes.

export const TESTIMONIALS = [
  {
    author: {
      name: 'Paciente A., 29 anos',
      handle: 'São Paulo, SP',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    },
    text: 'O procedimento mudou minha vida. A equipe do Dr. David foi excepcional e o acompanhamento impecável do início ao fim. Já estou com vida normal, correndo e voltando à academia.',
  },
  {
    author: {
      name: 'Paciente B., 34 anos',
      handle: 'Rio de Janeiro, RJ',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Pesquisei bastante antes de decidir. A técnica minimamente invasiva e o atendimento humano do Dr. David fizeram toda a diferença. Recomendo muito.',
  },
  {
    author: {
      name: 'Paciente C., 27 anos',
      handle: 'Belo Horizonte, MG',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
    text: 'O que mais me marcou foi a clareza nas explicações e a tranquilidade em cada etapa. A reabilitação foi bem conduzida e hoje vivo sem limitações.',
  },
  {
    author: {
      name: 'Paciente D., 31 anos',
      handle: 'Brasília, DF',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Dr. David é um profissional diferenciado. Ciência, técnica e empatia em cada consulta. O resultado superou minhas expectativas.',
  },
  {
    author: {
      name: 'Paciente E., 38 anos',
      handle: 'Curitiba, PR',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Saí de Curitiba só pela referência do Dr. David. Valeu cada quilômetro percorrido. O cuidado com o paciente é impecável.',
  },
  {
    author: {
      name: 'Paciente F., 42 anos',
      handle: 'Porto Alegre, RS',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    text: 'A correção da diferença entre as pernas me devolveu a confiança. Dr. David explicou tudo com paciência e conduziu o processo com maestria.',
  },
] as const

// ─── COPY / TEXTOS DE MARKETING ──────────────────────────────

export const COPY = {
  hero: {
    subtitle1: 'Segurança, ciência e tecnologia de ponta.',
    subtitle2: 'Aumento de estatura com técnica minimamente invasiva.',
    description:
      'Fixador externo linear monolateral + haste intramedular. Vida normal durante e depois do tratamento.',
    highlight: 'Uberlândia-MG · Hospital Orthomed Center',
    cta: 'Fale comigo no WhatsApp',
    ctaSecondary: 'Conheça o procedimento',
  },
  about: {
    badge: 'Sobre o Médico',
    title: 'Dr. David de Mello',
    subtitle: 'Ortopedia e Alongamento Ósseo',
    description: PROFESSIONAL.bio,
    highlights: [
      'Atendo pacientes de todo o Brasil',
      'Hospital Orthomed Center, Uberlândia-MG',
      'Técnica minimamente invasiva',
    ],
    cta: 'Agende sua consulta',
  },
  products: {
    title: 'Nossos',
    titleItalic: 'Procedimentos',
    description:
      'Alongamento ósseo para aumento de estatura e correção de discrepâncias, com técnica minimamente invasiva, cálculo de proporcionalidade e reabilitação integrada.',
  },
  testimonials: {
    title: 'O que nossos pacientes dizem',
    description:
      'Histórias reais de pessoas que recuperaram confiança e qualidade de vida através do alongamento ósseo.',
  },
  ingredients: {
    title: 'Técnica e',
    titleItalic: 'diferenciais',
    titleSuffix: '',
    description:
      'Conheça a técnica empregada pelo Dr. David: minimamente invasiva, cientificamente embasada e com reabilitação integrada desde o primeiro dia.',
    scienceNote:
      'A combinação de fixador externo linear monolateral com haste intramedular permite um processo de alongamento mais leve, previsível e com menor tempo de fixador externo.',
    scienceFooter:
      'Todos os protocolos seguem diretrizes internacionais de segurança e reabilitação em cirurgia reconstrutiva.',
  },
  faq: {
    titlePrefix: 'Dúvidas',
    titleItalic: 'frequentes',
    description:
      'Respostas para as perguntas mais comuns sobre alongamento ósseo, técnica e reabilitação.',
    cta: 'Fale comigo no WhatsApp',
    ctaQuestion: 'Ainda tem dúvidas? Fale diretamente comigo:',
  },
  contact: {
    badge: 'Entre em Contato',
    titlePrefix: 'Vamos',
    titleItalic: 'conversar',
    description:
      'Envie uma mensagem pelo WhatsApp ou visite o consultório no Hospital Orthomed Center em Uberlândia-MG.',
    cta: 'Fale comigo no WhatsApp',
    airportNote:
      'Uberlândia tem aeroporto com voos diários para diversas capitais do país.',
  },
  finalCta: {
    headline1: 'Pronto para dar o próximo passo?',
    headline2: 'Fale diretamente comigo.',
    subheadline:
      'Atendimento humanizado, avaliação criteriosa e acompanhamento completo.',
    cta: 'Fale comigo no WhatsApp',
    badges: ['Minimamente invasivo', 'Acompanhamento completo', 'Pacientes de todo Brasil'],
  },
} as const

// ─── FOOTER ──────────────────────────────────────────────────

export const FOOTER_CONFIG = {
  sections: [
    {
      title: 'Navegação',
      links: [
        { name: 'Sobre o Médico', href: '#sobre' },
        { name: 'Procedimento', href: '#procedimento' },
        { name: 'Resultados', href: '#resultados' },
        { name: 'Técnica', href: '#tecnica' },
      ],
    },
    {
      title: 'Informações',
      links: [
        { name: 'Dúvidas Frequentes', href: '#faq' },
        { name: 'Contato', href: '#contato' },
        { name: 'WhatsApp', href: CONTACT.whatsappUrl },
        { name: 'Instagram', href: SOCIAL.instagram },
      ],
    },
    {
      title: 'Consultório',
      links: [
        { name: LOCATION.hospital, href: '#contato' },
        { name: LOCATION.fullAddress, href: '#contato' },
        { name: PROFESSIONAL.crm, href: '#sobre' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Política de Privacidade', href: '#privacy', type: 'legal' },
        { name: 'Termos de Uso', href: '#terms', type: 'legal' },
      ],
    },
  ],
} as const

// ─── NAVEGAÇÃO (HEADER) ──────────────────────────────────────

export const NAVIGATION = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Procedimento', href: '#procedimento' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Técnica', href: '#tecnica' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contato', href: '#contato' },
] as const
