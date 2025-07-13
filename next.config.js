/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Domínio do seu Supabase Storage
        protocol: "https",
        hostname: "vpkqvpzmiylfuwspccqw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product-logos/**",
      },
      {
        // Domínio das imagens de placeholder
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
