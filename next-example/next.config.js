/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath:process.env.I18N_BASE_PATH||'',
  webpack:(config)=>{
    if(!config.resolve){
      config.resolve={}
    }
    if(!config.resolve.fallback){
      config.resolve.fallback={}
    }
    config.resolve.fallback.fs=false;
    return config;
  }
}

module.exports = nextConfig
