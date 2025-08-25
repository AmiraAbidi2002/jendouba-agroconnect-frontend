import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true); // par défaut login!
  const navigate = useNavigate();
  const location = useLocation();

  // Récupération du rôle à partir des query params
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "farmer"; // fallback

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  // Simulation d’envoi de formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Après login : redirection selon role
    if (role === "farmer") {
      navigate("/farmer/dashboard");
    } else if (role === "buyer") {
      navigate("/buyer/dashboard");
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <div className="auth-container">
      <div className={`card ${!isSignIn ? "sign-up-mode" : ""}`}>
        {/* Left panel */}
        <div className="left-panel">
          <h2 className="title">{isSignIn ? "Hello, Friend!" : "Welcome Back!"}</h2>
          <p className="subtitle">
            {isSignIn
              ? "Enter your personal details to use all features"
              : "To keep connected with us please login"}
          </p>

          <button className="toggle-btn" onClick={toggleMode}>
            {isSignIn ? "SIGN UP" : "SIGN IN"}
          </button>
        </div>

        {/* Form panel */}
        <div className="form-panel">
          {isSignIn ? (
            <form className="form" onSubmit={handleSubmit}>
              <h2 className="form-title">Sign In ({role})</h2>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <h2 className="form-title">Create Account ({role})</h2>
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="submit-btn">
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
