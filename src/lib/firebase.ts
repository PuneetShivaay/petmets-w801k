
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
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
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Promise to track Firestore persistence setup.
let firestoreReadyPromise: Promise<void> | null = null;
if (typeof window !== 'undefined') {
  firestoreReadyPromise = enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn(
                'Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a a time.'
            );
        } else if (err.code === 'unimplemented') {
            console.warn(
                'Firestore persistence failed: The current browser does not support all of the features required to enable persistence.'
            );
        }
        return Promise.resolve(); // Non-fatal, let the app continue online.
    });
}

/**
 * A function that returns a promise that resolves when Firestore persistence has been set up.
 * This is the signal that the database is ready for read/write operations.
 */
export function isFirestoreReady(): Promise<void> {
    if (firestoreReadyPromise) {
        return firestoreReadyPromise;
    }
    // For server-side rendering or environments without persistence, resolve immediately.
    return Promise.resolve();
}

export { app, auth, db, storage };
