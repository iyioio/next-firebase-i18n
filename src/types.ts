export const defaultConfigPath='./ni18-config.json';

export const defaultLanguage='en';
export const defaultRegion='US';
export const defaultLocale=`${defaultLanguage}-${defaultRegion}`;
export const defaultLocales=[defaultLocale];
export const defaultDomain='localhost:5000';
export const defaultOut='./out-ni18';
export const defaultNextOut='./out'
export const defaultLocalesSubDir='lr';
export const defaultCookiesLocalesSubDir='lrc';
export const defaultSwapOut=true;
export const defaultAutoAliasLanguages=true;

export const ssOverrideFile='.ni18-dev-override';

export interface Ni18Config
{

    /**
     * The default locale. This value must be included in the locales property. If not defined in
     * the ni18 config file the first locale in the locales property will be used.
     * @alias z
     */
    defaultLocale:string;

    /**
     * An array of supported locales.
     * @example ['en','en-US','es','es-MX','da-DK']
     * @alias r
     */
    locales:string[];

    /**
     * Creates aliases for locales. This is useful for when you want to use a single locale build
     * for multiple locales. For example, if all of your content has a locale of either en (english)
     * or es (spanish) but you want locale builds for en, en-US, es and es-MX you can create aliases
     * that point en-US to en and es-MX to es ( {"en-US":"en", "es-MX":"es"} ). Using aliases
     * instead of defining locales in the locales property reduces the number of locale builds since
     * only the source locale is built and the alias is created by coping the build output of the
     * source locale.
     *
     * CLI format: alias=source, es-US=en
     * @alias m
     */
    localeMappings?:{[locale:string]:string};

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
    localesSubDir:string;

    /**
     * The name of sub-directory where cookie based language specify builds are written to.
     * The files written here are not intended to be directly browse-able. They are used by
     * i18n url rewrites to support cookie based language switching.
     * @alias k
     */
    cookiesLocalesSubDir:string;
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
export interface Ni18Locale
{
    /**
     * 2 letter language code - en
     */
    language:string;

    /**
     * 2 letter country / region code - US
     * For non-region specific locales region is an empty string.
     */
    region:string;

    /**
     * language and region combination - en-US or en for non-region specific locales
     */
    tag:string;
}

