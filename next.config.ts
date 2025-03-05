// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     domains: ["64.media.tumblr.com", "i.pinimg.com", "fovmfsrppzygowoaiaey.supabase.co"], // Add the allowed image domain here
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fovmfsrppzygowoaiaey.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '64.media.tumblr.com',
        port: '',
        pathname: '**', // Allow all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '**', // Allow all paths under this hostname
      },
    ],
  },
};

export default nextConfig;
