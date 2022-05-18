import { ExampleLocalePicker, getLanguageRegion } from '@iyio/ni18';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface Strings
{
  header:string;
  body:string;
}

const exampleStrings:{[lng:string]:Strings}={
  en:{
    header:'The OTHER weather tody',
    body:'It\'s hot and sunny'
  },
  es:{
    header:'El OTHER tiempo hoy',
    body:'Hace calor y está soleado'
  }
}

export function getStaticProps()
{
  const lr=getLanguageRegion();
  return {props:{strings:exampleStrings[lr.language] ?? exampleStrings.en}}
}

interface OtherProps
{
  strings:Strings;
}

const Other: NextPage<OtherProps> = ({strings}) => {

  return (
    <div className={styles.container}>
      <Head>
        <title>{strings.header}</title>
        <meta name="description" content="NextJs and Firebase i18n example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {strings.header}
        </h1>

        <p className={styles.description}>
          {strings.body}
        </p>

        <ExampleLocalePicker />

        <p><Link href={'/'}>Index</Link></p>
      </main>
    </div>
  )
}

export default Other
