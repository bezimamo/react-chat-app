// Welcome.tsx
import React from "react";

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full text-center text-gray-600 p-4">
      <h2 className="text-3xl font-bold mb-4">Welcome to AwuraChat 👋</h2>
      <p className="text-lg">Select a contact to start chatting.</p>
    </div>
  );
};

export default Welcome;
