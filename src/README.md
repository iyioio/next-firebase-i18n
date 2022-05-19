# @iyio/ni18
ni18 adds internationalization support to NextJS projects using SSG ( next export ) without the need
to modify the routing.

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
    "locals":["en-US","es-MX"]
}
```
<br/>


### 2. Add ReactNi18Context.Provider to the App component

./pages/_app.(jsx|tsx)

``` diff
import type { AppProps } from 'next/app'
import '../styles/globals.css'
+import { ReactNi18Context, useCreateNi18Context, useNi18Links } from '@iyio/ni18';
+import Head from 'next/head';
+import i18nConfig from '../ni18-config.json';
 
 function MyApp({ Component, pageProps }: AppProps) {
+
+  const locals=useCreateNi18Context(i18nConfig)
+  const localeLinks=useNi18Links(locals);
+
+  return (
+    <ReactNi18Context.Provider value={locals}>
+      <Head>
+        {/* links to page in different languages */}
+        {/* <link rel="alternate" hreflang="es-mx" href="https://example.com/lr/es-MX/other"> */}
+        {localeLinks}
+      </Head>
      <Component {...pageProps} />
+    </ReactNi18Context.Provider>
+  )
 }
 
 export default MyApp
```
<br/>


### 3. Apply i18n config to next.config.js

./next.config.js

``` diff
+const { applyNi18nConfig } = require('@iyio/ni18')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

-module.exports = nextConfig;
+module.exports = applyNi18nConfig(nextConfig);

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

### 7. ( optional ) Add dev-i18n api route to support switch languages in development mode

./pages/api/dev-i18n.(js|ts)

``` ts
import { devI18nHandler as handler } from "@iyio/ni18";
export default handler;
```

<br/><br/>

## Usage
There are 3 distinct ares where ni18 can be used, in getStaticProps, in components and at build time.

<br/>

### Using with getStaticProps
getStaticProps functions can use the getLanguageRegion to reference the current locale

``` ts
// Current language is set to es-MX
export const getStaticProps:GetStaticProps=async ()=>
{
  const lr=getLanguageRegion();
  // lr.language === 'es'
  // lr.region === 'MX'
  // lr.tag === 'es-MX'
  const response=await fetch(`https://awesome.io/api/cool-stuff?lng=${lr.tag}`);
  const content=await response.json();
  return {props:{awesomeContent:content}}
}
```

<br/>

### Using within Components
Components can use the useNi18 hook to access the Ni18Context. Ni18Context.current is a reference
to a LanguageRegion object, the same as returned by getLanguageRegion. Ni18Context also allows
you to set the current locale

``` tsx
export function LocalePicker(){

    const locals=useNi18();

    return (
        <div>
            <h2>Current locale is {locals.current.tag}</h2>
            <p>
                <button onClick={()=>locals.setCurrentAsync('en-US')}>en-US</button>
                <button onClick={()=>locals.setCurrentAsync('es-MX')}>es-MX</button>
            </p>
        </div>
    )

}
```
<br/>

### Using at build time
The ni18 command can be used via npx or directly from package scripts

``` sh
# Build from command line

# use default config (./ni18-config.json)
npx ni18

# use with custom config and domain
npx ni18 -c custom-config.json --domain example.com

```

``` json
// ./package.json
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
```

Example ni18 config file
``` json
{
    "locals":["en-US","es-MX"],
    "domain":"example.com",
    "out":"./out-ni18",
    "nextOut":"./out",
    "localsSubDir":"lr",
    "cookiesLocalsSubDir":"lrc",
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

The below examples are equivalent, 1 uses property names and the other uses aliases

``` sh

# using property names
ni18 --domain example.com --localsSubDir other-languages --locals en-US es-MX

# using aliases
ni18 -d example.com -l other-languages -r en-US es-MX

```