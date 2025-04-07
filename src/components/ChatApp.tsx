import React, { useState } from "react";
import UserPanel from "./UserPanel";
import ChatArea from "./ChatArea";
import FriendDetail from "./FriendDetail";
import { Contact } from "../types";

const ChatApp: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-r from-purple-100 to-blue-200 flex justify-center items-center">
      <div className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/5 bg-gray-50 border-r overflow-y-auto">
          <UserPanel onSelectContact={setSelectedContact} />
        </div>

        {/* Center Chat */}
        <div className="w-3/5 overflow-y-auto">
        {selectedContact ? (
  <ChatArea selectedContact={selectedContact as Contact} />
) : (
  <div className="h-full flex items-center justify-center text-gray-500">
    Select a contact to start chatting.
  </div>
)}

        </div>

        {/* Right Panel */}
        <div className="w-1/5 bg-gray-50 overflow-y-auto">
          <FriendDetail contact={selectedContact} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
