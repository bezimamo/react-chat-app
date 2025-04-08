import React, { useEffect, useState } from "react";
import { FaUserEdit, FaSearch, FaCog, FaSignOutAlt } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signOut, User } from "firebase/auth";
import { Contact } from "../types";
import { useNavigate } from "react-router-dom";

interface UserPanelProps {
  onSelectContact: (contact: Contact) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const auth = getAuth();
  const navigate = useNavigate();

  // Get current user info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Fetch contacts in real-time from Firestore
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

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full px-4 py-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-500 text-white">
          <FaUserEdit size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {user?.displayName || "User"}
          </h2>
          <p className="text-sm text-green-500">Online</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contacts..."
          className="w-full px-4 py-2 pl-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-sm dark:bg-gray-800 dark:text-white"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300" />
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800 transition-shadow shadow-sm dark:shadow-none"
          >
            <div className="w-16 h-12 flex items-center justify-center rounded-full bg-gray-500 text-white">
              <FaUserEdit size={28} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                {contact.name}
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                {contact.email || "No messages yet"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Button */}
      <div className="relative">
        <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <FaCog size={20} />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2 font-semibold transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
};

export default UserPanel;
