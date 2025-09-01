import React, { createContext, useContext, useState, useEffect } from "react";
 import { jwtDecode }  from "jwt-decode"; 
 const AuthContext = createContext();
  export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(null);
     useEffect(() => { 
      const token = localStorage.getItem("token");
       if (token) { 
        try { 
          const decoded = jwtDecode(token);
           console.log("Decoded JWT =>", decoded); 
           setUser({ 
            id: decoded.sub,
             name: decoded.user_name,
              email: decoded.email,
               role: decoded.user_type,
                token: token, }); 
              } catch (error) { 
                console.error("Error decoding token:", error); 
                localStorage.removeItem("token"); 
              } } },
               []); 
               // ✅ logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/"; // redirection vers home ou login
  };
               return (
                 <AuthContext.Provider value={{user, setUser, logout }}>
                   {children} 
                   </AuthContext.Provider> ); 
                   }; 
                    export const useAuth = () => {
                       const context = useContext(AuthContext);
                        if (!context) throw new Error("useAuth must be used  inside an AuthProvider");
                        return context;
};