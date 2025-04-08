
import { Timestamp } from "firebase/firestore";

export interface Contact {
  id: string;
  name: string;
  email?: string;  
    profilePic: string;
  photoURL?: string; 
  userId: string;
  username: string;
}

export interface Message {
  id: string;
  text: string;
  uid: string;
  receiverId: string;
  createdAt: Timestamp;
}

export interface FirestoreUser {
  userId: string;
  username: string;
}
// types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

