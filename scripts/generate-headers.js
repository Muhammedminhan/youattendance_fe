import { mkdirSync, writeFileSync } from 'fs';

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

function netlifyHeaders(csp) {
  return (
    '/*\n' +
    '  X-Frame-Options: DENY\n' +
    '  X-Content-Type-Options: nosniff\n' +
    '  Referrer-Policy: strict-origin-when-cross-origin\n' +
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()\n' +
    `  Content-Security-Policy: ${csp}\n`
  );
}

function vercelConfig(csp) {
  return (
    JSON.stringify(
      {
        rewrites: [{ source: '/(.*)', destination: '/index.html' }],
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
    ) + '\n'
  );
}

function nginxConf(csp) {
  return (
    '# YOUAttendance — Nginx configuration\n' +
    '# 1. Copy your dist/ build to the server (e.g. /var/www/youattendance)\n' +
    '# 2. Paste this block inside your server { } block:\n' +
    '#      include /path/to/nginx-security-headers.conf;\n' +
    '# Re-run `node scripts/generate-headers.js` after changing VITE_API_BASE_URL.\n' +
    '\n' +
    'location / {\n' +
    '    root /var/www/youattendance;   # <- update to your actual dist path\n' +
    '    index index.html;\n' +
    '    try_files $uri $uri/ /index.html;  # SPA fallback routing\n' +
    '\n' +
    '    add_header X-Frame-Options "DENY" always;\n' +
    '    add_header X-Content-Type-Options "nosniff" always;\n' +
    '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n' +
    '    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;\n' +
    `    add_header Content-Security-Policy "${csp}" always;\n` +
    '}\n'
  );
}

const apiUrl = process.env.VITE_API_BASE_URL ?? '';

if (apiUrl) {
  try {
    new URL(apiUrl);
  } catch {
    console.error(
      `[generate-headers] ERROR: VITE_API_BASE_URL="${apiUrl}" is not a valid URL. Fix it and retry.`,
    );
    process.exit(1);
  }
}

const csp = buildCsp(apiUrl);

writeFileSync('public/_headers', netlifyHeaders(csp));
writeFileSync('vercel.json', vercelConfig(csp));

mkdirSync('deploy', { recursive: true });
writeFileSync('deploy/nginx-security-headers.conf', nginxConf(csp));

const apiOrigin = (() => {
  try {
    const { hostname, origin } = new URL(apiUrl);
    return hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' ? origin : null;
  } catch {
    return null;
  }
})();

console.log(
  apiOrigin
    ? `[generate-headers] connect-src includes API origin: ${apiOrigin}`
    : '[generate-headers] API is same-origin — connect-src uses self only',
);
