/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '2shankz.github.io',
      },
      {
        protocol: 'https',
        hostname: 'optc-db.github.io',
      },
    ],
  },
};

module.exports = nextConfig;
