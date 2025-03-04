import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["64.media.tumblr.com", "i.pinimg.com"], // Add the allowed image domain here
  },
};

export default nextConfig;
