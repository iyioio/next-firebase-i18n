import * as fs from 'fs';
import { createContext, useContext, useMemo, useRef } from "react";
import { defaultCookiesLocalsSubDir, defaultDomain, defaultLocals, defaultLocalsSubDir, defaultNextOut, defaultOut, LanguageRegion, Ni18Config, ssOverrideFile } from "./types";

const isDev=process.env.NODE_ENV==='development';

const isServerSide=typeof window === 'undefined';

/**
 * Returns server side locale overrides
 */
export function getServerSideLocaleOverride():LanguageRegion|null
{
    if(!isServerSide){
        return null;
    }
    try{
        fs.accessSync(ssOverrideFile);

        const str=fs.readFileSync(ssOverrideFile).toString();

        if(!str){
            return null;
        }

        return JSON.parse(str);

    }catch{
        return null;
    }
}

/**
 * Sets server side locale overrides
 */
export function setServerSideLocaleOverride(override:LanguageRegion|null):void
{
    if(!isServerSide){
        return;
    }
    try{
        if(override){
            fs.writeFileSync(ssOverrideFile,JSON.stringify(override));
        }else{
            fs.unlinkSync(ssOverrideFile);
        }

    }catch{}
}

/**
 * Parses a string into a LanguageRegion
 */
export function parseLanguageRegion(str:string,defaults?:LanguageRegion):LanguageRegion
{
    let [language,region]=(str||'').split('-');
    language=language?.split(',')[0].toLowerCase()||defaults?.language||'en',
    region=region?.split(',')[0].toUpperCase()||defaults?.region||'US'
    return {
        language,
        region,
        tag:language+'-'+region,
    }
}

/**
 * Returns a LanguageRegion based on the provided config
 */
export function getLanguageRegion(config?:Partial<Ni18Config>):LanguageRegion
{
    const _config=createLocaleConfig(config);

    let language:string='';
    let region:string='';

    if(typeof document !== 'undefined'){
        const cookies=document.cookie.split(';').map(c=>c.trim());
        const cl=cookies.find(c=>c.startsWith('firebase-language-override='))?.split('=')[1]?.trim();
        const cr=cookies.find(c=>c.startsWith('firebase-country-override='))?.split('=')[1]?.trim();
        if(cl){
            language=cl;
        }
        if(cr){
            region=cr;
        }
    }

    if(isServerSide && isDev){
        const override=getServerSideLocaleOverride();
        if(override){
            return override;
        }
    }

    if(typeof window === 'undefined'){// server side
        const [el,er]=(process.env.I18N_LOCAL||'en-US').split('-');
        if(!language){
            language=el||'en';
        }
        if(!region){
            region=er||'US';
        }
    }else{
        let [nl,nr]=navigator.language.split('-');
        if(!language){
            language=nl;
        }
        if(!region){
            region=nr;
        }
        if(location.pathname.startsWith('/'+_config.localsSubDir+'/')){
            const e=location.pathname.indexOf('/',_config.localsSubDir.length+2);
            const [pl,pr]=(e===-1?
                location.pathname.substring(_config.localsSubDir.length+2):
                location.pathname.substring(_config.localsSubDir.length+2,e)
            ).split('-');
            language=pl;
            if(pr){
                region=pr;
            }
        }
    }
    return parseLanguageRegion(language+'-'+region);
}

let defaultConfig:Ni18Config|null=null;
function _getDefaultConfig():Readonly<Ni18Config>
{
    if(defaultConfig){
        return defaultConfig;
    }

    if(isServerSide && process.env.I18N_CONFIG){
        defaultConfig=JSON.parse(process.env.I18N_CONFIG) as Ni18Config;
        return defaultConfig;
    }
    
    defaultConfig={
        locals:defaultLocals,
        out:defaultOut,
        nextOut:defaultNextOut,
        localsSubDir:defaultLocalsSubDir,
        cookiesLocalsSubDir:defaultCookiesLocalsSubDir,
        domain:isServerSide?defaultDomain:location.host,
    }

    return defaultConfig;
}

/**
 * Returns a default Ni18Config based on the current environment
 */
export function getDefaultConfig():Ni18Config
{
    return {..._getDefaultConfig()}
}

/**
 * Creates a fully defined Ni18Config using defaults for properties not provided
 */
export function createLocaleConfig({
    locals=_getDefaultConfig().locals,
    out=_getDefaultConfig().out,
    nextOut=_getDefaultConfig().nextOut,
    localsSubDir=_getDefaultConfig().localsSubDir,
    cookiesLocalsSubDir=_getDefaultConfig().cookiesLocalsSubDir,
    domain=_getDefaultConfig().domain,
}:Partial<Ni18Config>={}):Ni18Config{

    return {
        locals,
        out,
        nextOut,
        localsSubDir,
        domain,
        cookiesLocalsSubDir,
    }
}

/**
 * Manages the current locale
 */
export class Ni18Context
{

    public readonly supported:LanguageRegion[];

    private _current:LanguageRegion;
    public get current(){
        return this._current;
    }

    public readonly config:Readonly<Ni18Config>;

    public constructor(config:Ni18Config)
    {

        this.config=Object.freeze({...config})
        this._current=getLanguageRegion(this.config);
        this.supported=this.config.locals.map(s=>parseLanguageRegion(s));
    }

    public async setCurrentAsync(lr:Partial<LanguageRegion>|string)
    {

        if(typeof lr === 'string'){
            lr=parseLanguageRegion(lr,this._current);
        }

        const tag=`${lr.language||this.current.language}${lr.region?'-'+lr.region:''}`
        const filledLr:LanguageRegion={
            language:lr.language||this.current.language,
            region:lr.region||this.current.region,
            tag
        }
        
        if(!lr.language && !lr.region){
            return;
        }
        if(lr.language){
            document.cookie=`firebase-language-override=${lr.language}`;
        }
        if(lr.region){
            document.cookie=`firebase-country-override=${lr.region}`;
        }

        document.cookie=`NEXT_LOCALE=${lr.language||this.current.language}${lr.region?'-'+lr.region:''}`

        if(isDev){
            try{
                await fetch('/api/dev-i18n',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(filledLr)
                })
            }catch{}
        }

        window.location.reload();

        return await new Promise<void>(()=>{
            // never resolve. The reloading of the page will re-render everything
        });
    }

    public getLink(path:string,language:string,region?:string|null)
    {

        if(path.startsWith('/')){
            path=path.substring(1);
        }

        return `https://${this.config.domain}/${this.config.localsSubDir}/${language+(region?'-'+region:'')}/${path}`;
    }
}

/**
 * Provides a Ni18Context for use by the useLocals hook
 */
export const ReactNi18Context=createContext<Ni18Context|null>(null);

/**
 * Returns a Ni18Context or the provided default if no Ni18Context is found
 */
export function useNi18(localsDefault?:Ni18Context):Ni18Context
{
    const ctx=useContext(ReactNi18Context);
    if(!ctx){
        if(localsDefault){
            return localsDefault;
        }
        throw new Error('useLocals used outside of ReactNi18Context');
    }
    return ctx;
}

/**
 * Creates a Ni18Context for use by a ReactNi18Context provider
 */
export function useCreateNi18Context(config:Partial<Ni18Config>):Ni18Context
{
    const configRef=useRef(config);
    return useMemo(()=>{
        return new Ni18Context((isServerSide && process.env.I18N_CONFIG)?
            _getDefaultConfig():
            createLocaleConfig(configRef.current));
    },[]);
}