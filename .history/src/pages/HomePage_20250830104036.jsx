import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/jendouba_agroconnect_logo.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-4 relative" style={{ backgroundImage: "url('/crops.jpg')" }}>
      {/* Logo positionné en haut de la page */}
      <div className="w-full flex justify-center pt-6">
        <img
          src={logo}
          alt="AgroConnect Logo"
          className="h-16 md:h-20 object-contain"
        />
      </div>

      {/* Contenu principal centré verticalement */}
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        {/* Container translucide */}
        <div className="bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md md:max-w-xl flex flex-col items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d4c43] text-center">
            Jendouba AgroConnect
          </h1>
          <p className="text-center text-gray-700">
            A web platform connecting farmers and buyers in the Jendouba region.
          </p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "FARMER" } })
              }
              className="bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"
            >
              Farmer Login
            </button>
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "BUYER" } })
              }
              className="bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"
            >
              Buyer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}