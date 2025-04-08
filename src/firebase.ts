// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Firestore, Authentication, and Storage exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// TypeScript type for Firestore User data
export interface FirestoreUser {
  userId: string;
  username: string;
}

// Add user to Firestore
export const addUserToFirestore = async (userId: string, username: string) => {
  try {
    await addDoc(collection(db, 'users'), {
      userId,
      username,
    });
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
  }
};

// Fetch all users from Firestore
export const fetchUsersFromFirestore = async (): Promise<FirestoreUser[]> => {
  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    const userList: FirestoreUser[] = userSnapshot.docs.map(doc => ({
      userId: doc.id,  // Document ID is used as userId
      username: doc.data().username,
    }));

    return userList;
  } catch (error) {
    console.error('Error fetching users from Firestore: ', error);
    return [];
  }
};

// Fetch messages between the user and a contact, ordered by timestamp
export const fetchMessagesBetweenUsers = (userId: string, contactId: string) => {
  const q = query(
    collection(db, "messages"),
    where("uid", "in", [userId, contactId]),
    where("receiverId", "in", [userId, contactId]),
    orderBy("createdAt", "desc"),
    limit(1)  // Fetch the most recent message
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const latestMessage = snapshot.docs[0].data().text;
      console.log(`Latest message between ${userId} and ${contactId}:`, latestMessage);
      return latestMessage; // Return the latest message
    } else {
      console.log("No messages yet");
      return "No messages yet"; // No messages found
    }
  });
};

// Optional: You can also add a query to fetch specific users if needed, e.g., based on username
export const fetchUserByUsername = async (username: string): Promise<FirestoreUser | null> => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return {
      userId: userDoc.id,
      username: userDoc.data().username,
    };
  } catch (error) {
    console.error('Error fetching user by username: ', error);
    return null;
  }
};
