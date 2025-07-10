
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [firestoreReady, setFirestoreReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    
    // Check for Firestore readiness
    isFirestoreReady().then(() => {
        setFirestoreReady(true);
    });

    return () => unsubscribe();
  }, []);

  const userSignOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const isLoading = isAuthLoading || !firestoreReady;

  const value = useMemo(() => ({
    user,
    isLoading, // We only expose a single loading flag to consumers
    userSignOut,
  }), [user, isLoading, userSignOut]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="sr-only">Loading application...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
