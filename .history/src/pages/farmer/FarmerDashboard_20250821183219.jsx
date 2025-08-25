import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCloud,
  FiMessageSquare,
} from "react-icons/fi";
import CropForm from "./CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, deleteCrop } from "../../api/cropApi";
import axios from "axios";

export default function FarmerDashboard() {
  const [activeSection, setActiveSection] = useState("Crops");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAllFarms, setShowAllFarms] = useState(false);

  const myFarm = farms.filter((f) => f.farmer_id === user.id);

  // Récupérer toutes les fermes
  useEffect(() => {
    axios
      .get("http://localhost:8080/farms")
      .then((res) => setFarms(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Récupérer tous les buyers
  useEffect(() => {
    axios
      .get("http://localhost:8080/users?type=buyer")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Récupérer uniquement les crops du farmer connecté
  const fetchCrops = async () => {
    try {
      const data = await getCropsByFarmer(user.id);
      setCrops(data);
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection]);

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      try {
        await deleteCrop(id);
        fetchCrops();
      } catch (error) {
        console.error("Error deleting crop:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-900";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌱</span>{" "}
          AgroConnect
        </h2>
        <nav className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.name
                  ? "bg-white text-[#1d4c43] font-semibold shadow-md"
                  : "hover:bg-[#2a5c45] text-gray-100"
              }`}
              onClick={() => setActiveSection(item.name)}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45] text-sm opacity-75">
          Logged in as Farmer
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="bg-[#e0f2f1] p-4 rounded mb-6 text-center text-[#1d4c43] font-semibold">
              Welcome to your Crop Dashboard! Manage your crops below.
            </div>

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Crops</h1>
              <button
                className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] transition-colors"
                onClick={() => setShowForm(!showForm)}
              >
                {editingCrop ? "Edit Crop" : "Add New Crop"}
              </button>
            </div>

            {/* Crop Table */}
            {crops.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead className="bg-[#1d4c43] text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Harvest Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => (
                      <tr
                        key={crop.crop_id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{crop.crop_name}</td>
                        <td className="py-3 px-4">{crop.crop_type}</td>
                        <td className="py-3 px-4">{crop.quantity} kg</td>
                        <td className="py-3 px-4">{crop.price} TND/kg</td>
                        <td className="py-3 px-4">
                          {new Date(crop.harvest_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              className="text-[#1d4c43] hover:text-[#2a5c45]"
                              onClick={() => handleEdit(crop)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(crop.crop_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No crops available. Add your first crop to get started.
              </div>
            )}

            {/* Crop Form Modal */}
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
      {/* Close button */}
      <button
        onClick={() => { setShowForm(false); setEditingCrop(null); }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <CropForm
        editingCrop={editingCrop}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingCrop(null);
        }}
      />
    </div>
  </div>
)}

          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} />
          </div>
        )}

        {/* Weather Forecast Section */}
        {activeSection === "Weather Forecast" && (
          <div className="flex justify-center p-6">
            <div className="w-full max-w-3xl">
              <WeatherWidget />
            </div>
          </div>
        )}

        {/* Farm Section */}
        {activeSection === "Farm Location" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Farm Location</h2>

            <button
              className="mb-4 px-4 py-2 bg-[#1d4c43] text-white rounded hover:bg-[#2a5c45]"
              onClick={() => setShowAllFarms(!showAllFarms)}
            >
              {showAllFarms ? "Voir ma ferme seulement" : "Voir toutes les fermes"}
            </button>

            <FarmMap farms={showAllFarms ? farms : myFarm} />
          </div>
        )}
      </main>
    </div>
  );
}
