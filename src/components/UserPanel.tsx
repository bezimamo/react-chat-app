import React, { useEffect, useState } from "react";
import {
  FaUserEdit,
  FaUserPlus,
  FaSearch,
  FaCog,
  FaMoon,
  FaSun,
  FaDesktop,
  FaSignOutAlt,
} from "react-icons/fa";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Contact } from "../types"; // ✅ Import the Contact type
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth for sign-out functionality
import { useNavigate } from "react-router-dom"; // Correctly using useNavigate for React Router v6

// ✅ Define the prop types that the component will accept
interface UserPanelProps {
  onSelectContact: (contact: Contact) => void; // This prop will handle the contact selection
}

const UserPanel: React.FC<UserPanelProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]); // State to store contacts
  const [latestMessages, setLatestMessages] = useState<{ [contactId: string]: string }>({}); // State for storing the latest message for each contact
  const [mode, setMode] = useState<"light" | "dark" | "system">("light"); // State for theme mode
  const auth = getAuth(); // Firebase auth instance
  const navigate = useNavigate(); // Using useNavigate for navigation

  // Fetch contacts from Firestore when the component is mounted
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const contactList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(contactList); // Update contacts state with fetched data
    });

    // Clean up the subscription when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Fetch latest messages for each contact
  useEffect(() => {
    contacts.forEach((contact) => {
      const q = query(
        collection(db, "messages"),
        where("uid", "in", [auth.currentUser?.uid, contact.id]),
        where("receiverId", "in", [auth.currentUser?.uid, contact.id]),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestMessage = snapshot.docs[0].data().text;
          setLatestMessages((prev) => ({
            ...prev,
            [contact.id]: latestMessage,
          }));
        }
      });

      return () => unsubscribe();
    });
  }, [contacts]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      navigate("/"); // Redirect to login page or any other page you want
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Effect for setting the body class for theme switching
  useEffect(() => {
    const root = document.documentElement;

    if (mode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (mode === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, [mode]);

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-6 space-y-6 bg-gray-50 dark:bg-gray-900">
      {/* Profile */}
      <div className="flex items-center space-x-4">
        <img
          src={auth.currentUser?.photoURL || "https://i.pravatar.cc/100"}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{auth.currentUser?.displayName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">Online</p>
        </div>
      </div>

      {/* User Action Buttons */}
      <div className="flex justify-start items-center space-x-3">
        <button className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 dark:bg-purple-700 dark:hover:bg-purple-600">
          <FaUserEdit />
        </button>
        <button className="p-2 bg-green-100 rounded-full hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600">
          <FaUserPlus />
        </button>
        <button className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600">
          <FaSearch />
        </button>
        <button className="p-2 bg-yellow-100 rounded-full hover:bg-yellow-200 dark:bg-yellow-700 dark:hover:bg-yellow-600">
          <FaCog />
        </button>
      </div>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search contacts..."
        className="px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-sm dark:bg-gray-800 dark:text-white"
      />

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition dark:hover:bg-purple-700"
            onClick={() => onSelectContact(contact)} // ✅ Pass the selected contact to parent (ChatApp)
          >
            <img
              src={contact.photoURL}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{contact.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-300">{contact.email}</p>
              {/* Display the latest message under each contact */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {latestMessages[contact.id] || "No messages yet"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dark/Light/System Mode Switch */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setMode("light")}
          className={`p-2 rounded-full ${mode === "light" ? "bg-gray-300" : "bg-gray-100"} hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600`}
        >
          <FaSun />
        </button>
        <button
          onClick={() => setMode("dark")}
          className={`p-2 rounded-full ${mode === "dark" ? "bg-gray-300" : "bg-gray-100"} hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600`}
        >
          <FaMoon />
        </button>
        <button
          onClick={() => setMode("system")}
          className={`p-2 rounded-full ${mode === "system" ? "bg-gray-300" : "bg-gray-100"} hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600`}
        >
          <FaDesktop />
        </button>
      </div>

      {/* Logout Button */}
      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="w-full p-3 text-red-500 hover:bg-red-100 rounded-xl flex items-center justify-center space-x-2 dark:hover:bg-red-100"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserPanel;
