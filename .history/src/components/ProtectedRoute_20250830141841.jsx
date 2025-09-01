import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * ------------------------
 * This component is used to protect routes that should only be accessible
 * when the user is authenticated (i.e., has a valid token stored in localStorage).
 *
 * - It checks if a token exists in localStorage.
 * - If no token is found, it redirects the user to the "/auth" page (login/registration).
 * - If a token is present, it renders the protected content (children).
 *
 * Usage Example:
 * <ProtectedRoute>
 *    <Dashboard />
 * </ProtectedRoute>
 *
 * This ensures that the <Dashboard /> page can only be accessed
 * by authenticated users.
 */
export default function ProtectedRoute({ children }) {
  // Retrieve the token from localStorage (acts as a session check)
  const token = localStorage.getItem("token");

  // If no token exists → redirect the user to the authentication page
  if (!token) {
    return <Navigate to="/auth" />;
  }

  // Otherwise, render the protected component
  return children;
}
