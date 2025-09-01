import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/jendouba_agroconnect_logo.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: "url('/crops.jpg')" }}>
      {/* Logo positionné en haut de la page */}
      <div className="w-full flex justify-center pt-4">
        <img
          src={logo}
          alt="AgroConnect Logo"
          className="h-14 md:h-16 object-contain"
        />
      </div>

      {/* Contenu principal centré verticalement */}
      <div className="h-full flex flex-col items-center justify-center px-4 pb-10">
        {/* Container avec fond semi-transparent */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm p-6 rounded-xl w-full max-w-md flex flex-col items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white text-center">
            JENDOUBA AGROCONNECT
          </h1>
          <p className="text-white text-center text-sm md:text-base opacity-90">
            Web platform connecting farmers and buyers in the Jendouba region
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "FARMER" } })
              }
              className="bg-[#2E7D32] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1B5E20] transition flex-1 text-center"
            >
              Farmer Login
            </button>
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "BUYER" } })
              }
              className="bg-[#FF9800] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#F57C00] transition flex-1 text-center"
            >
              Buyer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}