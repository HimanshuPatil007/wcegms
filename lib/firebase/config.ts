import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readFirebaseConfig(): FirebaseClientConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(", ")}.`,
    );
  }

  return config as FirebaseClientConfig;
}

export function isFirebaseConfigured() {
  return [
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ].every(Boolean);
}

let firebaseAppInstance: ReturnType<typeof initializeApp> | null = null;

export function getFirebaseApp() {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  const firebaseConfig = readFirebaseConfig();

  firebaseAppInstance =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  return firebaseAppInstance;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getRealtimeDatabase() {
  const firebaseConfig = readFirebaseConfig();

  return getDatabase(getFirebaseApp(), firebaseConfig.databaseURL);
}
