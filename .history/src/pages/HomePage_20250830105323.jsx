import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/jendouba_agroconnect_logo.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* Fond avec dégradé et image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/crops.jpg')" }}
      />
      
      {/* Overlay avec dégradé pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/40 to-teal-700/60" />
      
      {/* Éléments décoratifs animés */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-5 w-24 h-24 bg-teal-300/15 rounded-full blur-lg animate-pulse delay-500" />

      {/* Structure principale */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo en haut */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/30">
            <img
              src={logo}
              alt="AgroConnect Logo"
              className="h-16 md:h-20 object-contain filter drop-shadow-lg"
            />
          </div>
        </div>

        {/* Contenu principal centré */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-2xl">
            {/* Titre principal */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                AgroConnect
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full mb-6" />
              <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed drop-shadow-md">
                A web platform connecting farmers and buyers in the Jendouba region.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  navigate("/auth", { state: { mode: "login", role: "FARMER" } })
                }
                className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-emerald-500/20 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  🌱 Farmer Login
                </span>
              </button>
              
              <button
                onClick={() =>
                  navigate("/auth", { state: { mode: "login", role: "BUYER" } })
                }
                className="group bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-teal-500/20 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  🛒 Buyer Login
                </span>
              </button>
            </div>

            {/* Texte descriptif supplémentaire */}
            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm md:text-base font-light">
                Connecting local agriculture with sustainable commerce
              </p>
            </div>
          </div>
        </div>

        {/* Footer minimaliste */}
        <div className="text-center pb-6">
          <p className="text-white/60 text-sm font-light">
            Empowering Jendouba's agricultural community
          </p>
        </div>
      </div>
    </div>
  );
}