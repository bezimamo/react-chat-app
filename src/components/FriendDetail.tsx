import React, { useEffect, useState } from "react";
import { Contact, Message } from "../types";
import { rtdb, auth } from "../firebase";
import { ref, onValue } from "firebase/database";
import { format } from "date-fns";
import { FaUserCircle } from "react-icons/fa";

interface FriendDetailProps {
  contact: Contact | null;
}

const FriendDetail: React.FC<FriendDetailProps> = ({ contact }) => {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [lastSeen, setLastSeen] = useState<string>("");

  useEffect(() => {
    if (!contact?.id || !auth.currentUser?.uid) return;

    const chatId1 = `${auth.currentUser.uid}_${contact.id}`;
    const chatId2 = `${contact.id}_${auth.currentUser.uid}`;
    const messagesRef = ref(rtdb, `messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const allChats = snapshot.val();
      let msgs: Message[] = [];

      if (allChats) {
        const selectedChat = allChats[chatId1] || allChats[chatId2];
        msgs = selectedChat
          ? Object.entries(selectedChat)
              .map(([key, val]: any) => ({
                id: key,
                text: val.text,
                uid: val.uid,
                receiverId: val.receiverId,
                createdAt: val.createdAt,
              }))
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 3)
          : [];
      }

      setRecentMessages(msgs);
      setLastSeen(
        msgs.length > 0
          ? format(new Date(msgs[0].createdAt), "PPpp")
          : "No recent activity"
      );
    });

    return () => unsubscribe();
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
          <h3 className="text-lg font-semibold mt-2">
            {contact.name || "No Name"}
          </h3>
          <p className="text-sm text-gray-600">
            {contact.email && contact.email.trim() !== "" ? contact.email : "No Email"}
          </p>
        </div>

        <div className="text-sm text-gray-700 mb-6 text-center">
          <p>
            <span className="font-medium">Status:</span>{" "}
            {contact.isOnline ? "Online" : "Offline"}
          </p>
          <p className="text-xs text-gray-500">
            Last seen: {lastSeen}
          </p>
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
          <p className="text-xs italic text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default FriendDetail;
