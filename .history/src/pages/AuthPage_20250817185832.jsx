import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true); // true = login, false = register
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "buyer"; // fallback role

  const toggleMode = () => setIsSignIn(!isSignIn);

  const handleSubmit = (e) => {
    e.preventDefault();
    // ici tu appelles ton API pour login/register
    // puis redirige selon rôle
    if (role === "farmer") {
      navigate("/dashboard/farmer");
    } else {
      navigate("/dashboard/buyer");
    }
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${isSignIn ? "slide-login" : "slide-register"}`}>
        <h2 className="text-2xl font-bold mb-4">{isSignIn ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Email" className="input-field" required />
          <input type="password" placeholder="Password" className="input-field" required />
          {!isSignIn && (
            <input type="text" placeholder="Full Name" className="input-field" required />
          )}
          <button type="submit" className="btn-primary">
            {isSignIn ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-sm mt-2">
          {isSignIn ? "Pas de compte ?" : "Déjà un compte ?"}{" "}
          <span onClick={toggleMode} className="text-blue-500 cursor-pointer">
            {isSignIn ? "Register" : "Login"}
          </span>
        </p>
        <button
          onClick={handleBackHome}
          className="mt-4 btn-back"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
}
