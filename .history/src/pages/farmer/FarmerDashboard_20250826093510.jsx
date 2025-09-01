// src/pages/farmer/FarmerDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCloud,
  FiMessageSquare,
  FiEdit,
  FiSave,
  FiPhone,
  FiMail,
  FiMap,
  FiKey,
  FiHash,
} from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, deleteCrop } from "../../api/cropApi";
import { getMyFarm, getAllFarms } from "../../api/farmApi";
import axios from "axios";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [crops, setCrops] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [mineFarm, setMineFarm] = useState(null);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    location: { lat: 0, lng: 0 },
  });

  // Récupérer la ferme du farmer connecté
  useEffect(() => {
    if (!user || !user.token) return;
    const fetchFarm = async () => {
      try {
        const data = await getMyFarm(user.token);
        setMineFarm(data);
        if (data) {
          setProfileData((prev) => ({
            ...prev,
            id: data.id || user.id || "",
            name: user.name || user.username || "",
            email: user.email || "",
            password: user.password || "********",
            location: {
              lat: data.latitude || 0,
              lng: data.longitude || 0,
            },
          }));
        }
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };
    fetchFarm();
  }, [user]);

  // Récupérer toutes les fermes
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        setFarms(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarms();
  }, []);

  // Récupérer mes cultures
  const fetchCrops = async () => {
    try {
      const userId = Number(user?.id ?? user?.sub);
      if (!userId) return;
      const data = await getCropsByFarmer(userId);
      setCrops(data);
    } catch (error) {
      console.error("Error fetch crops:", error);
    }
  };

  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection]);

  // Récupérer toutes les cultures
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/crops")
      .then((res) => setAllCrops(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Récupérer acheteurs
  useEffect(() => {
    axios
      .get("http://localhost:8080/users?type=BUYER")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const farmsToShow = useMemo(() => farms, [farms]);

  if (!user || user.role !== "FARMER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access denied
          </h2>
          <p>You must be a farmer to access this page.</p>
          <p className="text-sm text-gray-600 mt-2">
            Role detected: {user?.role || "Not connected"}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  // Gestion Profil
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    console.log("Profile data saved:", profileData);
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion cultures
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this crop?")) {
      try {
        await deleteCrop(id);
        fetchCrops();
      } catch (error) {
        console.error("Error deletion crop:", error);
      }
    }
  };
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  // UI
  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];
  const cardClass =
    "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-900 border border-gray-200";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌱</span>
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
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        {/* Profile */}
        {activeSection === "Profile" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              {isEditingProfile ? (
                <button
                  onClick={handleProfileSave}
                  className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                >
                  <FiSave className="mr-2" /> Save
                </button>
              ) : (
                <button
                  onClick={handleProfileEdit}
                  className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                >
                  <FiEdit className="mr-2" /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiHash className="mr-2" /> ID
                  </label>
                  <p className="text-gray-900">{profileData.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2" /> Email
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiKey className="mr-2" /> Password
                  </label>
                  <p className="text-gray-900">{profileData.password}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMap className="mr-2" /> Location
                  </label>
                  <p className="text-gray-900">
                    Lat: {profileData.location.lat}, Lng:{" "}
                    {profileData.location.lng}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crops */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            {/* ... ton code crops reste inchangé */}
          </div>
        )}

        {/* Messages */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} contacts={buyers} />
          </div>
        )}

        {/* Farm Location */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              My Farm Location
            </h2>
            {mineFarm ? (
              <FarmMap farms={[mineFarm]} />
            ) : (
              <p className="text-gray-600">No farm location found.</p>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-4">
              All Farms Location
            </h2>
            <FarmMap farms={farmsToShow} />
          </div>
        )}

        {/* Weather */}
        {activeSection === "Weather Forecast" && (
          <div className={cardClass}>
            <WeatherWidget />
          </div>
        )}
      </main>
    </div>
  );
}
