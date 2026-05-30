/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
