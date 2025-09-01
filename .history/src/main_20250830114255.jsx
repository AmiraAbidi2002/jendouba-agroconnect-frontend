// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./axiosConfig"; // Axios defaults & interceptors
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

/**
 * Root entry point
 * Wraps App with AuthProvider for authentication state
 * Ensures React.StrictMode is used for development
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
