import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from "date-fns";
import { Message, Contact } from "../types";
import Picker, { EmojiClickData } from "emoji-picker-react";

interface ChatAreaProps {
  selectedContact: Contact;
  onContactSelect: (contact: Contact) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedContact }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Fetch messages from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", selectedContact.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            uid: data.uid,
            receiverId: data.receiverId,
            createdAt: data.createdAt,
          };
        });
        setMessages(messages);
      },
      (error) => {
        console.error("Error loading messages:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedContact]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      uid: auth.currentUser?.uid,
      receiverId: selectedContact.id,
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  // Handle adding emoji
  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
    
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg mb-4">
          <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
          <p className="text-sm text-gray-600">Online</p>
        </div>

        {messages.map((msg) => {
          const isSender = msg.uid === auth.currentUser?.uid;
          const time = msg.createdAt
            ? format(msg.createdAt.toDate(), "hh:mm a")
            : "";

          return (
            <div
              key={msg.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                  isSender
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="block text-xs text-right mt-1 opacity-70">
                  {time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input & Emoji Picker */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="cursor-pointer text-xl"
          >
            😀
          </div>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Send
          </button>
        </form>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <Picker onEmojiClick={handleEmojiSelect} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
