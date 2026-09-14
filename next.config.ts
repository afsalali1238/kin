import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Body assets are immutable (they include hashes in their URL in production
  // or are otherwise versioned), so we can serve them with a long max-age.
  // This saves bandwidth since they are large GLB files.
  async headers() {
    return [
      {
        source: "/models/:asset*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
