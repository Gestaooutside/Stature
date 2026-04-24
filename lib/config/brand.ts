/**
 * ============================================================
 * BRAND CONFIGURATION - STATURE CLINIC
 * ============================================================
 *
 * Fonte única de verdade para a identidade visual, textos e
 * contatos do site institucional da Stature Clinic,
 * Alongamento Ósseo (médico responsável: Dr. David de Mello).
 * ============================================================
 */

// ─── IDENTIDADE DA MARCA ─────────────────────────────────────

export const BRAND = {
  name: 'Stature Clinic',
  shortName: 'Stature',
  tagline: 'Clínica de Alongamento Ósseo',
  shortDescription:
    'Stature Clinic, Alongamento Ósseo com Fitbone em São Paulo, BH, Brasília, Fortaleza e Florianópolis',
  fullDescription:
    'Stature Clinic: clínica especializada em alongamento ósseo e aumento de estatura com a tecnologia Fitbone, haste intramedular motorizada aprovada pela Anvisa. Atendimento cirúrgico em cinco capitais e consulta online para todo o Brasil. Médico responsável: Dr. David de Mello, pioneiro no Brasil em alongamento com Fitbone.',
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
  bio: 'Médico ortopedista com graduação e residência em Ortopedia e Traumatologia pela Pontifícia Universidade Católica de São Paulo (PUC-SP) e especialização em Alongamento e Reconstrução Óssea pela Escola Paulista de Medicina (UNIFESP). Pioneiro no Brasil em alongamento ósseo com Fitbone, haste intramedular motorizada aprovada pela Anvisa, e referência na América Latina, com mais de 400 pacientes operados. Atende cirurgicamente em cinco capitais (São Paulo, Belo Horizonte, Brasília, Fortaleza e Florianópolis) e oferece consulta 100% online para pacientes de qualquer cidade do Brasil. Registrado sob CRM-MG 72397 e RQE 38488.',
} as const

// ─── DOMÍNIO E URLs ──────────────────────────────────────────

export const URLS = {
  domain: 'https://statureclinic.com.br',
  twitterHandle: '@daviddemello.orto',
} as const

// ─── CORES DA MARCA ──────────────────────────────────────────

export const COLORS = {
  primary: '#0F2A1D',
  primaryDark: '#0F2A1D',
  primaryDarker: '#081A12',
  secondary: '#3A5243',
  accent: '#D9C89E',
  accentHover: '#C5B485',
  surface: '#F5EFE4',
  textOnDark: '#EDE4D0',
  textOnLight: '#0F2A1D',
  forestFrom: '#0F2A1D',
  forestTo: '#1B3A2A',
} as const

// ─── LOGO ────────────────────────────────────────────────────

export const LOGO = {
  light: '/logo-stature.svg',
  dark: '/logo-stature-dark.svg',
  alt: 'Stature Clinic, Alongamento Ósseo',
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
  ogImage: '/logo-stature.svg',
  doctor: '/Dr-david-melo.jpeg',
  hospital: '/hospital.jpg',
  procedures: {
    femur: '/proc-femur-new.png',
    tibia: '/proc-tibia-lon.png',
    correction: '/proc-correcao-new.png',
  },
  fitboneVideo: '/fitbone-video-explicativo.mp4',
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
    'Olá, vim pelo site da Stature Clinic e gostaria de saber mais sobre o alongamento ósseo!',
  whatsappUrl:
    'https://wa.me/5534991649910?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Stature%20Clinic%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20alongamento%20%C3%B3sseo!',
  email: 'contato@stature.clinic',
  partnershipMessage:
    'Olá, vim pelo site da Stature Clinic e gostaria de saber mais sobre o alongamento ósseo!',
} as const

// ─── CIDADES COM CIRURGIA DISPONÍVEL ─────────────────────────

export interface CityInfo {
  id: string
  name: string
  state: string
  label: string
  /**
   * Coordenadas normalizadas (0–1) usadas pelo mini-mapa do Brasil.
   * Referência aproximada sobre uma bounding box simples do país.
   */
  pin: { x: number; y: number }
}

