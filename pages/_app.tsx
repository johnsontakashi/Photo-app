import type { AppProps } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import { useRouter } from 'next/router';
import { useAuth, isProtectedRoute } from '@/lib/auth';
import { useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if user is not authenticated and trying to access protected route
    if (!isLoading && !isAuthenticated && isProtectedRoute(router.pathname)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router.pathname, router]);

  // Show loading screen while checking authentication for protected routes
  if (isLoading && isProtectedRoute(router.pathname)) {
    return (
      <>
        <div className="app-background" />
        <AppProvider i18n={{}}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-lg">
                <div className="loading-spinner" />
              </div>
              <h3 className="heading-4 text-primary mb-sm">Loading...</h3>
              <p className="text-secondary">Checking authentication status</p>
            </div>
            
            <style jsx>{`
              .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </AppProvider>
      </>
    );
  }

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