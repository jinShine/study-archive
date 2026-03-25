/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'lodash'],
  },
  serverExternalPackages: ['os'],
};

export default nextConfig;
