# @iyio/next-firebase-i18n
The @iyio/next-firebase-i18n package adds internationalization support to NextJS SSG projects hosted on Firebase without the need to modify the routing structure of your project.

<br/><br/>

## Installation
``` sh

npm i @iyio/next-firebase-i18n

# -or-

pnpm i @iyio/next-firebase-i18n

# -or-

yarn add @iyio/next-firebase-i18n

```

<br/><br/>

## Configuration
<br>

### 1. Create a config file named i18n-config.json

./i18n-config.json

``` json
{
    "locals":["en-US","es-MX"]
}
```
<br/>


### 2. Add ReactLocaleContext.Provider to the App component

./pages/_app.(jsx|tsx)

``` diff
import type { AppProps } from 'next/app'
import '../styles/globals.css'
+import { ReactLocaleContext, useCreateLocaleContext, useLocaleLinks } from '@iyio/next-firebase-i18n';
+import Head from 'next/head';
+import i18nConfig from '../i18n-config.json';
 
 function MyApp({ Component, pageProps }: AppProps) {
+
+  const locals=useCreateLocaleContext(i18nConfig)
+  const localeLinks=useLocaleLinks(locals);
+
+  return (
+    <ReactLocaleContext.Provider value={locals}>
+      <Head>
+        {localeLinks}
+      </Head>
      <Component {...pageProps} />
+    </ReactLocaleContext.Provider>
+  )
 }
 
 export default MyApp
```
<br/>


### 3. Apply i18n config to next.config.js

./next.config.js

``` diff
+const { applyNextI18nConfig } = require('@iyio/next-firebase-i18n')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

-module.exports = nextConfig;
+module.exports = applyNextI18nConfig(nextConfig);

```
<br/>


### 4. Add git ignore for build output and dev overrides

./.gitignore

``` diff
+ # i18n
+ /out-i18n
+ .i18n-dev-override
```
<br/>

### 5. ( optional ) Add dev-i18n api route to support switch languages in development mode

./pages/api/dev-i18n.(js|ts)

``` ts
import { devI18nHandler as handler } from "@iyio/next-firebase-i18n";
export default handler;
```