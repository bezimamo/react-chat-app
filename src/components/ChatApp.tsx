import React, { useState } from "react";
import UserPanel from "./UserPanel";
import ChatArea from "./ChatArea";
import FriendDetail from "./FriendDetail";
import { Contact } from "../types";

const ChatApp: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-200 flex flex-col">
      {/* Header */}
      <header className="text-center py-4 text-3xl font-bold text-purple-800 shadow-md bg-white">
        AwuraChat
      </header>

      <div className="flex flex-grow p-4 gap-2 md:flex-row flex-col">
        {/* Left Panel - User List */}
        <div className="md:w-1/5 w-full bg-gray-50 border-r overflow-y-auto rounded-2xl md:rounded-l-2xl shadow-sm">
          <UserPanel onSelectContact={setSelectedContact} />
        </div>

        {/* Center Area */}
        <div className="md:w-3/5 w-full overflow-y-auto bg-white rounded-lg shadow-inner">
          {selectedContact ? (
            <ChatArea
              selectedContact={selectedContact}
              onContactSelect={setSelectedContact}
            />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-gray-500 text-center p-8">
              <h2 className="text-2xl font-semibold mb-4">Welcome to AwuraChat</h2>
              <p className="text-lg">Select a contact to start chatting.</p>
            </div>
          )}
        </div>

        {/* Right Panel - Friend Detail */}
        <div className="md:w-1/5 w-full bg-gray-50 overflow-y-auto rounded-2xl md:rounded-r-2xl shadow-inner">
          {selectedContact ? (
            <FriendDetail contact={selectedContact} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 px-4">
              Friend details will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
