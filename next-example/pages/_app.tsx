import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useLocaleLinks } from '../components/LocaleLinks';
import i18nConfig from '../i18n-config.json';
import { ReactLocaleContext, useCreateLocaleContext } from '../lib/local';
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
