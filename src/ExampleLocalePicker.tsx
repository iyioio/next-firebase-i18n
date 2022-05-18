import React, { useCallback } from 'react';
import { useNi18 } from './lib';
import { LanguageRegion } from './types';



export function ExampleLocalePicker(){

    const locals=useNi18();

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