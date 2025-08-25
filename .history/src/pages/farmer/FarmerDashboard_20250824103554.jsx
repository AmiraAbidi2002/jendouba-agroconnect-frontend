// src/pages/farmer/FarmerDashboard.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiPackage, FiMapPin, FiCloud, FiMessageSquare } from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/useAuth";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, deleteCrop } from "../../api/cropApi";
import axios from "axios";
import { getMyFarm } from "../../api/farmApi";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Crops");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAllFarms, setShowAllFarms] = useState(false);
  const [mineFarm, setmineFarm] = useState(null);

  // Filtrer la ferme du farmer connecté
  const myFarm = user ? farms.filter(f => f.farmer_id === user.id) : [];

  // Récupérer toutes les fermes
  useEffect(() => {
    axios.get("http://localhost:8080/api/farms")
      .then(res => setFarms(res.data))
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection]);

  // Récupérer tous les buyers
  useEffect(() => {
    axios.get("http://localhost:8080/api/users?type=BUYER")
      .then(res => setBuyers(res.data))
      .catch(err => console.error(err));
  }, []);

  // Vérification du rôle
  if (!user || user.role !== "FARMER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
          <p>Vous devez être un farmer pour accéder à cette page.</p>
          <p className="text-sm text-gray-600 mt-2">Rôle détecté: {user?.role || "Non connecté"}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Récupérer les crops du farmer connecté
  const fetchCrops = async () => {
    try {
      if (!user.id) return;
      const data = await getCropsByFarmer(user.id);
      setCrops(data);
    } catch (error) {
      console.error("Erreur fetch crops:", error);
    }
  };


  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce crop ?")) {
      try {
        await deleteCrop(id);
        fetchCrops();
      } catch (error) {
        console.error("Erreur suppression crop:", error);
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
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌱</span> AgroConnect
        </h2>
        <nav className="flex-1">
          {menuItems.map(item => (
            <button
              key={item.name}
              className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-all ${activeSection === item.name ? "bg-white text-[#1d4c43] font-semibold shadow-md" : "hover:bg-[#2a5c45] text-gray-100"}`}
              onClick={() => setActiveSection(item.name)}
            >
              {item.icon}{item.name}
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
                onClick={() => { setEditingCrop(null); setShowForm(true); }}
              >
                Add New Crop
              </button>
            </div>

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
                    {crops.map(crop => (
                      <tr key={crop.crop_id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{crop.crop_name}</td>
                        <td className="py-3 px-4">{crop.crop_type}</td>
                        <td className="py-3 px-4">{crop.quantity} kg</td>
                        <td className="py-3 px-4">{crop.price} TND/kg</td>
                        <td className="py-3 px-4">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 flex space-x-2">
                          <button className="text-[#1d4c43] hover:text-[#2a5c45]" onClick={() => handleEdit(crop)}>Edit</button>
                          <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(crop.crop_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No crops available. Add your first crop to get started.</div>
            )}

            {/* Crop Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
                  <button onClick={() => { setShowForm(false); setEditingCrop(null); }} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
                  <CropForm editingCrop={editingCrop} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditingCrop(null); }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} contacts={buyers} />
          </div>
        )}

        {/* Farm Location Section */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Farm Location</h2>
              <button
                className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                onClick={() => setShowAllFarms(!showAllFarms)}
              >
                {showAllFarms ? "Show Only My Farm" : "Show All Farms"}
              </button>
            </div>
            <FarmMap farms={showAllFarms ? farms : myFarm} />
          </div>
        )}

        {/* Weather Section */}
        {activeSection === "Weather Forecast" && (
          <div className={cardClass}>
            <WeatherWidget />
          </div>
        )}
      </main>
    </div>
  );
}
