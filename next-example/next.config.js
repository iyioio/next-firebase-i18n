const { withNi18 } = require('@iyio/ni18');
const ni18Config = require('./ni18-config.json');

/** @type {import('next').NextConfig} */
const nextConfig = withNi18(ni18Config,{
  // i18n:{
  //   localeDetection:false
  // },
  reactStrictMode: true,
})

module.exports = nextConfig;