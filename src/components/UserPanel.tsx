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
import { Contact } from "../types";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface UserPanelProps {
  onSelectContact: (contact: Contact) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [latestMessages, setLatestMessages] = useState<{ [contactId: string]: string }>({});
  const [mode, setMode] = useState<"light" | "dark" | "system">("light");

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const contactList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(contactList);
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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
    <div className="flex flex-col h-full px-4 pt-4 pb-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <img
          src={auth.currentUser?.photoURL || "https://i.pravatar.cc/100"}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover shadow-md"
        />
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{auth.currentUser?.displayName}</h2>
          <p className="text-sm text-green-500">Online</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {[{ icon: <FaUserEdit />, color: "purple" },
          { icon: <FaUserPlus />, color: "green" },
          { icon: <FaSearch />, color: "blue" },
          { icon: <FaCog />, color: "yellow" },
        ].map(({ icon, color }, idx) => (
          <button
            key={idx}
            className={`p-2 rounded-full bg-${color}-100 dark:bg-${color}-700 hover:bg-${color}-200 dark:hover:bg-${color}-600 transition`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search contacts..."
        className="px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-sm dark:bg-gray-800 dark:text-white"
      />

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800 transition-shadow shadow-sm dark:shadow-none"
          >
            <img
              src={contact.photoURL}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{contact.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-300">{contact.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                {latestMessages[contact.id] || "No messages yet"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Theme Toggle */}
      <div className="flex justify-between items-center">
        {[{ mode: "light", icon: <FaSun /> },
          { mode: "dark", icon: <FaMoon /> },
          { mode: "system", icon: <FaDesktop /> },
        ].map(({ mode: m, icon }, idx) => (
          <button
            key={idx}
            onClick={() => setMode(m as "light" | "dark" | "system")}
            className={`p-2 rounded-full transition ${
              mode === m
                ? "bg-purple-200 dark:bg-purple-600 text-purple-900 dark:text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2 font-semibold transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
};

export default UserPanel;
