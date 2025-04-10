import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { rtdb } from "../firebase"; 
import { getAuth, signOut } from "firebase/auth";
import { Contact } from "../types";
import { useNavigate } from "react-router-dom";
import { onValue, ref } from "firebase/database";

interface UserPanelProps {
  onSelectContact: (contact: Contact) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>("");

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUserRef = ref(rtdb, `users/${auth.currentUser?.uid}`);
    const unsubscribe = onValue(currentUserRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Current user data:", data);
      setCurrentUserName(data?.username || data?.name || data?.email || "User");
      setCurrentUserPhoto(data?.photoURL || "");
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    const contactsRef = ref(rtdb, "users");
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactList = Object.entries(data).map(([id, value]: any) => ({
          id,
          name: value.username || value.name || value.email || "Unnamed",
          isOnline: value.isOnline || false,
          lastSeen: value.lastSeen || null,
          email: value.email || "", 
          photoURL: value.photoURL || "",
        })) as Contact[];

        setContacts(contactList);
      } else {
        setContacts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredContacts = contacts
    .filter((contact) => contact.id !== auth.currentUser?.uid)
    .filter((contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const formatLastSeen = (timestamp: number | null | undefined) => {
    if (!timestamp) return "Last seen unknown";
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `Last seen ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Last seen ${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `Last seen ${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full px-4 py-4 space-y-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500 text-white overflow-hidden">
          {currentUserPhoto ? (
            <img
              src={currentUserPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUserCircle size={40} />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {currentUserName}
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
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white relative overflow-hidden">
              {contact.photoURL ? (
                <img
                  src={contact.photoURL}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle size={28} />
              )}
              <span
                className={`absolute bottom-0 right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  contact.isOnline ? "bg-green-400" : "bg-gray-400"
                }`}
              ></span>
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                {contact.name}
              </h4>
              <p className="text-xs text-gray-500 italic">
                {contact.isOnline
                  ? "Online"
                  : formatLastSeen(contact.lastSeen)}
              </p>
            </div>
          </div>
        ))}
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
