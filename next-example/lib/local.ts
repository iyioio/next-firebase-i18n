import { createContext, useContext, useMemo, useRef } from "react";
import i18nConfig from '../i18n-config.json';
import { defaultCookiesLocalsSubDir, defaultDomain, defaultLocals, defaultLocalsSubDir, defaultNextOut, defaultOut, I18nBuildConfig } from "../_tmp";

//const localDirReg=/^\/lr\/([^/])\//;

const isServerSide=typeof window === 'undefined';

export interface LanguageRegion
{
    language:string;
    region:string;
    tag:string;
}

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

export function getLanguageRegion(config?:Partial<I18nBuildConfig>):LanguageRegion
{
    const _config=createLocalsConfig(config);

    let language:string='';
    let region:string='';
    if(typeof window === 'undefined'){// server side
        const [el,er]=(process.env.I18N_LOCAL||'en-US').split('-');
        language=el||'en';
        region=er||'US';
    }else{
        let [nl,nr]=navigator.language.split('-');
        language=nl;
        region=nr;
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
        }else{
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
    }
    return parseLanguageRegion(language+'-'+region);
}

let defaultConfig:I18nBuildConfig|null=null;
function _getDefaultConfig():Readonly<I18nBuildConfig>
{
    if(defaultConfig){
        return defaultConfig;
    }

    if(isServerSide && process.env.I18N_CONFIG){
        defaultConfig=JSON.parse(process.env.I18N_CONFIG) as I18nBuildConfig;
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

export function getDefaultConfig():I18nBuildConfig
{
    return {..._getDefaultConfig()}
}

export function createLocalsConfig({
    locals=_getDefaultConfig().locals,
    out=_getDefaultConfig().out,
    nextOut=_getDefaultConfig().nextOut,
    localsSubDir=_getDefaultConfig().localsSubDir,
    cookiesLocalsSubDir=_getDefaultConfig().cookiesLocalsSubDir,
    domain=_getDefaultConfig().domain,
}:Partial<I18nBuildConfig>={}):I18nBuildConfig{

    return {
        locals,
        out,
        nextOut,
        localsSubDir,
        domain,
        cookiesLocalsSubDir,
    }
}

export class LocalsContext
{

    public readonly supported:LanguageRegion[];

    private _current:LanguageRegion;
    public get current(){
        return this._current;
    }

    public readonly config:Readonly<I18nBuildConfig>;

    public constructor(config:I18nBuildConfig)
    {

        this.config=Object.freeze({...config})
        this._current=getLanguageRegion(this.config);
        this.supported=i18nConfig.locals.map(s=>parseLanguageRegion(s));
    }

    public async setCurrentAsync(lr:Partial<LanguageRegion>|string)
    {

        if(typeof lr === 'string'){
            lr=parseLanguageRegion(lr,this._current);
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

export const ReactLocalsContext=createContext<LocalsContext|null>(null);

export function useLocals():LocalsContext
{
    const ctx=useContext(ReactLocalsContext);
    if(!ctx){
        throw new Error('useLocals used outside of ReactLocalsContext');
    }
    return ctx;
}

export function useCreateLocals(config:Partial<I18nBuildConfig>):LocalsContext
{
    const configRef=useRef(config);
    return useMemo(()=>{
        return new LocalsContext((isServerSide && process.env.I18N_CONFIG)?
            _getDefaultConfig():
            createLocalsConfig(configRef.current));
    },[]);
}