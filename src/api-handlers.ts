import { NextApiRequest, NextApiResponse } from "next";
import { locale, setLocaleAsync } from "./lib";

export async function devNi18Handler(req:NextApiRequest, res:NextApiResponse){
    if(process.env.NODE_ENV!=='development'){
        res.status(400).json({error:'Not in dev mode'});
        return;
    }
    if(req.method==='POST'){

        if(!req.body){
            res.status(400).json({error:'No body'});
            return;
        }
        await setLocaleAsync(req.body);

        res.status(204).end();

    }else if(req.method==='GET'){
        res.status(200).json(locale())
    }else if(req.method==='DELETE'){
        await setLocaleAsync(null);
        res.status(204).end();
    }else{
        res.status(400).json({error:`${req.method} method not supported`})
    }
}