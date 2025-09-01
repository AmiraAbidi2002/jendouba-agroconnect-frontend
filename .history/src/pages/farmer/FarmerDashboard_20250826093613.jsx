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
    location: { lat: 0, lng: 0 }
  });

  // Recover My Farm
  useEffect(() => {
    if (!user || !user.token) return;
    const fetchFarm = async () => {
      try {
        const data = await getMyFarm(user.token);
        setMineFarm(data);
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };
    fetchFarm();
  }, [user]);

  // Recover all farms
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

  // Recover crops
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

  // Recover all crops
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/crops")
      .then((res) => setAllCrops(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Recover buyers
  useEffect(() => {
    axios
      .get("http://localhost:8080/users?type=BUYER")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

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

  // Profile Handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    console.log("Profile data saved:", profileData);
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Crops Handlers
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
                    <FiMap className="mr-2" /> Address
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crops */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {showAllCrops ? "All Crops" : "My Crops"}
              </h1>
              <div className="flex space-x-2">
                <button
                  className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                  onClick={() => setShowAllCrops(!showAllCrops)}
                >
                  {showAllCrops ? "Show My Crops" : "Show All Crops"}
                </button>
                {!showAllCrops && (
                  <button
                    className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                    onClick={() => {
                      setEditingCrop(null);
                      setShowForm(true);
                    }}
                  >
                    Add New Crop
                  </button>
                )}
              </div>
            </div>

            {(showAllCrops ? allCrops : crops).length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead className="bg-[#1d4c43] text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Harvest Date</th>
                      {!showAllCrops && (
                        <th className="py-3 px-4 text-left">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllCrops ? allCrops : crops).map((crop) => (
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
                        {!showAllCrops && (
                          <td className="py-3 px-4 flex space-x-2">
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
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No crops available.
              </div>
            )}

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative border border-gray-200">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCrop(null);
                    }}
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
