import React from 'react';
import { getNi18Config, setLocaleAsync } from './lib';


export function ExampleLocalePicker(){

    const config=getNi18Config();

    return (
        <div>
            {config.locales.map(l=>(
                <button onClick={()=>setLocaleAsync(l)} key={l}>{l}</button>
            ))}
        </div>
    )

}