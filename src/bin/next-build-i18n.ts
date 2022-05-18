import commandLineArgs from 'command-line-args';
import * as fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import { defaultConfigPath, defaultCookiesLocalsSubDir, defaultDomain, defaultLocalsSubDir, defaultNextOut, defaultOut, I18nBuildCliArgs, I18nBuildConfig } from '../types';
import { buildI18n } from './next-build-i18n-lib';

shell.set('-e');

const args:I18nBuildCliArgs=commandLineArgs([
    {name:'config',type:String,alias:'c'},
    {name:'src',type:String,alias:'s'},
    {name:'locals',type:String,alias:'r',multiple:true,defaultOption:true},
    {name:'domain',type:String,alias:'d'},
    {name:'nextOut',type:String,alias:'n',defaultValue:defaultNextOut},
    {name:'out',type:String,alias:'o',defaultValue:defaultOut},
    {name:'localsSubDir',type:String,alias:'l',defaultValue:defaultLocalsSubDir},
    {name:'cookiesLocalsSubDir',type:String,alias:'m',defaultValue:defaultCookiesLocalsSubDir}
]) as any;

if(args.src){
    shell.cd(args.src);
}

function loadConfig(path:string){
    try{
        const loadedConfig=JSON.parse(fs.readFileSync(path).toString());
        for(const e in loadedConfig){
            if(!(args as any)[e]){
                (args as any)[e]=loadedConfig[e];
            }
        }
    }catch(ex){
        console.error('Unable to load config',ex);
        shell.exit(1);
    }
}

if(args.config){
    loadConfig(args.config);
}else if(fs.existsSync(defaultConfigPath)){
    loadConfig(defaultConfigPath);
}

if(args.out){
    args.out=path.resolve(args.out);
}

args.domain=args.domain || process.env.DOMAIN || defaultDomain;

function requireProp<T extends keyof I18nBuildConfig>(
    args:Partial<I18nBuildConfig>,
    prop:T):I18nBuildConfig[T]{
    if(args[prop]===undefined){
        console.error(`--${prop} required`);
        shell.exit(1);
    }
    return (args as I18nBuildConfig)[prop];
}

buildI18n({
    locals:requireProp(args,'locals'),
    domain:requireProp(args,'domain'),
    out:requireProp(args,'out'),
    nextOut:requireProp(args,'nextOut'),
    localsSubDir:requireProp(args,'localsSubDir'),
    cookiesLocalsSubDir:requireProp(args,'cookiesLocalsSubDir'),
});