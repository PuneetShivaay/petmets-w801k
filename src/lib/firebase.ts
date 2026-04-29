import { initializeFirebase } from "@/firebase";
import { type FirebaseApp } from "firebase/app";
import { type Auth } from "firebase/auth";
import { type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// We use the central initialization logic to ensure consistency across the app
const { firebaseApp, auth, firestore: db } = initializeFirebase();

const storage: FirebaseStorage = getStorage(firebaseApp);

/**
 * A helper to ensure Firestore is ready. 
 * Since we are using standard initialization, we return a resolved promise.
 */
export async function isFirestoreReady(): Promise<void> {
    return Promise.resolve();
}

export { firebaseApp as app, auth, db, storage };
