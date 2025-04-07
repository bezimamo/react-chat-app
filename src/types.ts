import { Timestamp } from "firebase/firestore";

// Define the structure for messages
export interface MessageType {
  id: string; // Unique ID of the message
  text: string; // Message text
  uid: string; // Sender's user ID
  name: string | null; // Sender's name
  photo: string | null; // Sender's photo URL
  createdAt: Timestamp; // Timestamp when the message was created
  receiverId: string; // Receiver's user ID
  reactions?: Reaction[]; // Optional: Array of reactions to the message
  isEdited?: boolean; // Optional: Flag to mark if the message was edited
}

// Define the structure for contacts
export interface Contact {
  id: string; // Unique ID of the contact
  name: string; // Contact's name
  email: string; // Contact's email
  photoURL: string; // Contact's photo URL
  status?: "online" | "offline"; // Contact's online/offline status (optional)
}

// Define the structure for a reaction on a message
export interface Reaction {
  emoji: string; // Emoji used for reaction (e.g., "❤️", "😂")
  userId: string; // ID of the user who added the reaction
}
