/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }, { protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "via.placeholder.com" }] },
};
export default nextConfig;
