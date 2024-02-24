/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_HOSTNAME, //this will fail for production, make it dynamic
      },
    ],
  },
};

export default nextConfig;
