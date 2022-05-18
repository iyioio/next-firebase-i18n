import { useRouter } from 'next/router';
import React from 'react';
import { LocalsContext, useLocals } from '../lib/local';

export function useLocalLinks(localsDefault?:LocalsContext)
{
    const locals=useLocals(localsDefault);

    const router=useRouter();

    const path=router.asPath;

    const lngOnly=Array.from(new Set(locals.supported.map(s=>s.language)))

    return [
        ...locals.supported.map(lr=>(
            <link key={lr.tag} rel="alternate" hrefLang={lr.tag.toLowerCase()} href={locals.getLink(path,lr.language,lr.region)} />
        )),

        ...lngOnly.map(l=>(
            <link key={l} rel="alternate" hrefLang={l} href={locals.getLink(path,l)} />
        )),

        <link key="x-default" rel="alternate" hrefLang="x-default" href={locals.getLink(path,'en')} />
    ]
}