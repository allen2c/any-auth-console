/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/projects/:path*",
        destination: "http://localhost:8000/projects/:path*",
      },
      {
        source: "/api/me/:path*",
        destination: "http://localhost:8000/me/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
