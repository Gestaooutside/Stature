import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DUO NATURAL - Controle da Ansiedade e Compulsão Alimentar',
    short_name: 'DUO NATURAL',
    description: 'Sistema natural 360º para controle de ansiedade, compulsão alimentar e sono profundo. 100% natural, sem dependência.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#a89a8d',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/apple-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['health', 'lifestyle', 'wellness'],
    lang: 'pt-BR',
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
  }
}
