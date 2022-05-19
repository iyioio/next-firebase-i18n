export const defaultConfigPath='./ni18-config.json';

export const defaultLocals=['en-US'];
export const defaultDomain='localhost:5000';
export const defaultOut='./out-ni18';
export const defaultNextOut='./out'
export const defaultLocalsSubDir='lr';
export const defaultCookiesLocalsSubDir='lrc';
export const defaultSwapOut=true;

export const ssOverrideFile='.ni18-dev-override';

export interface Ni18Config
{
    /**
     * An array of language-region tags.
     * @example ['en-US','en-MX','da-DK']
     * @alias r
     */
    locals:string[];

    /**
     * The domain the build targets. This is required for alternate language links to work
     * properly
     * @alias d
     */
    domain:string;

    /**
     * The directory ni18 builds are written to.
     * @default './out-ni18
     * @alias o
     */
    out:string;

    /**
     * The directory that NextJS exports to
     * @default ./out
     * @alias n
     */
    nextOut:string;

    /**
     * If true build output will be moved to the nextOut location. This is helpful for integrating
     * in to existing build systems.
     * @default true
     * @alias w
     */
    swapOut:boolean;

    /**
     * The name of sub-directory where language specify builds are written to. The files written
     * here are browse-able and are used by search engines to index.
     * @alias l
     */
    localsSubDir:string;

    /**
     * The name of sub-directory where cookie based language specify builds are written to.
     * The files written here are not intended to be directly browse-able. They are used by
     * i18n url rewrites to support cookie based language switching.
     * @alias m
     */
    cookiesLocalsSubDir:string;
}

export interface Ni18CliArgs extends Partial<Ni18Config>
{
    /**
     * Path of a ni18 config files
     * @alias c
     */
    config?:string;

    /**
     * Source directory of the target next project
     * @alias s
     */
    src?:string;
}

/**
 * Represents a language and region
 */
export interface LanguageRegion
{
    /**
     * 2 letter language code - en
     */
    language:string;

    /**
     * 2 letter country / region code - US
     */
    region:string;

    /**
     * language and region combination - en-US
     */
    tag:string;
}

