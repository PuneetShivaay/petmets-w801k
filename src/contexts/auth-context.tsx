
'use client';

import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react'; // Import Loader2 for self-contained loader

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True until first auth check completes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const userSignOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // User state will be updated by onAuthStateChanged
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    userSignOut,
  }), [user, isLoading, userSignOut]);

  // This is the key change: while auth state is being determined,
  // we show a full-page loader here and do NOT render the rest of the app.
  // This prevents any child components from trying to access Firebase services
  // before they are ready and the user's auth status is known.
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
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
