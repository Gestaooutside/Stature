import { ImageResponse } from 'next/og'
import { COLORS, PROFESSIONAL } from '@/lib/config/brand'

export const runtime = 'edge'
export const alt =
  'Stature Clinic: Alongamento Ósseo com Fitbone | Pioneiro no Brasil | Dr. David de Mello'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadCormorantGaramond(text: string, weight: 300 | 400) {
  const url = `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@${weight}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
  if (!match) throw new Error('Falha ao carregar Cormorant Garamond')
  const res = await fetch(match[1])
  if (!res.ok) throw new Error('Falha ao baixar arquivo da fonte')
  return await res.arrayBuffer()
}

export default async function OpenGraphImage() {
  const displayText = 'STATURE'
  const smallText = 'CLINIC'
  const allText =
    'STATURECLINICAlongamentoÓsseoFitbonePioneironoBrasil5capitaisConsultaonlineDr.DavidedMelloCRM72397RQE38488'

  const [fontLight, fontRegular] = await Promise.all([
    loadCormorantGaramond(allText, 300),
    loadCormorantGaramond(allText, 400),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `radial-gradient(circle at 50% 50%, ${COLORS.primary} 0%, ${COLORS.primaryDark} 70%, ${COLORS.primaryDarker} 100%)`,
          fontFamily: '"Cormorant Garamond", serif',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 172,
              fontWeight: 300,
              color: COLORS.accent,
              letterSpacing: 32,
              lineHeight: 1,
              paddingLeft: 32,
              display: 'flex',
            }}
          >
            {displayText}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 24,
              gap: 28,
            }}
          >
            <div
              style={{
                width: 180,
                height: 1,
                backgroundColor: COLORS.accent,
                opacity: 0.85,
              }}
            />
            <div
              style={{
                fontSize: 38,
                fontWeight: 400,
                color: COLORS.accent,
                letterSpacing: 18,
                paddingLeft: 18,
                opacity: 0.92,
                display: 'flex',
              }}
            >
              {smallText}
            </div>
            <div
              style={{
                width: 180,
                height: 1,
                backgroundColor: COLORS.accent,
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: '#e8f5f5',
              letterSpacing: 4,
              opacity: 0.88,
              display: 'flex',
            }}
          >
            Alongamento Ósseo com Fitbone · Pioneiro no Brasil
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: COLORS.accent,
              letterSpacing: 2,
              opacity: 0.72,
              display: 'flex',
            }}
          >
            {PROFESSIONAL.prefix} {PROFESSIONAL.fullName} · {PROFESSIONAL.registry}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Cormorant Garamond',
          data: fontLight,
          style: 'normal',
          weight: 300,
        },
        {
          name: 'Cormorant Garamond',
          data: fontRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
