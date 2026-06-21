/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "laser360clinic.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
      },
      {
        protocol: "https",
        hostname: "imgbb.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "course-selling-platform-api-production.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "course-selling-platform-api-production.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "course-selling-api.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "api.maruftech.online",
      },
      {
        protocol: "http",
        hostname: "api.maruftech.online",
      },
    ],
  },

  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "https://course-selling-api.up.railway.app";

    const normalizedApiBase = apiBase.replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${normalizedApiBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
