// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref as rtdbRef, set } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDg3tkswRlwlqjTym1CxRoBngLhCXigRRo",
  authDomain: "chat-app-10384.firebaseapp.com",
  projectId: "chat-app-10384",
  storageBucket: "chat-app-10384.appspot.com",
  messagingSenderId: "19285349661",
  appId: "1:19285349661:web:7e7d776a0ca377613c7df4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const rtdb = getDatabase(app);

// Add user to Realtime Database
export const addUserToRealtimeDB = async (userId: string, name: string, email: string) => {
  try {
    await set(rtdbRef(rtdb, `users/${userId}`), {
      name,       // Changed key from 'username' to 'name'
      email,
      isOnline: true,
    });
  } catch (error) {
    console.error("Error adding user to Realtime Database:", error);
  }
};