// Coordenadas derivadas de lat/long reais projetadas sobre a bounding box do
// Brasil (long [-73.9, -34.8] × lat [5.2, -33.75]), batem com o contorno em
// components/cities-strip.tsx. Ajustes manuais de ±0.01 evitam que o pino fique
// no exato limite do traçado.
export const CITIES: readonly CityInfo[] = [
  { id: 'sao-paulo',     name: 'São Paulo',     state: 'SP', label: 'São Paulo, SP',     pin: { x: 0.705, y: 0.737 } },
  { id: 'belo-horizonte',name: 'Belo Horizonte',state: 'MG', label: 'Belo Horizonte, MG',pin: { x: 0.773, y: 0.645 } },
  { id: 'fortaleza',     name: 'Fortaleza',     state: 'CE', label: 'Fortaleza, CE',     pin: { x: 0.895, y: 0.245 } },
  { id: 'florianopolis', name: 'Florianópolis', state: 'SC', label: 'Florianópolis, SC', pin: { x: 0.640, y: 0.835 } },
  { id: 'brasilia',      name: 'Brasília',      state: 'DF', label: 'Brasília, DF',      pin: { x: 0.665, y: 0.540 } },
] as const

// ─── LOCALIZAÇÃO (cidade-sede referência / compat) ───────────

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
    'Cirurgia realizada em cinco capitais e consulta online para qualquer cidade do Brasil.',
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
  title:
    'Stature Clinic: Alongamento Ósseo com Fitbone | Dr. David de Mello, Pioneiro no Brasil',
  description:
    'Alongamento ósseo e aumento de estatura com Fitbone, haste intramedular motorizada aprovada pela Anvisa. Pioneiro no Brasil, referência na América Latina, +400 pacientes operados. Cirurgia em São Paulo, Belo Horizonte, Brasília, Fortaleza e Florianópolis. Consulta online para todo o Brasil.',
  keywords: [
    'Stature Clinic',
    'Stature',
    'Fitbone Brasil',
    'Fitbone alongamento ósseo',
    'alongamento ósseo com Fitbone',
    'aumento de estatura',
    'alongamento ósseo São Paulo',
    'aumento de estatura Belo Horizonte',
    'alongamento ósseo Fortaleza',
    'alongamento ósseo Florianópolis',
    'alongamento ósseo Brasília',
    'haste intramedular motorizada',
    'Método LON',
    'Dr David de Mello',
    'pioneiro Fitbone Brasil',
    'referência alongamento América Latina',
    'cirurgia ortopédica',
    'ortopedia',
    'discrepância de membros',
  ],
  ogTitle: 'Stature Clinic: Alongamento Ósseo com Fitbone | Pioneiro no Brasil',
  ogDescription:
    'Fitbone, haste motorizada aprovada pela Anvisa. +400 pacientes operados. Cirurgia em 5 capitais, consulta online nacional. Dr. David de Mello, referência na América Latina.',
  twitterDescription:
    'Fitbone no Brasil · Haste motorizada Anvisa · +400 pacientes · 5 capitais · Dr. David de Mello.',
  categories: ['medical', 'health', 'orthopedics'] as string[],
} as const

// ─── CREDENCIAIS / AUTORIDADE ────────────────────────────────
// Faixa de estatísticas exibida abaixo do hero / trust-bar.

export interface CredentialStat {
  id: string
  value: string
  label: string
}

export const CREDENTIALS: readonly CredentialStat[] = [
  {
    id: 'pioneiro',
    value: '1º',
    label: 'Pioneiro no Brasil em alongamento com Fitbone',
  },
  {
    id: 'america-latina',
    value: 'LATAM',
    label: 'Referência na América Latina',
  },
  {
    id: 'pacientes',
    value: '+400',
    label: 'Pacientes operados',
  },
  {
    id: 'premios',
    // TODO: Substituir por total real de prêmios quando os nomes forem fornecidos.
    value: 'Int.',
    label: 'Premiações internacionais',
  },
] as const

/**
 * Lista de premiações internacionais. Placeholder, substituir
 * pelos nomes oficiais dos prêmios ao recebê-los do Dr. David.
 */
export const AWARDS: readonly string[] = [
  // TODO: preencher com prêmios reais (ex.: "Best Limb Reconstruction Paper — ILLRS 2023")
] as const

// ─── MÉTRICAS DE CONFIANÇA (TRUST BAR) ───────────────────────

export const TRUST_METRICS = {
  hospital: 'Fitbone',
  hospitalLabel: 'Haste motorizada aprovada pela Anvisa',
  technique: 'Pioneiro',
  techniqueLabel: 'Primeiro no Brasil em Fitbone',
  crm: 'CRM-MG 72397',
  crmLabel: 'RQE 38488 · Ortopedia e Traumatologia',
  reach: '5 capitais',
  reachLabel: 'Cirurgia em SP, BH, Brasília, Fortaleza e Floripa',
} as const

