const { applyNextI18nConfig } = require('@iyio/next-firebase-i18n')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = applyNextI18nConfig(nextConfig);
