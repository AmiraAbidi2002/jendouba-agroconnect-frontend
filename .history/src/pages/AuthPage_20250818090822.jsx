import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.state?.mode === "register" ? false : true;
  const [isSignIn, setIsSignIn] = useState(initialMode);
  const role = location.state?.role || "buyer";

  useEffect(() => setIsSignIn(initialMode), [initialMode]);

  const toggleMode = () => setIsSignIn(!isSignIn);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === "farmer") navigate("/dashboard/farmer");
    else navigate("/dashboard/buyer");
  };

  const handleBackHome = () => navigate("/");

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/jendouba.jpg')" }}
    >
      {/* Overlay semi-transparent */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Auth Card */}
      <div className={`auth-card ${isSignIn ? "show-login" : "show-register"} relative z-10 bg-white bg-opacity-90 rounded-xl shadow-xl p-8 max-w-md w-full`}>
        {/* Login */}
        <div className={`auth-face auth-front ${isSignIn ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl font-bold mb-4">Connexion {role === "farmer" ? "Agriculteur" : "Acheteur"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Email" 
              className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
            <button 
              type="submit" 
              className={`btn-primary w-full py-2 rounded-lg font-semibold text-white ${role === "farmer" ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} transition`}
            >
              Se connecter
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Pas de compte ?{' '}
            <span className="text-green-600 cursor-pointer font-medium" onClick={toggleMode}>
              Créer un compte
            </span>
          </p>
          <button 
            onClick={handleBackHome} 
            className="btn-back mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition"
          >
            ← Retour à l'accueil
          </button>
        </div>

        {/* Register */}
        <div className={`auth-face auth-back ${!isSignIn ? 'block' : 'hidden'}`}>
          <h2 className="text-2xl font-bold mb-4">Inscription {role === "farmer" ? "Agriculteur" : "Acheteur"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Nom complet" 
              className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
            <input 
              type="text" 
              placeholder="Email" 
              className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              className="input-field w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
              required 
            />
            <button 
              type="submit" 
              className={`btn-primary w-full py-2 rounded-lg font-semibold text-white ${role === "farmer" ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} transition`}
            >
              S'inscrire
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Déjà un compte ?{' '}
            <span className="text-green-600 cursor-pointer font-medium" onClick={toggleMode}>
              Se connecter
            </span>
          </p>
          <button 
            onClick={handleBackHome} 
            className="btn-back mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}