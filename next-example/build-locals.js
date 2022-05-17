#!/usr/bin/env node

const shell = require('shelljs');

const locals=require('./locals.json');
const outDir='./out';
const publicDir='../public';
const localsSubDir='lr';

const localsDir=publicDir+'/'+localsSubDir

if(!shell.env.DOMAIN){
    shell.env.DOMAIN='localhost:5000';
}


shell.set('-e');

shell.cd(__dirname);

shell.rm('-rf',publicDir);
shell.rm('-rf',outDir);

let isDefault=true;

const lngs=[];

function build(basePath,lngRegion)
{
    shell.env.LOCAL=lngRegion;
    shell.env.BASE_PATH=basePath

    shell.exec('npx next build');

    shell.exec('npx next export');

    shell.mv(outDir,publicDir+basePath);
}

for(const lngRegion of locals){

    if(isDefault){
        build('',lngRegion);
        shell.mkdir(localsDir);
        isDefault=false;
    }

    const lngOnly=lngRegion.split('-')[0];
    if(!lngs.includes(lngOnly)){
        lngs.push(lngOnly);
        build(`/${localsSubDir}/${lngOnly}`,lngRegion);
    }

    build(`/${localsSubDir}/${lngRegion}`,lngRegion);

}