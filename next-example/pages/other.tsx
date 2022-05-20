import { ExampleLocalePicker, locale } from '@iyio/ni18';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getStrings, Strings } from '../strings';
import styles from '../styles/Home.module.css';


export const getStaticProps:GetStaticProps=()=>
{
  return {props:{strings:getStrings('other',locale())}}
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

        <p>locale = {locale()}</p>

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
