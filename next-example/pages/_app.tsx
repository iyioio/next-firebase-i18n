import type { AppProps } from 'next/app';
import i18nConfig from '../i18n-config.json';
import { ReactLocalsContext, useCreateLocals } from '../lib/local';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {

  const locals=useCreateLocals(i18nConfig)

  return (
    <ReactLocalsContext.Provider value={locals}>
      <Component {...pageProps} />
    </ReactLocalsContext.Provider>
  )
}

export default MyApp
