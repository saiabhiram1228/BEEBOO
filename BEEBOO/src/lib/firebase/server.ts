
'use server';
import * as admin from 'firebase-admin';

// This is a singleton to prevent re-initialization
let isInitialized = false;

export async function initAdmin() {
  if (isInitialized) {
    return;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // If the service account is available in environment variables (local dev), use it.
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      
      // This is the crucial fix: It replaces the literal `\n` characters in the
      // private key with actual newline characters.
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized from environment variable.');
    } else {
      // Otherwise, use default credentials (for deployed App Hosting environment).
      admin.initializeApp();
      console.log('✅ Firebase Admin initialized using application default credentials.');
    }
    isInitialized = true;
  } catch (e: any) {
    console.error(
      '❌ Failed to initialize Firebase Admin:',
      e.message
    );
    // For App Hosting, this should not be reached if the environment is set up correctly.
    throw new Error('Firebase Admin initialization failed. Ensure you are in a Firebase environment or have set FIREBASE_SERVICE_ACCOUNT in your .env.local file for local development.');
  }
}

export { admin };
