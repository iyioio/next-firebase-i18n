import * as fs from 'fs';
import { defaultConfigPath, defaultCookiesLocalesSubDir, defaultDomain, defaultLocale, defaultLocales, defaultLocalesSubDir, defaultNextOut, defaultOut, defaultSwapOut, Ni18Config, Ni18Locale, ssOverrideFile } from "./types";

const isDev=process.env.NODE_ENV==='development';

const isServerSide=typeof window === 'undefined';

let _config:Readonly<Ni18Config>|null=null;
/**
 * Returns the current Ni18Config based on the current environment
 */
export const getNi18Config=():Readonly<Ni18Config>=>{
    if(_config){
        return _config;
    }
    let c:Ni18Config;
    if(isServerSide){
        if(process.env.I18N_CONFIG){
            c=JSON.parse(process.env.I18N_CONFIG);
        }else{
            try{
                fs.accessSync(defaultConfigPath);
                c=JSON.parse(fs.readFileSync(defaultConfigPath).toString());
            }catch{
                c=getDefaultConfig();
            }

        }
    }else{
        c=getDefaultConfig();
    }
    normalizeConfig(c);
     _config=Object.freeze(c);
    Object.freeze(_config.locales);
    return _config;
}

export function normalizeConfig(config:Ni18Config):Ni18Config
{
    if(config.localeMappings){
        for(const e in config.localeMappings){
            const el=e.toLowerCase();
            if(e && !config.locales.find(l=>l.toLowerCase()===el)){
                config.locales.push(e);
            }
        }
    }
    if(!config.defaultLocale){
        config.defaultLocale=config.locales[0]||defaultLocale;
    }
    return config;
}

export function initNi18(config:Partial<Ni18Config>):Readonly<Ni18Config>
{
    _config=Object.freeze(createConfigWithOptions(config));
    Object.freeze(_config.locales);
    return _config;
}


/**
 * Returns the current language and region tag i.e. en-US.
 * This function is shorthand for getNi18Locale().tag
 */
export const locale=()=>{
    return getNi18Locale().tag;
}

/**
 * Returns the current region i.e. US. For non-region specific locales an empty string will be
 * returned.
 * This function is shorthand for getNi18Locale().region
 */
export const region=()=>{
    return getNi18Locale().region;
}

/**
 * Returns the current language i.e. en.
 * This function is shorthand for getNi18Locale().language
 */
export const lang=()=>{
    return getNi18Locale().language;
}

/**
 * Sets the current locale. Calling this function server side will not effect clients
 */
export async function setLocaleAsync(locale:string|Ni18Locale|null){
    if(isServerSide){
        if(isDev){
            setServerSideLocaleOverride(locale?parseNi18Locale(locale):null)
        }
    }else{
        await setClientSideLanguageAsync(locale)
    }
}

