import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, addUserToRealtimeDB } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await addUserToRealtimeDB(
          userCred.user.uid,
          username,
          email,
          userCred.user.photoURL || "",
          username
        );
        alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in!");
      }
      navigate("/chat");
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await addUserToRealtimeDB(
        user.uid,
        user.displayName || user.email?.split("@")[0] || "google-user",
        user.email || "",
        user.photoURL || "",
        user.displayName || ""
      );
      alert("Signed in with Google!");
      navigate("/chat");
    } catch (error: any) {
      alert(error.message || "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex justify-center items-center gap-2">
          <span className="text-gray-500">or</span>
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2"
          >
            <FcGoogle />
            Google Sign-In
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            className="text-blue-500 font-medium ml-2"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
