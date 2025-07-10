
'use client';

import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirestoreReady } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a minimal loader component to be used ONLY during the initial auth check.
function InitialAuthLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render,
    // which is what we want for client-side-only logic.
    setIsClient(true); 

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // First, wait for Firestore to be ready.
      await isFirestoreReady();
      // Then, set the user and mark loading as complete.
      setUser(currentUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const userSignOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);


  const value = useMemo(() => ({
    user,
    isLoading,
    userSignOut,
  }), [user, isLoading, userSignOut]);

  // Always render children to prevent hydration mismatch.
  // The loader will be rendered on top of the children only on the client-side when loading.
  return (
    <AuthContext.Provider value={value}>
      {isClient && isLoading && <InitialAuthLoader />}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
