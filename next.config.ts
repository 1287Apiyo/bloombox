import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // optional, but recommended
  images: {
    domains: [
      'images.unsplash.com',  // for your Unsplash images
      'images.pexels.com',
      'longrowlavender.com'   // for the external image causing the error
    ],
  },
};

export default nextConfig;
