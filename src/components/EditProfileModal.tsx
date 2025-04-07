// src/components/EditProfileModal.tsx
import React, { useState } from "react";

interface EditProfileModalProps {
  currentName: string;
  currentPhoto: string;
  onClose: () => void;
  onSave: (name: string, photo: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentName,
  currentPhoto,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [photo, setPhoto] = useState(currentPhoto);

  const handleSave = () => {
    onSave(name, photo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Edit Profile</h2>

        <label className="block mb-2 text-sm">Name</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2 text-sm">Profile Photo URL</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
