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
  FiX
} from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, getAllCrops, deleteCrop } from "../../api/cropApi";
import { getMyFarm, getAllFarms, updateFarm } from "../../api/farmApi";
import axios from "axios";

export default function FarmerDashboard() {
  const { user, logout, updateUser } = useAuth();

  // ------------------ STATES ------------------
  const [activeSection, setActiveSection] = useState("Profile");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [mineFarm, setMineFarm] = useState(null);
  const [viewMode, setViewMode] = useState("mine");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    location: { lat: 0, lng: 0 }
  });

  const [originalProfileData, setOriginalProfileData] = useState(null);

  const isFarmer = user && user.role && user.role.toUpperCase() === "FARMER";

  // ------------------ FETCH CROPS ------------------
  const fetchCrops = useCallback(async () => {
    if (!user || !isFarmer) return;
    try {
      let data;
      if (viewMode === "mine") {
        data = await getCropsByFarmer();
      } else {
        data = await getAllCrops();
      }
      setCrops(data);
    } catch (err) {
      console.error("Error fetching crops:", err);
    }
  }, [user, viewMode, isFarmer]);

  // ------------------ FETCH BUYERS ------------------
  useEffect(() => {
    if (!isFarmer) return;
    axios
      .get("http://localhost:8080/users?type=BUYER")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, [isFarmer]);

  // ------------------ FETCH MY FARM ------------------
  useEffect(() => {
    if (!user || !isFarmer) return;

    const fetchFarm = async () => {
      try {
        const data = await getMyFarm(user.id);
        setMineFarm(data);
        setProfileData({
          name: data?.farmer_name || user.name || "",
          email: user.email || "",
          location: {
            lat: data?.lat ?? 0,
            lng: data?.lng ?? 0
          }
        });
        setOriginalProfileData({
          name: data?.farmer_name || user.name || "",
          email: user.email || "",
          location: {
            lat: data?.lat ?? 0,
            lng: data?.lng ?? 0
          }
        });
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };
    fetchFarm();
  }, [user, isFarmer]);

  // ------------------ FETCH ALL FARMS ------------------
  useEffect(() => {
    if (!isFarmer) return;

    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        const farmsWithCrops = await Promise.all(
          data.map(async (farm) => {
            try {
              const crops = await getCropsByFarmer(farm.farmer_id);
              return { ...farm, crops };
            } catch (err) {
              console.error("Error fetching crops for farm:", err);
              return { ...farm, crops: [] };
            }
          })
        );
        setFarms(farmsWithCrops);
      } catch (err) {
        console.error("Error fetching farms:", err);
      }
    };
    fetchFarms();
  }, [isFarmer]);

  // ------------------ REFRESH CROPS ON SECTION CHANGE ------------------
  useEffect(() => {
    if (activeSection === "Crops" && isFarmer) fetchCrops();
  }, [activeSection, fetchCrops, viewMode, isFarmer]);

  // ------------------ HANDLERS PROFILE ------------------
  const handleProfileEdit = () => setIsEditingProfile(true);

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const userResponse = await axios.put(`http://localhost:8080/users/${user.id}`, {
        name: profileData.name,
        email: profileData.email
      });
      if (userResponse.data) updateUser(userResponse.data);
      const farmData = await getMyFarm(user.id);
      setMineFarm(farmData);
      setIsEditingProfile(false);
      console.log("Profile saved:", profileData);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCancel = () => {
    if (originalProfileData) setProfileData({ ...originalProfileData });
    setIsEditingProfile(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ HANDLERS CROPS ------------------
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you really want to delete this crop?")) return;
    try {
      await deleteCrop(id);
      fetchCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-800";

  if (!user || !isFarmer) {
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

  // ------------------ MENU ------------------
  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> }
  ];

  const farmsToShow = useMemo(() => farms, [farms]);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <img
          src="/src/assets/jendouba_agroconnect_logo.png"
          alt="Logo AgroConnect"
          className="mr-2 rounded-full object-cover"
          style={{ width: "220px", height: "220px", minWidth: "220px", minHeight: "220px" }}
        />
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
        <button
          onClick={logout}
          className="mt-auto bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg flex items-center justify-center"
        >
          <FiLogOut className="mr-2" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === "Profile" && (
          <div className={cardClass}>
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={!isEditingProfile}
                  className="w-full p-2 border rounded bg-[#FEF2F2]"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!isEditingProfile}
                  className="w-full p-2 border rounded bg-[#FEF2F2]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Farm Location</label>
                <div className="h-64 w-full border rounded-lg overflow-hidden">
                  <FarmMap
                    farms={[
                      {
                        location: {
                          lat: profileData?.location?.lat ?? 0,
                          lng: profileData?.location?.lng ?? 0
                        }
                      }
                    ]}
                    height={256}
                    editable={false}
                  />
                </div>
                {profileData?.location?.lat != null && profileData?.location?.lng != null && (
                  <div className="text-sm text-gray-600 mt-1">
                    Coordinates: {profileData.location.lat.toFixed(6)}, {profileData.location.lng.toFixed(6)}
                  </div>
                )}
              </div>

              {!isEditingProfile ? (
                <button
                  onClick={handleProfileEdit}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleProfileCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Crops</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Add Crop
              </button>
            </div>
            {showForm && (
              <CropForm
                crop={editingCrop}
                onClose={() => setShowForm(false)}
                onSuccess={handleFormSuccess}
              />
            )}
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2">Harvest Date</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop.crop_id}>
                    <td className="border px-4 py-2">{crop.crop_id}</td>
                    <td className="border px-4 py-2">{crop.name}</td>
                    <td className="border px-4 py-2">{crop.type}</td>
                    <td className="border px-4 py-2">{crop.harvest_date}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(crop)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(crop.crop_id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {crops.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      No crops found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-xl font-bold mb-4">Farm Map</h2>
            <FarmMap farms={farmsToShow} height={400} editable={false} />
          </div>
        )}

        {activeSection === "Weather Forecast" && (
          <WeatherWidget />
        )}

        {activeSection === "Messages" && (
          <MessageList user={user} />
        )}
      </main>
    </div>
  );
}
