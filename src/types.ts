export interface I18nBuildConfig
{
    locals:string[];
    domain:string;
    out:string;
    nextOut:string;
    localsSubDir:string;
    cookiesLocalsSubDir:string;
}

export interface I18nBuildCliArgs extends Partial<I18nBuildConfig>
{
    config?:string;
    src?:string;
}

export const defaultConfigPath='./i18n-config.json';

export const defaultLocals=['en-US'];
export const defaultDomain='localhost:5000';
export const defaultOut='./out-i18n';
export const defaultNextOut='./out'
export const defaultLocalsSubDir='lr';
export const defaultCookiesLocalsSubDir='lrc';