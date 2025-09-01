import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create authentication context
const AuthContext = createContext();

/**
 * Provides authentication state and functions across the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * Load user from localStorage token on initial render
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT to extract user info
        const decoded = jwtDecode(token);
        console.log("Decoded JWT =>", decoded);

        setUser({
          id: decoded.sub,
          name: decoded.user_name,
          email: decoded.email,
          role: decoded.user_type, // standardized as 'role'
          token: token,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  /**
   * Logout function:
   * - Remove token
   * - Clear user state
   * - Redirect to home/login page
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/"; // redirect to home or login
  };

  /**
   * Update user information in context + persist in localStorage
   */
  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access AuthContext safely
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};
