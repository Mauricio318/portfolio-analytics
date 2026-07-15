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
};

export default nextConfig;
