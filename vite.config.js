import { writeFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function buildCsp(apiUrl) {
  let apiOrigin = ''
  try {
    const { hostname, origin } = new URL(apiUrl)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      apiOrigin = origin
    }
  } catch {}

  const connectSrc = ["'self'", 'https://accounts.google.com', apiOrigin]
    .filter(Boolean)
    .join(' ')

  return [
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data: https://ui-avatars.com https://lh3.googleusercontent.com",
    `connect-src ${connectSrc}`,
    'frame-src https://accounts.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function cspPlugin() {
  let isBuild = false
  return {
    name: 'csp',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    transformIndexHtml(html) {
      const csp = buildCsp(process.env.VITE_API_BASE_URL ?? '')
      return html.replace(
        /(<meta\s+http-equiv="Content-Security-Policy"\s+content=")[^"]*(")/,
        (_, pre, post) => `${pre}${csp}${post}`,
      )
    },
    closeBundle() {
      if (!isBuild) return
      const csp = buildCsp(process.env.VITE_API_BASE_URL ?? '')
      writeFileSync(
        'dist/_headers',
        `/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: ${csp}\n`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: {
    proxy: { '/api': 'http://localhost:8000' },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  build: {
    sourcemap: false,
  },
})
