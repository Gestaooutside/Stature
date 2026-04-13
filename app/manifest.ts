import { MetadataRoute } from 'next'
import { BRAND, COLORS, SEO } from '@/lib/config/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} - ${BRAND.shortDescription}`,
    short_name: BRAND.name,
    description: BRAND.fullDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: COLORS.primary,
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: SEO.categories,
    lang: BRAND.lang,
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
  }
}
