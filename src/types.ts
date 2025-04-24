export interface Contact {
  id: string;
  name: string;
  email?: string;
  profilePic?: string;
  photoURL?: string;
  userId: string;
  username: string;
  lastSeen?: number;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  text: string;
  uid: string;
  receiverId: string;
  createdAt: number;
}

export interface FirestoreUser {
  userId: string;
  username: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  lastSeen?: number | null;
  isOnline?: boolean;
}
