/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "judicious-corgi-741.convex.cloud", //this will fail for production, make it dynamic
      },
    ],
  },
};

export default nextConfig;
