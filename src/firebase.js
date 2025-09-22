// frontend/src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app"; // ✅ add getApps and getApp
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIzQrbunXh0hheLLjgLxsxRPHin4F-JLI",
  authDomain: "GAMEDO.firebaseapp.com",
  projectId: "gamedo-3c3c4-app-463d2",
  storageBucket: "gamedo-3c3c4.appspot.com", // fix typo: removed extra 'Y'
  messagingSenderId: "1234567890",
  appId: "1:305957267488:web:626042e474e73ff7de3445",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.log("Multiple tabs open, persistence failed");
  } else if (err.code === "unimplemented") {
    console.log("Browser not supported");
  }
});
