/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moved out of experimental (Next.js 15 change)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  output: 'standalone',
  
  // Keep experimental empty or remove it
  experimental: {
    // serverComponentsExternalPackages moved above
  },
}

module.exports = nextConfig