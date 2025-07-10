
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
    // This effect runs only on the client, after the component has mounted.
    // This prevents hydration errors by ensuring server and client renders match initially.
    setIsClient(true);

    const checkAuthAndFirestore = async () => {
      // Wait for Firestore to be ready first.
      await isFirestoreReady();
      
      // onAuthStateChanged returns an unsubscribe function
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      });
      
      // Cleanup subscription on unmount
      return () => unsubscribe();
    };

    checkAuthAndFirestore();
  }, []);

  const userSignOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);


  const value = useMemo(() => ({
    user,
    isLoading,
    userSignOut,
  }), [user, isLoading, userSignOut]);

  // The AuthProvider is now the strict gatekeeper.
  // It will show a loader and prevent any children from rendering
  // until the initial authentication check is complete.
  // The isClient check prevents the loader from rendering on the server.
  return (
    <AuthContext.Provider value={value}>
      {isLoading && isClient ? <InitialAuthLoader /> : children}
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
