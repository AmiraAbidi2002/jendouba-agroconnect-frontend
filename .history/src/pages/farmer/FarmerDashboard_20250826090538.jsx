// src/pages/farmer/FarmerDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiMessageSquare,
  FiCloud,
} from "react-icons/fi";
import { getMyFarm } from "../../api/farmApi";
import { useAuth } from "../../context/AuthContext";
import FarmMap from "../../components/FarmMap";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [farm, setFarm] = useState(null);

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const data = await getMyFarm();
        setFarm(data);
      } catch (err) {
        console.error("Error fetching farm", err);
      }
    };
    fetchFarm();
  }, []);

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-2" /> },
    { name: "Crops", icon: <FiPackage className="mr-2" /> },
    { name: "Farm Map", icon: <FiMapPin className="mr-2" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-2" /> },
    { name: "Weather", icon: <FiCloud className="mr-2" /> },
  ];
<main className="flex-1 p-6 overflow-auto bg-gray-100">
  {/* Profile Section */}
  {activeSection === "Profile" && (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-[#1d4c43] mb-4">
        Farmer Profile
      </h3>
      <p className="text-gray-800">Name: {user?.name}</p>
      <p className="text-gray-600">Email: {user?.email}</p>
    </div>
  )}

  {/* Crops Section */}
  {activeSection === "Crops" && (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-[#1d4c43] mb-4">My Crops</h3>
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-[#1d4c43] text-white">
          <tr>
            <th className="p-3 text-left">Crop Name</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {farm?.crops?.map((crop) => (
            <tr
              key={crop.id}
              className="hover:bg-gray-50 border-b border-gray-200"
            >
              <td className="p-3">{crop.name}</td>
              <td className="p-3">{crop.type}</td>
              <td className="p-3">
                {crop.status === "Available" ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm">
                    {crop.status}
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm">
                    {crop.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</main>
  ;
}