async function setClientSideLanguageAsync(locale:Ni18Locale|string|null)
{

    if(!locale){
        document.cookie=`firebase-language-override=en;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        document.cookie=`firebase-country-override=US;expires=Thu, 01 Jan 1970 00:00:01 GMT`;

        //document.cookie=`NEXT_LOCALE=${locale.language||this.current.language}${locale.region?'-'+locale.region:''}`

        if(isDev){
            try{
                await fetch('/api/dev-ni18',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(locale)
                })
            }catch{}
        }
    }else{

        if(typeof locale === 'string'){
            locale=parseNi18Locale(locale);
        }
        
        if(locale.language){
            document.cookie=`firebase-language-override=${locale.language}`;
        }else{
            document.cookie=`firebase-language-override=en;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }
        if(locale.region){
            document.cookie=`firebase-country-override=${locale.region}`;
        }else{
            document.cookie=`firebase-country-override=US;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }

        //document.cookie=`NEXT_LOCALE=${locale.language||this.current.language}${locale.region?'-'+locale.region:''}`

        if(isDev){
            try{
                await fetch('/api/dev-ni18',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(locale)
                })
            }catch{}
        }
    }

    window.location.reload();

    return await new Promise<void>(()=>{
        // never resolve. The reloading of the page will re-render everything
    });
}


/**
 * Returns server side locale overrides
 */
function getServerSideLocaleOverride():Ni18Locale|null
{
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
function setServerSideLocaleOverride(override:Ni18Locale|null):void
{
    try{
        if(override){
            fs.writeFileSync(ssOverrideFile,JSON.stringify(override));
        }else{
            fs.unlinkSync(ssOverrideFile);
        }

    }catch{}
}

/**
 * Returns a link to a language specific path. 
 */
export function getLocaleLink(path:string,locale:string)
{

    if(path.startsWith('/')){
        path=path.substring(1);
    }

    const config=getNi18Config();

    return `https://${config.domain}/${config.localesSubDir}/${locale}/${path}`;
}

/**
 * Parses a string into a Ni18Locale
 */
export function parseNi18Locale(locale?:string|Ni18Locale|null):Ni18Locale
{
    if(locale && typeof(locale)==='object'){
        return locale;
    }
    let [language,region]=(locale||'').split('-');
    language=language?.split(',')[0].toLowerCase()||'en',
    region=region?.split(',')[0].toUpperCase()||''
    return {
        language,
        region,
        tag:language+(region?'-'+region:''),
    }
}



/**
 * Returns a LanguageRegion based on the provided config
 */
export function getNi18Locale():Ni18Locale
{

    let language:string='';
    let region:string='';

    if(!isServerSide && process.env.NEXT_PUBLIC_NI18_LOCALE){
        const parts=process.env.NEXT_PUBLIC_NI18_LOCALE.split('-');
        language=parts[0];
        region=parts[1]||'';
    }

    let hasCookie=false;
    if(typeof document !== 'undefined'){
        const cookies=document.cookie.split(';').map(c=>c.trim());
        const cl=cookies.find(c=>c.startsWith('firebase-language-override='))?.split('=')[1]?.trim();
        const cr=cookies.find(c=>c.startsWith('firebase-country-override='))?.split('=')[1]?.trim();
        if(cl){
            hasCookie=true;
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

    if(isServerSide){
        const [el,er]=(process.env.NI18_LOCALE||'en-US').split('-');
        if(!language){
            language=el||'en';
        }
        if(!region){
            region=er;
        }
    }else{
        let [nl,nr]=navigator.language.split('-');
        if(!language){
            language=nl;
        }
        if(!region && !hasCookie){
            region=nr;
        }
        const config=getNi18Config();
        if(location.pathname.startsWith('/'+config.localesSubDir+'/')){
            const e=location.pathname.indexOf('/',config.localesSubDir.length+2);
            const [pl,pr]=(e===-1?
                location.pathname.substring(config.localesSubDir.length+2):
                location.pathname.substring(config.localesSubDir.length+2,e)
            ).split('-');
            language=pl;
            if(pr){
                region=pr;
            }
        }
    }
    return parseNi18Locale(language+'-'+region);
}

let defaultConfig:Ni18Config|null=null;
function _getDefaultConfig():Readonly<Ni18Config>
{
    if(defaultConfig){
        return defaultConfig;
    }
    
    defaultConfig={
        defaultLocale,
        locales:defaultLocales,
        out:defaultOut,
        nextOut:defaultNextOut,
        localesSubDir:defaultLocalesSubDir,
        cookiesLocalesSubDir:defaultCookiesLocalesSubDir,
        domain:isServerSide?defaultDomain:location.host,
        swapOut:defaultSwapOut,
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
export function createConfigWithOptions({
    defaultLocale=_getDefaultConfig().defaultLocale,
    locales=_getDefaultConfig().locales,
    out=_getDefaultConfig().out,
    nextOut=_getDefaultConfig().nextOut,
    localesSubDir=_getDefaultConfig().localesSubDir,
    cookiesLocalesSubDir=_getDefaultConfig().cookiesLocalesSubDir,
    domain=_getDefaultConfig().domain,
    swapOut=_getDefaultConfig().swapOut,
    localeMappings=_getDefaultConfig().localeMappings
}:Partial<Ni18Config>={}):Ni18Config{

    return normalizeConfig({
        defaultLocale,
        locales,
        out,
        nextOut,
        localesSubDir,
        domain,
        cookiesLocalesSubDir,
        swapOut,
        localeMappings
    })
}