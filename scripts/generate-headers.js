import { writeFileSync } from 'fs';

function buildCsp(apiUrl) {
  let apiOrigin = '';
  try {
    const { hostname, origin } = new URL(apiUrl);
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      apiOrigin = origin;
    }
  } catch {}

  const connectSrc = ["'self'", 'https://accounts.google.com', apiOrigin]
    .filter(Boolean)
    .join(' ');

  return [
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data: https://ui-avatars.com https://lh3.googleusercontent.com",
    `connect-src ${connectSrc}`,
    'frame-src https://accounts.google.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const apiUrl = process.env.VITE_API_BASE_URL ?? '';
const csp = buildCsp(apiUrl);

writeFileSync(
  'public/_headers',
  `/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: ${csp}\n`,
);

writeFileSync(
  'vercel.json',
  JSON.stringify(
    {
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            { key: 'Content-Security-Policy', value: csp },
          ],
        },
      ],
    },
    null,
    2,
  ) + '\n',
);

const origin = apiUrl && (() => { try { const {hostname, origin} = new URL(apiUrl); return hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' ? origin : null; } catch { return null; } })();
console.log(origin
  ? `[generate-headers] connect-src includes API origin: ${origin}`
  : '[generate-headers] API is same-origin — connect-src uses self only',
);
