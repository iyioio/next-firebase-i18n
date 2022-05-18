export const defaultConfigPath='./ni18-config.json';

export const defaultLocals=['en-US'];
export const defaultDomain='localhost:5000';
export const defaultOut='./out-i18n';
export const defaultNextOut='./out'
export const defaultLocalsSubDir='lr';
export const defaultCookiesLocalsSubDir='lrc';

export const ssOverrideFile='.ni18-dev-override';

export interface Ni18Config
{
    locals:string[];
    domain:string;
    out:string;
    nextOut:string;
    localsSubDir:string;
    cookiesLocalsSubDir:string;
}

export interface Ni18CliArgs extends Partial<Ni18Config>
{
    config?:string;
    src?:string;
}

/**
 * Represents a language and region
 */
export interface LanguageRegion
{
    language:string;
    region:string;
    tag:string;
}

