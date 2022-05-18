const { applyNi18nConfig } = require('@iyio/ni18')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = applyNi18nConfig(nextConfig);
