import { useRouter } from 'next/router';
import React from 'react';
import { getLocaleLink, getNi18Config } from './lib';

export function useNi18Links()
{

    const router=useRouter();

    const path=router.asPath;

    const config=getNi18Config();

    const lngOnly=Array.from(new Set(config.locales.map(s=>s.split('-')[0])))

    return [
        ...config.locales.map(lr=>(
            <link key={lr} rel="alternate" hrefLang={lr.toLowerCase()} href={getLocaleLink(path,lr)} />
        )),

        ...lngOnly.map(l=>(
            <link key={l} rel="alternate" hrefLang={l} href={getLocaleLink(path,l)} />
        )),

        <link key="x-default" rel="alternate" hrefLang="x-default" href={getLocaleLink(path,'en')} />
    ]
}