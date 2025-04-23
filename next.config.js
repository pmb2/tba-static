/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Set output directory to the root instead of /out/
  distDir: './',
  // Configure asset prefix based on environment
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
  // Optimize image handling
  images: {
    unoptimized: true, // For static export
  },
  // Ensure trailing slashes to make URLs more consistent
  trailingSlash: true,
  // Compression for improved loading speed
  compress: true,
}

module.exports = nextConfig