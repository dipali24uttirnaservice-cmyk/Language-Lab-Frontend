import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: false,
  images: {
    remotePatterns:
      process.env.NODE_ENV === "production"
        ? [
            { protocol: "https", hostname: "ll.uttirna.in" },
            { protocol: "https", hostname: "ui-avatars.com" },
          ]
        : // Dev API host is a LAN IP that changes per machine (see .env),
          // so remote-image allowlisting can't be pinned to one hostname here.
          [
            { protocol: "http", hostname: "**" },
            { protocol: "https", hostname: "**" },
          ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