// ─── NÚMEROS PADRÃO DE ALONGAMENTO ───────────────────────────

export const LENGTHENING = {
  femur: '8 cm',
  tibia: '6 cm',
  /** Copy padrão — manter idêntica em todo o site. */
  summary:
    'Alongamento médio de 8 cm no fêmur e 6 cm na tíbia. O tratamento pode ser feito no fêmur, na tíbia ou em ambos.',
  disclaimer:
    'Resultados variam conforme idade, biologia individual, estado nutricional, tabagismo e outros fatores.',
} as const

// ─── DEPOIMENTOS ─────────────────────────────────────────────
// Público-alvo: homens, 18–45 anos, altura 160–170cm.
// Placeholders recalibrados, substituir por depoimentos reais
// autorizados assim que disponíveis.

export const TESTIMONIALS = [
  {
    author: {
      name: 'Paciente L., 26 anos',
      handle: 'São Paulo, SP · 168 cm',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    },
    text: 'O Fitbone mudou tudo. Sem ferragem aparecendo, dormia de lado normalmente, voltei à academia cedo. Ganhei 8 cm no fêmur e hoje continuo treinando pesado, como antes.',
  },
  {
    author: {
      name: 'Paciente M., 31 anos',
      handle: 'Belo Horizonte, MG · 165 cm',
      avatar:
        'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Pesquisei muito antes de decidir e o que pesou foi o Dr. David ser referência e a técnica ser minimamente invasiva. Dirigi, trabalhei e fiz fisio sozinho durante quase todo o tratamento.',
  },
  {
    author: {
      name: 'Paciente R., 29 anos',
      handle: 'Fortaleza, CE · 170 cm',
      avatar:
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Cicatrizes mínimas, sem controle externo a carregar. O controle remoto do Fitbone ainda me impressiona. Aos 6 meses já estava correndo de novo.',
  },
  {
    author: {
      name: 'Paciente T., 35 anos',
      handle: 'Florianópolis, SC · 162 cm',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Consulta online antes, cirurgia em casa. O Dr. David e a equipe explicaram cada etapa. Voltei ao trabalho durante o tratamento, nunca imaginei que seria assim.',
  },
  {
    author: {
      name: 'Paciente J., 23 anos',
      handle: 'Brasília, DF · 166 cm',
      avatar:
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Academia para membros inferiores liberada desde cedo, fisio precoce, desconforto muito menor do que eu esperava. O resultado estético e funcional superou tudo.',
  },
  {
    author: {
      name: 'Paciente D., 40 anos',
      handle: 'São Paulo, SP · 169 cm',
      avatar:
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
    },
    text: 'Aos 40, era importante voltar a correr e ao futebol. Aos 6 meses o Dr. David liberou impacto. Hoje faço tudo que fazia antes, com alguns centímetros a mais.',
  },
] as const

// ─── COPY / TEXTOS DE MARKETING ──────────────────────────────

export const COPY = {
  hero: {
    // Canonical mixed-weight headline (DESIGN.md §6)
    headline1: 'Mais altura.',
    headline2: 'Mesma vida.',
    subtitle1: 'Segurança, ciência e tecnologia de ponta.',
    subtitle2: 'Aumento de estatura com a tecnologia Fitbone.',
    description:
      'Haste intramedular motorizada, controlada por controle remoto. Nada externo ao corpo. Vida normal durante e depois do tratamento.',
    highlight: 'Pioneiro no Brasil em Fitbone · 5 capitais · Consulta online nacional',
    cta: 'Fale comigo no WhatsApp',
    ctaSecondary: 'Conheça as técnicas',
  },
  about: {
    badge: 'Sobre o Médico',
    title: 'Dr. David de Mello',
    subtitle: 'Ortopedia e Alongamento Ósseo',
    description: PROFESSIONAL.bio,
    highlights: [
      'Pioneiro no Brasil em alongamento com Fitbone',
      'Referência na América Latina · +400 pacientes',
      'Cirurgia em 5 capitais · Consulta online nacional',
    ],
    cta: 'Agende sua consulta',
  },
  products: {
    title: 'Nossos',
    titleItalic: 'Procedimentos',
    description:
      'Alongamento ósseo para aumento de estatura e correção de discrepâncias. Alongamento médio de 8 cm no fêmur e 6 cm na tíbia. O tratamento pode ser feito no fêmur, na tíbia ou em ambos.',
  },
  testimonials: {
    title: 'O que nossos pacientes dizem',
    description:
      'Histórias reais de homens que recuperaram confiança e presença através do alongamento ósseo com Fitbone.',
  },
  ingredients: {
    title: 'Técnica e',
    titleItalic: 'diferenciais',
    titleSuffix: '',
    description:
      'Conheça a técnica empregada pelo Dr. David: Fitbone motorizado (interno, invisível), reabilitação integrada desde o primeiro dia e retorno à rotina durante o próprio tratamento.',
    scienceNote:
      'O Fitbone é uma haste intramedular motorizada, controlada externamente por controle remoto, sem hardware aparente, com cicatrizes mínimas e desconforto muito menor que os métodos tradicionais.',
    scienceFooter:
      'Todos os protocolos seguem diretrizes internacionais de segurança e reabilitação em cirurgia reconstrutiva.',
  },
  techniques: {
    badge: 'Técnicas Cirúrgicas',
    title: 'Duas técnicas,',
    titleItalic: 'uma decisão conjunta.',
    description:
      'Apresentamos as duas opções cirúrgicas disponíveis. Na consulta, definimos juntos qual é a melhor para o seu caso.',
    cta: 'Descubra qual técnica é ideal para você',
  },
  rehab: {
    badge: 'Reabilitação',
    title: 'Do primeiro dia',
    titleItalic: 'ao impacto pleno.',
    description:
      'Protocolo estruturado que mantém sua rotina: trabalho, fisioterapia, academia e autonomia desde o início.',
  },
  gallery: {
    badge: 'Rotina Real',
    title: 'A vida durante',
    titleItalic: 'o tratamento.',
    description:
      'Pacientes reais do Dr. David ao longo da jornada: cirurgia, imagens médicas, cuidados pós-operatórios, fisioterapia e retomada da rotina com direção e trabalho. Identidades preservadas.',
  },
  cities: {
    title: 'Cirurgia em 5 capitais',
    titleItalic: '· Consulta online nacional',
    description:
      'Procedimento cirúrgico realizado em São Paulo, Belo Horizonte, Brasília, Fortaleza e Florianópolis. Consulta 100% online disponível para qualquer cidade do Brasil.',
  },
  faq: {
    titlePrefix: 'Dúvidas',
    titleItalic: 'frequentes',
    description:
      'Respostas para as perguntas mais comuns sobre Fitbone, técnica, recuperação e cidades de atendimento.',
    cta: 'Fale comigo no WhatsApp',
    ctaQuestion: 'Ainda tem dúvidas? Fale diretamente comigo:',
  },
  contact: {
    badge: 'Entre em Contato',
    titlePrefix: 'Vamos',
    titleItalic: 'conversar',
    description:
      'Envie uma mensagem pelo WhatsApp ou agende consulta 100% online. Cirurgia disponível em São Paulo, Belo Horizonte, Brasília, Fortaleza e Florianópolis.',
    cta: 'Fale comigo no WhatsApp',
    airportNote:
      'Consulta 100% online disponível para qualquer cidade do Brasil.',
  },
  finalCta: {
    headline1: 'Pronto para dar o próximo passo?',
    headline2: 'Fale diretamente comigo.',
    subheadline:
      'Atendimento humanizado, avaliação criteriosa e acompanhamento completo.',
    cta: 'Fale comigo no WhatsApp',
    badges: ['Fitbone · Anvisa', '5 capitais', 'Consulta online Brasil'],
  },
} as const

// ─── FOOTER ──────────────────────────────────────────────────

export const FOOTER_CONFIG = {
  sections: [
    {
      title: 'Navegação',
      links: [
        { name: 'Sobre o Médico', href: '#sobre' },
        { name: 'Técnicas', href: '#tecnicas' },
        { name: 'Procedimentos', href: '#procedimento' },
        { name: 'Resultados', href: '#resultados' },
        { name: 'Recuperação', href: '#recuperacao' },
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
      title: 'Cidades',
      links: [
        { name: 'São Paulo · SP', href: '#contato' },
        { name: 'Belo Horizonte · MG', href: '#contato' },
        { name: 'Fortaleza · CE', href: '#contato' },
        { name: 'Florianópolis · SC', href: '#contato' },
        { name: 'Brasília · DF', href: '#contato' },
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
  { label: 'Técnicas', href: '#tecnicas' },
  { label: 'Procedimento', href: '#procedimento' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Recuperação', href: '#recuperacao' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contato', href: '#contato' },
] as const
