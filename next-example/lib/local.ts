import { createContext, useContext } from "react";
import supportedLocals from '../locals.json';

const lrDir='lr';
const localDirReg=/^\/lr\/([^/])\//;

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

export function getLanguageRegion():LanguageRegion
{
    let language:string='';
    let region:string='';
    if(typeof window === 'undefined'){// server side
        const [el,er]=(process.env.LOCAL||'en-US').split('-');
        language=el||'en';
        region=er||'US';
    }else{
        let [nl,nr]=navigator.language.split('-');
        language=nl;
        region=nr;
        const pathMatch=localDirReg.exec(location.pathname);
        if(pathMatch){
            const [pl,pr]=pathMatch[1].split('-');
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

export class LocalsContext
{

    public readonly supported:LanguageRegion[];

    private _current:LanguageRegion;
    public get current(){
        return this._current;
    }

    public constructor()
    {
        this._current=getLanguageRegion();
        this.supported=supportedLocals.map(s=>parseLanguageRegion(s));
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

        let domain:string;

        if(typeof window === 'undefined'){// server side
            if(!process.env.DOMAIN){
                return path;
            }
            domain=process.env.DOMAIN;
        }else{
            domain=location.host;
        }

        return `https://${domain}/${lrDir}/${language+(region?'-'+region:'')}/${path}`;
    }
}

export const ReactLocalsContext=createContext<LocalsContext>(new LocalsContext());

export function useLocals():LocalsContext
{
    const ctx=useContext(ReactLocalsContext);
    if(!ctx){
        throw new Error('useLocals used outside of ReactLocalsContext');
    }
    return ctx;
}