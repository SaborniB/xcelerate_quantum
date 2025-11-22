import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Safe initialization that doesn't crash if config is missing or process is undefined
try {
  const envConfig = (typeof process !== 'undefined' && process.env) ? process.env.FIREBASE_CONFIG : null;
  const firebaseConfig = envConfig ? JSON.parse(envConfig) : {};
  
  // Only initialize if we have at least a project ID or similar to avoid immediate errors
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Auto-sign in anonymously for session tracking
    signInAnonymously(auth).catch(console.error);
  } else {
    console.warn("Firebase config not found. App will run in local-only mode.");
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

export { auth, db };