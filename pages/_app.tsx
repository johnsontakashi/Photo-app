import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="app-background" />
      <AppProvider i18n={{}}>
        <Component {...pageProps} />
      </AppProvider>
    </>
  );
}

export default MyApp;