
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";

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
const db: Firestore = getFirestore(app);

// Promise to track Firestore persistence setup
let firestoreReadyPromise: Promise<void> | null = null;

if (typeof window !== 'undefined') {
  firestoreReadyPromise = enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore offline persistence enabled successfully.");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore offline persistence failed: Can only be enabled in one tab at a time.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore offline persistence is not supported in this browser.");
      } else {
        console.error("Firestore offline persistence failed with error:", err);
      }
      // In any case, resolve the promise so the app doesn't hang.
      // The app will work online, but offline support might be degraded.
    });
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

export { app, auth, db };
