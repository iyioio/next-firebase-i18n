import { ReactLocaleContext, useCreateLocaleContext, useLocaleLinks } from '@iyio/next-firebase-i18n';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import i18nConfig from '../i18n-config.json';
import '../styles/globals.css';


function MyApp({ Component, pageProps }: AppProps) {

  const locals=useCreateLocaleContext(i18nConfig)
  const localeLinks=useLocaleLinks(locals);

  return (
    <ReactLocaleContext.Provider value={locals}>
      <Head>
        {localeLinks}
      </Head>
      <Component {...pageProps} />
    </ReactLocaleContext.Provider>
  )
}

export default MyApp
