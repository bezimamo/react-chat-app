import React, { useEffect, useState } from "react";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import { rtdb } from "../firebase";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { Contact } from "../types";
import { useNavigate } from "react-router-dom";
import { onValue, ref, set, update } from "firebase/database";

interface UserPanelProps {
  onSelectContact: (contact: Contact) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserName, setCurrentUserName] = useState<string>("User");
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);

  const auth = getAuth();
  const navigate = useNavigate();

  // Wait for auth state and set user info
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(rtdb, `users/${user.uid}`);

        // If displayName is missing (like for email/password signup), set it manually
        if (!user.displayName) {
          const emailName = user.email?.split("@")[0] || "User";
          updateProfile(user, {
            displayName: emailName,
          }).then(() => {
            set(userRef, {
              isOnline: true,
              lastSeen: null,
              name: emailName,
              email: user.email || "",
              photoURL: user.photoURL || null,
            });
          });
        } else {
          set(userRef, {
            isOnline: true,
            lastSeen: null,
            name: user.displayName,
            email: user.email || "",
            photoURL: user.photoURL || null,
          });
        }

        // Listen for updates to current user data
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          setCurrentUserName(data?.name || user.displayName || "User");
          setCurrentUserPhoto(data?.photoURL || null);
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Update presence (online/offline)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(rtdb, `users/${user.uid}`);
    update(userRef, {
      isOnline: true,
      lastSeen: null,
    });

    return () => {
      update(userRef, {
        isOnline: false,
        lastSeen: Date.now(),
      });
    };
  }, [auth.currentUser?.uid]);

  // Load all contacts
  useEffect(() => {
    const contactsRef = ref(rtdb, "users");
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactList = Object.entries(data).map(([id, value]: any) => ({
          id,
          name: value.name || value.email || "Unnamed",
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

  const renderProfile = (photoURL: string | null, name: string) => {
    if (photoURL) {
      return (
        <img
          src={photoURL}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      );
    } else {
      const firstLetter = name?.charAt(0).toUpperCase() || "U";
      return <span className="text-xl font-bold">{firstLetter}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500 text-white overflow-hidden">
          {renderProfile(currentUserPhoto, currentUserName)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {currentUserName}
          </h2>
          <p className="text-sm text-green-500">Online</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contacts..."
          className="w-full px-4 py-2 pl-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-sm dark:bg-gray-800 dark:text-white"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300" />
      </div>

      {/* Scrollable Contacts List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
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
                <span className="text-xs font-semibold">
                  {contact.name?.charAt(0).toUpperCase() || "U"}
                </span>
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
      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2 font-semibold transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserPanel;
