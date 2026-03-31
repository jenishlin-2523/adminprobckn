import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOGG3jNKCraTLY-UcOncWNUwojMZ3lbMA",
  authDomain: "fir-test-2de2f.firebaseapp.com",
  projectId: "fir-test-2de2f",
  storageBucket: "fir-test-2de2f.firebasestorage.app",
  messagingSenderId: "583125157391",
  appId: "1:583125157391:web:c85e46b820cc35a7dd057a"
};

// Initialize Firebase securely (prevent multiple initializations in Next.js HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
