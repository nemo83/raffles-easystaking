/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: function (config, options) {
    config.experiments = { asyncWebAssembly: true, layers: true };
    return config;
  },
  images: {
    domains: ['github.com', 'vm.adaseal.eu'],
  },
}

module.exports = nextConfig
