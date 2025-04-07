import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import AuthForm from "./components/AuthForm";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} /> {/* Login/Signup page */}
        <Route path="/chat" element={<ChatApp />} /> {/* Chat app page */}
      </Routes>
    </Router>
  );
};

export default App;
