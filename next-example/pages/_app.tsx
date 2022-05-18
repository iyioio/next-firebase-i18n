import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useLocalLinks } from '../components/LocalLinks';
import i18nConfig from '../i18n-config.json';
import { ReactLocalsContext, useCreateLocals } from '../lib/local';
import '../styles/globals.css';


function MyApp({ Component, pageProps }: AppProps) {

  const locals=useCreateLocals(i18nConfig)
  
  const localLinks=useLocalLinks(locals);

  return (
    <ReactLocalsContext.Provider value={locals}>
      <Head>
        {localLinks}
      </Head>
      <Component {...pageProps} />
    </ReactLocalsContext.Provider>
  )
}

export default MyApp
