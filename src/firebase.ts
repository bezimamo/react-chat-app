// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getDatabase,
  ref as rtdbRef,
  set,
  onDisconnect,
  onValue,
  update,
} from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDg3tkswRlwlqjTym1CxRoBngLhCXigRRo",
  authDomain: "chat-app-10384.firebaseapp.com",
  projectId: "chat-app-10384",
  storageBucket: "chat-app-10384.appspot.com",
  messagingSenderId: "19285349661",
  appId: "1:19285349661:web:7e7d776a0ca377613c7df4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const rtdb = getDatabase(app);

// ✅ Function to add a user to Realtime Database
export const addUserToRealtimeDB = async (
  uid: string,
  username: string,
  email: string,
  photoURL: string,
  name: string
) => {
  const userRef = rtdbRef(rtdb, `users/${uid}`);
  await set(userRef, {
    userId: uid,
    username,
    email,
    photoURL,
    name,
    isOnline: true,
    lastSeen: null,
  });
};

// ✅ Function to set online status and update on disconnect
export const setupOnlineStatus = (userId: string) => {
  const userRef = rtdbRef(rtdb, `users/${userId}`);
  const connectedRef = rtdbRef(rtdb, ".info/connected");

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) return;

    // Set onDisconnect: set offline and update lastSeen
    onDisconnect(userRef).update({
      isOnline: false,
      lastSeen: Date.now(),
    });

    // Set online now
    update(userRef, {
      isOnline: true,
      lastSeen: Date.now(),
    });
  });
};
