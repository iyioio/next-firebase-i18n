import { NextApiRequest, NextApiResponse } from "next";
import { getServerSideLocaleOverride, setServerSideLocaleOverride } from "./lib";

export function devNi18Handler(req:NextApiRequest, res:NextApiResponse){
    if(process.env.NODE_ENV!=='development'){
        res.status(400).json({error:'Not in dev mode'});
        return;
    }
    if(req.method==='POST'){

        if(!req.body){
            res.status(400).json({error:'No body'});
            return;
        }
        setServerSideLocaleOverride(req.body);

        res.status(204).end();

    }else if(req.method==='GET'){
        res.status(200).json(getServerSideLocaleOverride())
    }else if(req.method==='DELETE'){
        setServerSideLocaleOverride(null);
        res.status(201);
    }else{
        res.status(400).json({error:`${req.method} method not supported`})
    }
}