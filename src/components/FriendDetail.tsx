import React from "react";
import { Contact } from "../types";

interface FriendDetailProps {
  contact: Contact | null;
}

const FriendDetail: React.FC<FriendDetailProps> = ({ contact }) => {
  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a contact to view details.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Friend Info + Status */}
      <div>
        <div className="flex flex-col items-center mb-4">
          <img
            src={contact.photoURL || "https://via.placeholder.com/80"}
            alt="Friend Avatar"
            className="w-20 h-20 rounded-full mb-2"
          />
          <h3 className="text-lg font-semibold">{contact.name}</h3>
          <p className="text-sm text-gray-500">{contact.email}</p>
        </div>

        <div className="text-sm text-gray-600 mb-6 px-2">
          <p>Status: Online</p>
          <p>Last seen: 2 hours ago</p>
        </div>
      </div>

      {/* Shared Media */}
      <div>
        <h4 className="text-md font-semibold mb-2 border-b pb-1 px-2">
          Shared Media
        </h4>
        <div className="flex flex-col gap-2 px-2 overflow-y-auto max-h-60">
          <img src="https://via.placeholder.com/120" alt="media" className="rounded-md" />
          <img src="https://via.placeholder.com/120" alt="media" className="rounded-md" />
          <img src="https://via.placeholder.com/120" alt="media" className="rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default FriendDetail;
