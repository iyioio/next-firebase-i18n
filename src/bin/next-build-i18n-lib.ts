import chalk from 'chalk';
import shell from 'shelljs';
import { Ni18Config } from '../types';

const subReplace=   '___RE-PLACE__B-A-S-E___';
const subReplaceReg=/___RE-PLACE__B-A-S-E___/g;

export interface BuildInfo{
    basePath:boolean;
    out:string;
    tag:string;
    lng:string;
}

export function buildI18n(config:Ni18Config):BuildInfo[]
{

    const localesDir=config.out+'/'+config.localesSubDir;
    const localesCookiesDir=config.out+'/'+config.cookiesLocalesSubDir;
    console.info('NextBuildI18nConfig')
    console.info({config,localesDir});

    shell.env.I18N_CONFIG=JSON.stringify(config);

    shell.set('-e');
    shell.rm('-rf',config.out);
    shell.rm('-rf',config.nextOut);


    shell.mkdir('-p',localesDir);
    shell.mkdir('-p',localesCookiesDir);

    const builds:{basePath:boolean,out:string,tag:string,lng:string}[]=[];

    function build(basePath:boolean,tag:string)
    {
        if(!config.nextOut){
            throw new Error('config.nextOut required');
        }

        const out=(basePath?localesDir:localesCookiesDir)+'/'+tag;

        console.info(chalk.cyan('Building '+tag+' -> '+out));

        shell.env.NI18_LOCALE=tag;
        shell.env.NEXT_PUBLIC_NI18_LOCALE=tag;
        shell.env.NI18_BASE_PATH=basePath?`/${config.localesSubDir}/${subReplace}`:'';

        shell.exec('npx next build');
        shell.exec('npx next export');
        shell.mv(config.nextOut,out);

        builds.push({
            basePath,
            out,
            tag,
            lng:tag.split('-')[0],
        })

        console.info(chalk.green('Build complete '+tag+' -> '+out+'\n'));
        return out;
    }

    console.info(chalk.magenta(`Starting build for ${config.locales.length}(s) locales`))
    console.info(chalk.magenta(`A total of ${config.locales.length*2}(s) builds will be created`))

    for(const lngRegion of config.locales){
        build(false,lngRegion);
        build(true,lngRegion);
    }


    const lngs:string[]=[];
    const buildsCopy=[...builds]
    for(const b of buildsCopy){
        const lngTag=(b.basePath?'b-':'r-')+b.lng;
        if(!lngs.includes(lngTag)){
            lngs.push(lngTag);
            const out=(b.basePath?localesDir:localesCookiesDir)+'/'+b.lng;
            console.info(`Copying ${b.out} -> ${out}`);
            shell.cp('-r',b.out,out);
            builds.push({
                ...b,
                out,
                tag:b.lng
            })
        }
    }

    for(const b of builds){
        if(!b.basePath){
            continue;
        }

        console.info(`Setting basePath to ${b.tag} in ${b.out}`)

        shell.ls('-Rl',b.out).forEach((n:any)=>{
            const filepath=b.out+'/'+n.name;
            if(shell.test('-f',filepath)){
                shell.sed('-i',subReplaceReg,b.tag,filepath);
            }
        });

    }

    // copy default language to root
    console.info(`Coping default tag to root ${builds[0].out} -> ${config.out}`);
    shell.cp('-r',builds[0].out+'/*',config.out);

    if(config.swapOut){
        console.info(`swapping output ${config.out} -> ${config.nextOut}`);
        shell.mv(config.out,config.nextOut);
        for(const b of builds){
            b.out=config.nextOut+b.out.substring(config.out.length);
        }
    }


    console.info(chalk.green('Build success'));
    console.info(builds);
    return builds;
}