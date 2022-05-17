import React, { useCallback } from 'react';
import { LanguageRegion, useLocals } from '../lib/local';



export default function LocalPicker(){

    const locals=useLocals();

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