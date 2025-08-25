import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/jendouba-nature.jpg')" }}
    >
      <div className="bg-white bg-opacity-70 p-8 rounded-xl shadow-lg flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-center">Bienvenue sur AgroConnect</h1>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/auth", { state: { mode: "login", role: "farmer" } })}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Farmer
          </button>
          <button
            onClick={() => navigate("/auth", { state: { mode: "login", role: "buyer" } })}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Buyer
          </button>
        </div>
      </div>
    </div>
  );
}
