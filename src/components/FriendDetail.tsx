// src/components/FriendDetail.tsx

import React, { useEffect, useState } from "react";
import { Contact, Message } from "../types";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";
import { FaUserCircle } from "react-icons/fa";

interface FriendDetailProps {
  contact: Contact | null;
}

const FriendDetail: React.FC<FriendDetailProps> = ({ contact }) => {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [lastSeen, setLastSeen] = useState<string>("");

  useEffect(() => {
    if (!contact?.id) return;

    const fetchRecentMessages = async () => {
      const q = query(
        collection(db, "messages"),
        where("receiverId", "==", contact.id),
        orderBy("createdAt", "desc"),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const messages: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setRecentMessages(messages);

      if (messages.length > 0 && messages[0].createdAt) {
        const timestamp = messages[0].createdAt.toDate();
        const formatted = format(timestamp, "PPpp");
        setLastSeen(formatted);
      } else {
        setLastSeen("No recent activity");
      }
    };

    fetchRecentMessages();
  }, [contact]);

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a contact to view details.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between px-4 py-6 bg-[#EDF2F8] text-[#0A0F1D]">
      {/* Friend Info */}
      <div>
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-6xl text-[#2C3E50]" />
          <h3 className="text-lg font-semibold mt-2">{contact.name || "No Name"}</h3>
          <p className="text-sm text-gray-600">
            {contact.email ? contact.email : "No Email"}
          </p>
        </div>

        <div className="text-sm text-gray-700 mb-6 text-center">
          <p><span className="font-medium">Status:</span> Online</p>
          <p><span className="font-medium">Last seen:</span> {lastSeen}</p>
        </div>

        {/* Last 3 Messages */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 border-b pb-1">
            🗨️ Recent Messages
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="text-sm p-2 bg-white rounded shadow-sm"
                >
                  {msg.text}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No messages yet.</p>
            )}
          </div>
        </div>

        {/* Shared Links */}
        <div>
          <h4 className="text-md font-semibold mb-2 border-b pb-1">
            🔗 Shared Links
          </h4>
          <ul className="text-sm space-y-1 text-blue-700 underline">
            <li><a href="https://example.com" target="_blank" rel="noreferrer">https://example.com</a></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer">https://github.com</a></li>
            <li><a href="https://docs.google.com" target="_blank" rel="noreferrer">https://docs.google.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendDetail;
