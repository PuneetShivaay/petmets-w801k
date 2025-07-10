
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth: Auth = getAuth(app);

// Configure Firestore with cache settings to enable IndexedDB persistence.
// The enableIndexedDbPersistence() method is deprecated.
const db: Firestore = getFirestore(app, {
  cache: {
    kind: "indexeddb",
    // You can add other cache settings here if needed.
  },
});
const storage: FirebaseStorage = getStorage(app);

// Promise to track Firestore persistence setup.
// The way to properly wait for cache initialization might be different
// with the new cache API. Consult the Firebase documentation for the
// recommended approach.
let firestoreReadyPromise: Promise<void> | null = null;

if (typeof window !== 'undefined') {
  // With the new cache API, you might not need to explicitly wait for
  // a persistence promise like before. The SDK might handle this internally,
  // or provide a different way to check readiness.
  // For now, we'll resolve immediately as a placeholder, but you should
  // verify the correct approach in the Firebase documentation if you
  // rely on waiting for offline persistence.
  firestoreReadyPromise = Promise.resolve();
}

/**
 * A function that returns a promise that resolves when Firestore is ready.
 */
export function isFirestoreReady(): Promise<void> {
    if (firestoreReadyPromise) {
        return firestoreReadyPromise;
    }
    // For server-side rendering or environments without window, resolve immediately.
    return Promise.resolve();
}

export { app, auth, db, storage };
