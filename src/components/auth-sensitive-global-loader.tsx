
'use client';

import { useAuth } from '@/contexts/auth-context';
import { GlobalLoader } from '@/components/global-loader';

/**
 * This component ensures that the GlobalLoader (which uses LoadingContext)
 * is only rendered after the AuthProvider has completed its initial loading state.
 * This helps prevent issues where GlobalLoader might attempt to access LoadingContext
 * prematurely during complex SSR or error page rendering scenarios.
 */
export function AuthSensitiveGlobalLoader() {
  const { isLoading: authIsLoading } = useAuth();

  if (authIsLoading) {
    // If auth is still loading, AuthProvider is displaying its own indicator.
    // We don't render the main GlobalLoader (which uses LoadingContext) yet.
    return null;
  }

  // Auth is resolved, now it's safe to render the main GlobalLoader
  // which relies on LoadingContext.
  return <GlobalLoader />;
}
