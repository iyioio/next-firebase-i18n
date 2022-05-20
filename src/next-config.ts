import { NextConfig } from "next";

export function withNi18(config:NextConfig):NextConfig
{

    if(!config.basePath && process.env.NI18_BASE_PATH){
        config.basePath=process.env.NI18_BASE_PATH;
    }

    const defaultWebPack=config.webpack;
    config.webpack=(config,context)=>{
        
        if(defaultWebPack){
            config=defaultWebPack(config,context);
        }
        if(!config.resolve){
            config.resolve={}
        }
        if(!config.resolve.fallback){
            config.resolve.fallback={}
        }
        config.resolve.fallback.fs=false;
        config.resolve.fallback.child_process=false;
        return config;

    }
    return config;
}