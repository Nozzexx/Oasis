/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  images: {
    unoptimized: true // This is important for Amplify deployment
  }
}

export default nextConfig