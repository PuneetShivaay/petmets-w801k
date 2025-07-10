
'use client';

import { useAuth } from '@/contexts/auth-context';
import { GlobalLoader } from '@/components/global-loader';

/**
 * This component is no longer required as the AuthProvider now handles its own
 * loading state internally and prevents child components from rendering until
 * authentication is resolved. The GlobalLoader is now used only for page transitions.
 * Keeping this file for now to avoid breaking imports, but it is effectively deprecated.
 * @deprecated
 */
export function AuthSensitiveGlobalLoader() {
  const { isLoading: authIsLoading } = useAuth();

  // The AuthProvider now renders its own loader, so we don't need to do anything here.
  if (authIsLoading) {
    return null;
  }

  // This will never be seen, as the GlobalLoader is now rendered directly in RootLayout
  return <GlobalLoader />;
}
