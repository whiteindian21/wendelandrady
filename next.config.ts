// next.config.mjs (or .js)
/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      // SaaS Production Readiness Check — standalone HTML in public/,
      // served at /check with the URL unchanged (rewrite, not redirect).
      { source: '/check', destination: '/readiness-check.html' },
    ];
  },
};

export default nextConfig;
