# @iyio/ni18
ni18 adds internationalization support to NextJS projects using SSG ( next export ) without the need
to modify routing.

<br/><br/>

## Features
- Generates static builds for each specified locale
- Create SEO crawlable internationalized static sites
- Support for both url based and cookie based language selection for both seamless language switching for end users and SEO
- Builtin support for Firebase hosting i18n re-writes
  - https://firebase.google.com/docs/hosting/i18n-rewrites
- Generation of locale-specific URLs using subdirectories with gTLD, fully compatible with Google SEO
  - https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites#locale-specific-urls

<br/><br/>

## Installation
``` sh

npm i @iyio/ni18

# -or-

pnpm i @iyio/ni18

# -or-

yarn add @iyio/ni18

```

<br/><br/>

## Configuration
<br>

### 1. Create a config file named ni18-config.json

./ni18-config.json

``` json
{
    "locales":["en-US","es-MX"],
    "domain":"example.com"
}
```
*(note. Domain is needed to support alternate language page links and is not required during development)*
<br/>



### 2. Add ReactNi18Context.Provider to the App component

./pages/_app.(jsx|tsx)

``` diff
import type { AppProps } from 'next/app'
import '../styles/globals.css'
+import Head from 'next/head';
+import { initNi18, useNi18Links } from '@iyio/ni18';
+import i18nConfig from '../ni18-config.json';

+initNi18(ni18Config)
 
function MyApp({ Component, pageProps }: AppProps) {

+  const localeLinks=useNi18Links(locales);

  return (
+    <>
+      <Head>
+        {localeLinks}
+      </Head>
      <Component {...pageProps} />
+    </>
  )
 }
 
 export default MyApp
```
<br/>


### 3. Apply ni18 config to next.config.js using the withNi18 function

./next.config.js

``` diff
+const { withNi18 } = require('@iyio/ni18')

/** @type {import('next').NextConfig} */
-const nextConfig = {
+const nextConfig = withNi18({
  reactStrictMode: true,
-}
+})

module.exports = nextConfig;

```
<br/>


### 4. Add git ignore for build output and dev overrides

./.gitignore

``` diff
+ # i18n
+ /out-ni18
+ .ni18-dev-override
```
<br/>

### 6. ( optional ) Update build command

./package.json

``` diff
{
  "name": "next-default",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
-    "build": "next build",
+    "build": "ni18",
    "start": "next start",
    "lint": "next lint"
  },

  ...
```
<br/>

### 7. ( optional ) Add dev-ni18 api route to support switch languages in development mode

./pages/api/dev-ni18.(js|ts)

``` ts
import { devNi18Handler as handler } from "@iyio/ni18";
export default handler;
```

<br/><br/>

## Usage in code
The primary functions used while coding are the locale and setLocaleAsync functions, they
get and set the current locale.

``` ts
/**
 * Returns the current language and region (i.e. en-US)
 * locale() is shorthand for getNi18Locale().tag
 */
function locale():string;

/**
 * Sets the current locale. Calling this function server side will not effect clients
 */
async function setLocaleAsync(locale:string|Ni18Locale|null);

```

<br/>

### Using with getStaticProps

``` ts

import { locale } from '@iyio/ni18';

export const getStaticProps:GetStaticProps=async ()=>
{
  const response=await fetch(`https://awesome.io/api/cool-stuff?locale=${locale()}`);
  const content=await response.json();
  return {props:{awesomeContent:content}}
}
```

<br/>

### Using with Components

``` tsx

import { locale, setLocaleAsync } from '@iyio/ni18';

export function LocalePicker(){

    return (
        <div>
            <h2>Current locale is {locale()}</h2>
            <p>
                <button onClick={()=>setLocaleAsync('en-US')}>en-US</button>
                <button onClick={()=>setLocaleAsync('es-MX')}>es-MX</button>
            </p>
        </div>
    )

}
```
<br/>

## Usage at build time
The ni18 command can be used via npx or directly from package scripts

``` sh
# Build from command line

# use default config (./ni18-config.json)
npx ni18

# use with custom config and domain
npx ni18 -c custom-config.json --domain example.com

```

./package.json
``` json
{
    "scripts":{
        "build":"ni18"
    }
}
```

<br/><br/>

## Config files
ni18 config files implement the Ni18Config interface.

*(note. aliases are used by the cli. Config arguments can be passes by property name or alias )*
``` ts
export interface Ni18Config
{
    /**
     * An array of language-region tags.
     * @example ['en-US','en-MX','da-DK']
     * @alias r
     */
    locales:string[];

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
     * @alias m
     */
    cookiesLocalesSubDir:string;
}
```

Example ni18 config file
``` json
{
    "locales":["en-US","es-MX"],
    "domain":"example.com",
    "out":"./out-ni18",
    "nextOut":"./out",
    "localesSubDir":"lr",
    "cookiesLocalesSubDir":"lrc",
}
```

<br/>

## Command line args
ni18 command line args implement the Ni18CliArgs interface which extends the Ni18Config interface.
Arguments can be passed either by property name preceded by 2 hyphens ( ---{propName} )
or by alias preceded by a single hyphen ( -{alias})

``` ts
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
```

The below examples are equivalent, the first example uses property names and the other uses aliases

``` sh

# using property names
ni18 --domain example.com --localesSubDir other-languages --locales en-US es-MX

# using aliases
ni18 -d example.com -l other-languages -r en-US es-MX

```