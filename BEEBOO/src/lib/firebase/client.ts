
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Client-side Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDZKw6iVOyXQDZDU65HSaPQmPQUPDC6Sew",
  authDomain: "studio-4226976836-a33f4.firebaseapp.com",
  databaseURL: "https://studio-4226976836-a33f4-default-rtdb.firebaseio.com",
  projectId: "studio-4226976836-a33f4",
  storageBucket: "studio-4226976836-a33f4.appspot.com",
  messagingSenderId: "303794213169",
  appId: "1:303794213169:web:d55d9acdc7c27cabf56010"
};

// Initialize Firebase for the client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
