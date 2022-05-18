/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath:process.env.I18N_BASE_PATH||''
}

module.exports = nextConfig
