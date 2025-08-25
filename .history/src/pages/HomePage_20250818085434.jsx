import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/jendouba.jpg')" }}
    >
      {/* Container translucide */}
      <div className="bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md md:max-w-xl flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Bienvenue sur AgroConnect
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "login", role: "farmer" } })
            }
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold  hover:bg-green-700 transition"
          >
            Farmer
          </button>
          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "login", role: "buyer" } })
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold  hover:bg-blue-700 transition"
          >
            Buyer
          </button>
        </div>
      </div>
    </div>
  );
}
