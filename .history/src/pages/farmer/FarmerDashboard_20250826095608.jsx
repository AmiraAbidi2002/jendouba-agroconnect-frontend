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
  FiPlus,
  FiEye,
  FiTrash2,
  FiX
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
    address: "",
    phone: ""
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
        address: user.address || "",
        phone: user.phone || ""
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
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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

  // Format availability status
  const formatAvailability = (status) => {
    const statusMap = {
      "available": { text: "Available", color: "bg-green-100 text-green-800" },
      "sold": { text: "Sold", color: "bg-red-100 text-red-800" },
      "reserved": { text: "Reserved", color: "bg-yellow-100 text-yellow-800" },
      "pending": { text: "Pending", color: "bg-blue-100 text-blue-800" }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { text: status, color: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // UI
  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];
  const cardClass = "bg-white rounded-xl shadow-sm p-6 mb-6 text-gray-900 border border-gray-100";

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
                  ? "bg-white text-[#1d4c43] font-semibold shadow-sm"
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
          Logged in as <span className="font-medium">{user.name}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Profile */}
          {activeSection === "Profile" && (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                {isEditingProfile ? (
                  <button
                    onClick={handleProfileSave}
                    className="bg-[#1d4c43] text-white px-4 py-2 rounded-lg hover:bg-[#2a5c45] flex items-center transition-colors"
                  >
                    <FiSave className="mr-2" /> Save
                  </button>
                ) : (
                  <button
                    onClick={handleProfileEdit}
                    className="bg-[#1d4c43] text-white px-4 py-2 rounded-lg hover:bg-[#2a5c45] flex items-center transition-colors"
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
                      <p className="text-gray-900 font-medium">{profileData.name}</p>
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
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiPhone className="mr-2" /> Phone
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone || "Not provided"}</p>
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
                <h1 className="text-2xl font-bold text-gray-800">
                  {showAllCrops ? "All Marketplace Crops" : "My Crops"}
                </h1>
                <div className="flex space-x-3">
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                    onClick={() => setShowAllCrops(!showAllCrops)}
                  >
                    {showAllCrops ? "Show My Crops" : "View Marketplace"}
                  </button>
                  {!showAllCrops && (
                    <button
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded-lg hover:bg-[#2a5c45] transition-colors flex items-center"
                      onClick={() => {
                        setEditingCrop(null);
                        setShowForm(true);
                      }}
                    >
                      <FiPlus className="mr-2" /> Add New Crop
                    </button>
                  )}
                </div>
              </div>

              {(showAllCrops ? allCrops : crops).length > 0 ? (
                <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-[#f8f9fa]">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                        {!showAllCrops && (
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(showAllCrops ? allCrops : crops).map((crop) => (
                        <tr key={crop.crop_id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {crop.img_url ? (
                                <img 
                                  src={crop.img_url} 
                                  alt={crop.crop_name} 
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  <FiPackage className="text-green-600" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{crop.crop_name}</div>
                                <div className="text-sm text-gray-500">ID: {crop.crop_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {crop.crop_type}
                            </span>
                          </td>
                          <td className="py-4 px-4">{crop.quantity} kg</td>
                          <td className="py-4 px-4 font-medium">{crop.price} TND/kg</td>
                          <td className="py-4 px-4">
                            {new Date(crop.harvest_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            {formatAvailability(crop.availability)}
                          </td>
                          {!showAllCrops && (
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                  onClick={() => handleEdit(crop)}
                                  title="Edit crop"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  onClick={() => handleDelete(crop.crop_id)}
                                  title="Delete crop"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <FiPackage className="mx-auto text-gray-400 text-4xl mb-3" />
                  <p className="text-gray-500">No crops available.</p>
                  {!showAllCrops && (
                    <button
                      className="mt-4 bg-[#1d4c43] text-white px-4 py-2 rounded-lg hover:bg-[#2a5c45] transition-colors flex items-center mx-auto"
                      onClick={() => {
                        setEditingCrop(null);
                        setShowForm(true);
                      }}
                    >
                      <FiPlus className="mr-2" /> Add Your First Crop
                    </button>
                  )}
                </div>
              )}

              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg relative border border-gray-200">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingCrop(null);
                      }}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiX size={20} />
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      {editingCrop ? "Edit Crop" : "Add New Crop"}
                    </h2>
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
              </div>
              <MessageList user={user} contacts={buyers} />
            </div>
          )}

          {/* Farm Location */}
          {activeSection === "Farm Location" && (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Farm Locations</h2>
              </div>
              <FarmMap farms={farmsToShow} />
            </div>
          )}

          {/* Weather */}
          {activeSection === "Weather Forecast" && (
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Weather Forecast</h2>
              </div>
              <WeatherWidget />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}