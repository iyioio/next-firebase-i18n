const { applyNi18Config } = require('@iyio/ni18')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = applyNi18Config(nextConfig);
