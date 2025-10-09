
import * as admin from 'firebase-admin';
import 'dotenv/config';

// This is a singleton to prevent re-initialization
let isInitialized = false;

export function initAdmin() {
  if (isInitialized) {
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
      if (process.env.NODE_ENV === 'production') {
        console.error('🔥 FATAL: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set in production.');
        // In production, you might want to throw an error to stop the process
        throw new Error('Firebase Admin SDK service account is not configured.');
      } else {
        // In development, we can warn but allow the app to continue,
        // though server-side Firebase calls will fail.
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON is not set. Server-side Firebase calls will fail.');
        return;
      }
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
    }
    isInitialized = true;
  } catch (e: any) {
    console.error(
      '❌ Firebase Admin initialization failed. Check your FIREBASE_SERVICE_ACCOUNT_JSON environment variable.',
      e.message
    );
    throw e;
  }
}

export default admin;
