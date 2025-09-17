/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repo = 'story-tasker';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Ensure assets resolve correctly on GitHub Pages project site
  assetPrefix: isProd ? `/${repo}/` : '',
  basePath: isProd ? `/${repo}` : '',
};

module.exports = nextConfig;
