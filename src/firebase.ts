// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ Add GoogleAuthProvider
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyDg3tkswRlwlqjTym1CxRoBngLhCXigRRo",
  authDomain: "chat-app-10384.firebaseapp.com",
  projectId: "chat-app-10384",
  storageBucket: "chat-app-10384.appspot.com",
  messagingSenderId: "19285349661",
  appId: "1:19285349661:web:7e7d776a0ca377613c7df4"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ Add this line
export const db = getFirestore(app);
export const storage = getStorage(app);