import type { NextConfig } from 'next';

// REPLACES next.config.ts from Phase 1.
// Additions: serverExternalPackages expanded, turbopack note.

const nextConfig: NextConfig = {
  // Allow Next.js <Image> to load photos from Vercel Blob.

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },

  // Mongoose must run in the Node.js runtime, not the
  // Edge runtime. Listing it here prevents Next.js from bundling it
  // with the Edge-compatible output, which would cause a build error.
  serverExternalPackages: ['mongoose'],



};
export default nextConfig;
