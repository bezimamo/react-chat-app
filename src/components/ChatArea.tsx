import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { MessageCircle } from "lucide-react";
import { MessageType, Contact } from "../types";
import Picker, { EmojiClickData } from "emoji-picker-react";

interface Props {
  selectedContact: Contact;
}

const ChatArea: React.FC<Props> = ({ selectedContact }) => {
  const [user] = useAuthState(auth);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false); // This tracks if the user is typing

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MessageType));
      const filtered = allMessages.filter(
        (msg) =>
          (msg.uid === user?.uid && msg.receiverId === selectedContact.id) ||
          (msg.uid === selectedContact.id && msg.receiverId === user?.uid)
      );
      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [selectedContact, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "" || !user) return;

    const messageData = {
      text: message,
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL,
      createdAt: serverTimestamp() as Timestamp,
      receiverId: selectedContact.id,
    };

    await addDoc(collection(db, "messages"), messageData);
    setMessage("");
    setIsTyping(false); // Reset typing status when the message is sent
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle typing indicator update
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(true);

    // Reset typing status after a delay (500ms)
    setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full px-4">
      <div className="border-b pb-2 mb-4 flex justify-center items-center gap-2">
        <MessageCircle className="text-blue-600" />
        <h2 className="text-lg font-semibold">{selectedContact.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs break-words px-4 py-2 rounded-2xl shadow text-sm ${
              msg.uid === user?.uid
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-gray-200 text-left"
            }`}
          >
            <div className="font-medium">{msg.name}</div>
            <div>{msg.text}</div>
            <div className="text-[10px] text-gray-500 mt-1">
              {msg.createdAt?.toDate()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) || "Just now"}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && <div className="text-sm text-gray-500 mt-2">Typing...</div>}

      <form onSubmit={sendMessage} className="mt-4 flex gap-2 items-center">
        <input
          value={message}
          onChange={handleTyping} // Updated handler for typing indicator
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none shadow"
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-2 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          😊
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Send
        </button>
      </form>

      {showEmojiPicker && (
        <div className="absolute bottom-16 left-2 z-10">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
