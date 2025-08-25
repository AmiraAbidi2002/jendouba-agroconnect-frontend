import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = jwtDecode(token); // plus sûr que atob
        console.log("Decoded JWT =>", payload); // ✅ Vérifie le token dans console
        setUser({
          id: payload.sub,
          name: payload.user_name,
          role: payload.user_type, // FARMER ou BUYER
          email: payload.email,
          token: token, // utile pour debug
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
