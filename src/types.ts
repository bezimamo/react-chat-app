
import { Timestamp } from "firebase/firestore";

export interface Contact {
  id: string;
  name: string;
  email?: string;  
    profilePic: string;
  photoURL?: string; 
}

export interface Message {
  id: string;
  text: string;
  uid: string;
  receiverId: string;
  createdAt: Timestamp;
}
