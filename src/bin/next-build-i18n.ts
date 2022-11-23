#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import * as fs from 'node:fs';
import path from 'node:path';
import shell from 'shelljs';
import { normalizeConfig } from '../lib';
import { defaultConfigPath, defaultCookiesLocalesSubDir, defaultDomain, defaultLocale, defaultLocalesSubDir, defaultNextOut, defaultOut, defaultSwapOut, Ni18CliArgs, Ni18Config } from '../types';
import { buildI18n } from './next-build-i18n-lib';

shell.set('-e');

const args:Ni18CliArgs=commandLineArgs([
    {name:'config',type:String,alias:'c'},
    {name:'src',type:String,alias:'s'},
    {name:'locales',type:String,alias:'r',multiple:true,defaultOption:true},
    {name:'domain',type:String,alias:'d'},
    {name:'nextOut',type:String,alias:'n',defaultValue:defaultNextOut},
    {name:'out',type:String,alias:'o',defaultValue:defaultOut},
    {name:'localesSubDir',type:String,alias:'l',defaultValue:defaultLocalesSubDir},
    {name:'cookiesLocalesSubDir',type:String,alias:'k',defaultValue:defaultCookiesLocalesSubDir},
    {name:'swapOut',type:Boolean,alias:'w',defaultValue:defaultSwapOut},
    {name:'localeMappings',type:String,alias:'m',multiple:true},
    {name:'defaultLocale',type:String,alias:'z',defaultValue:''},
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

function requireProp<T extends keyof Ni18Config>(
    args:Partial<Ni18Config>,
    prop:T):Ni18Config[T]{
    if(args[prop]===undefined){
        console.error(`--${prop} required`);
        shell.exit(1);
    }
    return (args as Ni18Config)[prop];
}

const locales=requireProp(args,'locales');

buildI18n(normalizeConfig({
    defaultLocale:requireProp(args,'defaultLocale')||locales[0]||defaultLocale,
    locales:locales,
    domain:requireProp(args,'domain'),
    out:requireProp(args,'out'),
    nextOut:requireProp(args,'nextOut'),
    localesSubDir:requireProp(args,'localesSubDir'),
    cookiesLocalesSubDir:requireProp(args,'cookiesLocalesSubDir'),
    swapOut:requireProp(args,'swapOut'),
    localeMappings:(Array.isArray(args.localeMappings))?(args.localeMappings as any as string[])
        .map(s=>{
            const parts=s.split('=');
            return [parts[0].trim(),parts[1]?.trim()||''];
        })
        .filter(p=>p[0] && p[1])
        .reduce<{[locale:string]:string}>((p,c)=>{
            p[c[0]]=c[1];
            return p;
        },{}) : args.localeMappings
}));