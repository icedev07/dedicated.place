/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hhmnxcvymeglqpibdeca.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/project-files/**',
        search: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  devIndicators: false
};

module.exports = nextConfig;
