/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'development',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
    webpack: (config) => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@": process.cwd(), // __dirname이 아니라 process.cwd()를 써야 Next.js에서 루트로 인식
      };
    return config;
  },
}

export default nextConfig
