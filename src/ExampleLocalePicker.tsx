import React, { useCallback } from 'react';
import { LanguageRegion, useLocale } from './lib';



export function ExampleLocalePicker(){

    const locals=useLocale();

    const setLocal=useCallback((local:LanguageRegion)=>{
        locals.setCurrentAsync(local);
    },[locals]);

    return (
        <div>
            {locals.supported.map(l=>(
                <button onClick={()=>setLocal(l)} key={l.tag}>{l.tag}</button>
            ))}
        </div>
    )

}