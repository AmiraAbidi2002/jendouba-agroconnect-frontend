import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/jendouba_agroconnect_logo.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/crops.jpg')" }}
    >
      {/* Logo en haut */}
      <div className="w-full flex justify-center pt-6">
        <img
          src={logo}
          alt="AgroConnect Logo"
          className="h-16 md:h-20 object-contain"
        />
      </div>

      {/* Contenu principal centré dans l'espace restant */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="bg-black bg-opacity-50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md md:max-w-xl flex flex-col items-center gap-4">
          <h2 className="text-white text-center text-lg md:text-2xl font-medium">
            A web platform connecting farmers and buyers in the Jendouba region.
          </h2>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "FARMER" } })
              }
              className="bg-[#4f46e5] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"
            >
              Farmer Login
            </button>
            <button
              onClick={() =>
                navigate("/auth", { state: { mode: "login", role: "BUYER" } })
              }
              className="bg-[#4f46e5] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"
            >
              Buyer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
