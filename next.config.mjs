/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "igbodating.s3.eu-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "rosaryapp.s3.eu-west-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
