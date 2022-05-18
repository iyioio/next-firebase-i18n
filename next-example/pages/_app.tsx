import { ReactNi18Context, useCreateNi18Context, useNi18Links } from '@iyio/ni18';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import i18nConfig from '../ni18-config.json';
import '../styles/globals.css';


function MyApp({ Component, pageProps }: AppProps) {

  const locals=useCreateNi18Context(i18nConfig)
  const localeLinks=useNi18Links(locals);

  return (
    <ReactNi18Context.Provider value={locals}>
      <Head>
        {localeLinks}
      </Head>
      <Component {...pageProps} />
    </ReactNi18Context.Provider>
  )
}

export default MyApp
