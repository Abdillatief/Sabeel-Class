// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyC9QkZnbeE-ZjQCsocyLrFVQMuCxyY-LGY",
  authDomain: "sabeel-class.firebaseapp.com",
  projectId: "sabeel-class",
  storageBucket: "sabeel-class.firebasestorage.app",
  messagingSenderId: "774385280671",
  appId: "1:774385280671:web:c07429faa46419dfe1a4aa",
  measurementId: "G-H1TBL2XMHT"
};

// Initialize Firebase safely (prevents duplicate app initialization in hot reloads)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (safe initialization for browser / Cloudflare Pages / environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Gracefully handle environments where analytics is not supported
  });

  // Validate Firestore server connection
  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn("Firestore connection: the client is currently offline or connecting.");
      }
    }
  }
  testConnection();
}
