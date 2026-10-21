
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Tree-shake icon/UI barrels so only used icons ship to the client.
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
  },
};

export default nextConfig;
