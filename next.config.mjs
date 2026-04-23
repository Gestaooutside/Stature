/** @type {import('next').NextConfig} */
import { createRequire } from 'node:module'
import { appendFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const sessionId = 'debug-session'
const runId = 'pre-fix'
const logEndpoint = 'http://127.0.0.1:7242/ingest/f58b6234-524f-4020-94d6-9289689b59a1'
const logPath = resolve(process.cwd(), '.cursor', 'debug.log')

const writeLocalLog = (payload) => {
  try {
    mkdirSync(resolve(process.cwd(), '.cursor'), { recursive: true })
    appendFileSync(logPath, `${JSON.stringify(payload)}\n`)
  } catch {
    // silencioso para não quebrar build
  }
}

const sendDebugLog = (hypothesisId, message, data) => {
  const payload = {
    sessionId,
    runId,
    hypothesisId,
    location: 'next.config.mjs',
    message,
    data,
    timestamp: Date.now(),
  }

  // garante log em fs mesmo que fetch não exista
  const sendFs = (transport) => writeLocalLog({ ...payload, transport })

  try {
    if (typeof fetch === 'function') {
      fetch(logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(() => sendFs('http'))
        .catch(() => sendFs('fs-fallback'))
    } else {
      sendFs('fs-no-fetch')
    }
  } catch {
    sendFs('fs-error')
  }
}

// #region agent log
writeLocalLog({
  sessionId,
  runId,
  hypothesisId: 'H0',
  location: 'next.config.mjs',
  message: 'Config file loaded',
  data: { cwd: process.cwd(), logPath },
  timestamp: Date.now(),
  transport: 'fs-init',
})
// #endregion

// #region agent log
sendDebugLog('H1', 'Next.js version at config load', {
  nextVersion: pkg.dependencies?.next,
  nodeVersion: process.version,
})
// #endregion

// #region agent log
sendDebugLog('H2', 'Build environment flags', {
  vercel: Boolean(process.env.VERCEL),
  nextPhase: process.env.NEXT_PHASE ?? null,
  env: process.env.NODE_ENV ?? null,
})
// #endregion

// #region agent log
sendDebugLog('H3', 'Baseline browser mapping dev dependency', {
  baselineVersion: pkg.devDependencies?.['baseline-browser-mapping'] ?? null,
})
// #endregion

// #region agent log
sendDebugLog('H4', 'TypeScript dev dependency version', {
  typescriptVersion: pkg.devDependencies?.typescript ?? null,
})
// #endregion

// #region agent log
sendDebugLog('H5', 'Log transport check', {
  cwd: process.cwd(),
  logPath,
  fetchDefined: typeof fetch === 'function',
})
// #endregion

// #region agent log
sendDebugLog('H6', 'Ensured log directory exists', {
  logDir: resolve(process.cwd(), '.cursor'),
})
// #endregion

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Otimização habilitada - Next.js irá converter para WebP/AVIF automaticamente
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig