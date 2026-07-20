/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./portfolio.db'],
      '/api/visit': ['./portfolio.db'],
      '/api/stats': ['./portfolio.db'],
      '/api/portfolio': ['./portfolio.db'],
      '/api/resume': ['./portfolio.db'],
      '/api/settings': ['./portfolio.db'],
      '/api/skills': ['./portfolio.db'],
      '/admin': ['./portfolio.db'],
      '/admin/portfolio': ['./portfolio.db'],
      '/admin/resume': ['./portfolio.db'],
      '/admin/skills': ['./portfolio.db'],
      '/admin/stats': ['./portfolio.db']
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
