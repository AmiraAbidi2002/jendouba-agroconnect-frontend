// src/pages/farmer/FarmerDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCloud,
  FiMessageSquare,
  FiEdit,
  FiSave,
  FiLogOut,
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

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [mineFarm, setMineFarm] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    address: "",
  });

  // ----- Récupérer ma ferme -----
  useEffect(() => {
    if (!user) return;
    const fetchFarm = async () => {
      try {
        const data = await getMyFarm(user.id);
        setMineFarm(data);
        setProfileData({
          name: data?.farmer_name || "",
          email: user.email || "",
          address: data?.location || "",
        });
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };
    fetchFarm();
  }, [user]);

  // ----- Récupérer toutes les fermes -----
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

  // ----- Récupérer mes cultures -----
  const fetchCrops = useCallback(async () => {
    try {
      if (!user) return;
      const data = await getCropsByFarmer(user.id);
      setCrops(data);
    } catch (err) {
      console.error("Error fetch crops:", err);
    }
  },[user]);

  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection,fetchCrops]);

  // ----- Récupérer les buyers -----
  useEffect(() => {
    fetch("http://localhost:8080/users?type=BUYER")
      .then((res) => res.json())
      .then((data) => setBuyers(data))
      .catch((err) => console.error(err));
  }, []);

  // ----- Handlers Profile -----
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    console.log("Profile saved:", profileData);
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ----- Handlers Crops -----
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this crop?")) {
      try {
        await deleteCrop(id);
        fetchCrops();
      } catch (err) {
        console.error(err);
      }
    }
  };
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-800";

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

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  const farmsToShow = useMemo(() => farms, [farms]);

  return (
    <div className="flex min-h-screen bg-white">
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
              className={`flex items-center w-full mb-2 px-4 py-3 transition-colors rounded-lg ${
                activeSection === item.name
                  ? "text-orange-500 bg-white bg-opacity-10"
                  : "text-white hover:bg-white hover:bg-opacity-5"
              }`}
              onClick={() => setActiveSection(item.name)}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45]">
          <p className="text-sm opacity-75 mb-3">Logged in as Farmer</p>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
<main className="flex-1 p-8 overflow-auto bg-white">
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

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Mine Farm Location */}
        {mineFarm && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">My Farm Location</h2>
            <p>Latitude: {mineFarm.lat}</p>
            <p>Longitude: {mineFarm.lng}</p>
            <div className="h-64 w-full border rounded overflow-hidden">
              <FarmMap farms={[mineFarm]} />
            </div>
          </div>
        )}
      </div>
    </div>
  )}



        {/* Crops */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Crops</h1>
              <button
                className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                onClick={() => {
                  setEditingCrop(null);
                  setShowForm(true);
                }}
              >
                Add New Crop
              </button>
            </div>

            {crops.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead className="bg-[#1d4c43] text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Crop ID</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Harvest Date</th>
                      <th className="py-3 px-4 text-left">Availability</th>
                      <th className="py-3 px-4 text-left">Image</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => (
                      <tr
                        key={crop.crop_id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{crop.crop_id}</td>
                        <td className="py-3 px-4">{crop.crop_name}</td>
                        <td className="py-3 px-4">{crop.crop_type}</td>
                        <td className="py-3 px-4">{crop.quantity} kg</td>
                        <td className="py-3 px-4">{crop.price} TND/kg</td>
                        <td className="py-3 px-4">
                          {new Date(crop.harvest_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {crop.availability ? "Available" : "Not available"}
                        </td>
                        <td className="py-3 px-4">
                          {crop.img_url ? (
                            <img
                              src={`http://localhost:8080/uploads/${crop.img_url}`}
                              alt={crop.crop_name}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>
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
