import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/jendouba_agroconnect_logo.png";
export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/crops.jpg')" }}
    >
      {/* Container translucide */}
      
          <div className="w-full flex justify-center p-4 absolute top-0">
        <img
  src={logo}
  alt="AgroConnect Logo"
  className="h-16 md:h-20 object-contain mt-4"
/>
</div>
<div className="bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md md:max-w-xl flex flex-col items-center gap-6">
        <p>a web platform connecting farmers and buyers in the Jendouba region.</p>

        <div className="flex gap-4">
          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "login", role: "FARMER" } })
            }
            className="bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"

          >
            Farmer
          </button>
          <button
            onClick={() =>
              navigate("/auth", { state: { mode: "login", role: "BUYER" } })
            }
           className="bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4338ca] transition whitespace-nowrap"

          >
            Buyer
          </button>
        </div>
      </div>
    </div>
  );
}
