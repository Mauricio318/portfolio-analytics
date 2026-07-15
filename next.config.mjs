/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./portfolio.db'],
    },
  },
};

export default nextConfig;
