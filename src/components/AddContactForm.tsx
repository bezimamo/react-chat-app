import { auth, db } from "../firebase"; // Import Firebase
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const addContact = async (name: string, email: string) => {
  // Ensure the user is logged in
  if (auth.currentUser) {
    const userId = auth.currentUser.uid; // Get the logged-in user's UID

    // Document reference to store contacts under the user's "contacts" sub-collection
    const contactRef = doc(db, "users", userId, "contacts", email); // Email as the document ID

    try {
      // Add the contact to Firestore with the contact's name and email
      await setDoc(contactRef, { name, email });
      console.log("Contact added successfully!");
    } catch (error) {
      console.error("Error adding contact: ", error);
    }
  } else {
    console.log("User is not authenticated");
  }
};
