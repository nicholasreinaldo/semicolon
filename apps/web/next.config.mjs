/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  headers() {
    return process.env.NODE_ENV === "production"
      ? [
          {
            source: "/api/:path*",
            headers: [
              {
                key: "Access-Control-Allow-Origin",
                value: `https://www.${process.env.DEPLOYMENT_URL}`,
              },
            ],
          },
        ]
      : [];
  },
};

export default nextConfig;
