
import * as admin from 'firebase-admin';

export async function initAdmin() {
  if (!admin.apps.length) {
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
        console.log('✅ Firebase Admin initialized using default credentials.');
      }
    } catch (e: any) {
      console.error(
        '❌ Failed to initialize Firebase Admin:',
        e.message
      );
      throw new Error('Firebase Admin initialization failed. Ensure you are in a Firebase environment or have set FIREBASE_SERVICE_ACCOUNT in your .env file for local development.');
    }
  }
}

export default admin;
