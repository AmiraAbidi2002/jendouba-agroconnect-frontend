import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-300 to-blue-200">
      <h1 className="text-4xl font-bold mb-8">Bienvenue sur AgroConnect</h1>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/auth", { state: { mode: "login", role: "buyer" } })}
          className="btn-primary"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/auth", { state: { mode: "register", role: "buyer" } })}
          className="btn-secondary"
        >
          Register
        </button>
      </div>
    </div>
  );
}
