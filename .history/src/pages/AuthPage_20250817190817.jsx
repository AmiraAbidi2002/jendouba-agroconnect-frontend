import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.state?.mode === "register" ? false : true;
  const [isSignIn, setIsSignIn] = useState(initialMode);
  const role = location.state?.role || "buyer";

  useEffect(() => {
    setIsSignIn(initialMode);
  }, [initialMode]);

  const toggleMode = () => setIsSignIn(!isSignIn);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici tu appelles ton API login/register
    if (role === "farmer") navigate("/dashboard/farmer");
    else navigate("/dashboard/buyer");
  };

  const handleBackHome = () => navigate("/");

  return (
    <div className="auth-container">
      <div className={`auth-card ${isSignIn ? "show-login" : "show-register"}`}>
        {/* Login Form */}
        <div className="auth-face auth-front">
          <h2 className="text-3xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <p className="mt-2 text-sm">
            Pas de compte ? <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>Register</span>
          </p>
          <button onClick={handleBackHome} className="btn-back mt-4">Retour à l’accueil</button>
        </div>

        {/* Register Form */}
        <div className="auth-face auth-back">
          <h2 className="text-3xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Full Name" className="input-field" required />
            <input type="text" placeholder="Email" className="input-field" required />
            <input type="password" placeholder="Password" className="input-field" required />
            <button type="submit" className="btn-primary">Register</button>
          </form>
          <p className="mt-2 text-sm">
            Déjà un compte ? <span className="text-blue-500 cursor-pointer" onClick={toggleMode}>Login</span>
          </p>
          <button onClick={handleBackHome} className="btn-back mt-4">Retour à l’accueil</button>
        </div>
      </div>
    </div>
  );
}
