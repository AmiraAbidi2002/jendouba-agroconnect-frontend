import React, { createContext, useContext, useState, useEffect } from "react";
import { jwt_decode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // ou state global
    if (token) {
      const decoded = jwt_decode(token);
      console.log("Decoded JWT =>", decoded);
      setUser({ ...decoded, token });
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");  
    if (token) {
      try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded JWT =>", payload);
      setUser({
        id: payload.sub,
        name: payload.user_name,
        role: payload.user_type, // adapter selon JWT
      });
    } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }}
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
