import { initNi18, useNi18Links } from '@iyio/ni18';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import ni18Config from '../ni18-config.json';
import '../styles/globals.css';

initNi18(ni18Config)

function MyApp({ Component, pageProps }: AppProps) {

  const localeLinks=useNi18Links();

  return (
    <>
      <Head>
        {localeLinks}
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
