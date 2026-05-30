/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: { unoptimized: true },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
