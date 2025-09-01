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
import { LocationDisabled } from "@mui/icons-material";

export default function FarmerDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [mineFarm, setMineFarm] = useState(null);
  const [viewMode, setViewMode] = useState("mine");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    location: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });

  // Check if user is a farmer (case-insensitive)
  const isFarmer = user && user.role && user.role.toUpperCase() === "FARMER";

  // Memoize farms data - this must be called unconditionally
  const farmsToShow = useMemo(() => farms, [farms]);

  // ----- Fetch crops depending on the chosen mode -----
  const fetchCrops = useCallback(async () => {
    try {
      if (!user || !isFarmer) return;
      let data;
      if (viewMode === "mine") {
        data = await getCropsByFarmer();
      } else {
        data = await getAllCrops();
      }
      setCrops(data);
    } catch (err) {
      console.error("Error fetch crops:", err);
    }
  }, [user, viewMode, isFarmer]);

  // ----- Recover buyers -----
  useEffect(() => {
    if (!isFarmer) return;
    
    axios.get("http://localhost:8080/users?type=BUYER")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, [isFarmer]);

  // ----- collect mine farm  -----
  useEffect(() => {
    if (!user || !isFarmer) return;
    
    const fetchFarm = async () => {
      try {
        setIsLoading(true);
        const data = await getMyFarm(user.id);
        setMineFarm(data);
        setProfileData({
          name: data?.farmer_name || user.name || "",
          email: user.email || "",
         location: data?.location || "",
        });
        setOriginalProfileData({
          name: data?.farmer_name || user.name || "",
          email: user.email || "",
          Location: data?.location || "",
        });
      } catch (err) {
        console.error("Error getMyFarm:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFarm();
  }, [user, isFarmer]);

  // ----- Collect all farms -----
  useEffect(() => {
    if (!isFarmer) return;
    
    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        //For each farm, collect the crops
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

// Load crops when the active section changes 
 useEffect(() => {
    if (activeSection === "Crops" && isFarmer) fetchCrops();
  }, [activeSection, fetchCrops, viewMode, isFarmer]);

  // ----- Handlers Profile -----
  const handleProfileEdit = () => setIsEditingProfile(true);
  
  const handleProfileSave = async () => {
    try {
      setSaveStatus({ message: "Saving...", type: "info" });
      
      // update user information
      const userResponse = await axios.put(`http://localhost:8080/users/${user.id}`, {
        name: profileData.name,
        email: profileData.email
      });
      
     
      
      // Update the authentication context with the correct data
      if (userResponse.data) {
        
        const updatedUser = {
          ...userResponse.data,
          role: user.role, // Keep the original role
          id: user.id // keep original original
        };
        updateUser(updatedUser);
      }
      
      
      const farmData = await getMyFarm(user.id);
      setMineFarm(farmData);
      
      // Update the original profile data
      setOriginalProfileData({...profileData});
      
      setIsEditingProfile(false);
      setSaveStatus({ message: "Profile saved successfully!", type: "success" });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: "" });
      }, 3000);
      
      console.log("Profile saved:", profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus({ 
        message: "Failed to update profile. Please try again.", 
        type: "error" 
      });
    }
  };
  
  const handleProfileCancel = () => {
 
    if (originalProfileData) {
      setProfileData({...originalProfileData});
    }
    setIsEditingProfile(false);
    setSaveStatus({ message: "", type: "" });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d4c43] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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

  return (
    <div className="flex min-h-screen bg-[#f0f7f5]"> 
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
      <main className="flex-1 p-8 overflow-auto bg-[#f0f7f5]"> 
        
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div className={`${cardClass} profile-section`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">
                Welcome, {profileData.name || user.name}!
              </h1>
              <div className="flex space-x-2">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={handleProfileSave}
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleProfileEdit}
                    className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                  >
                    <FiEdit className="mr-2" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Status Message */}
            {saveStatus.message && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveStatus.type === "success" 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : saveStatus.type === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {saveStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/*  Profile Details */}
              <div className="space-y-4">
                {/* User ID */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiUser className="mr-2" /> User ID
                  </label>
                  <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{user.id}</p>
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiUser className="mr-2" /> Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiMail className="mr-2" /> Email
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>

                
              </div>

              {/* Right: Farm Location */}
              {mineFarm && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1d4c43]">My Farm Location</h2>
                  <div className="h-64 w-full border rounded-lg overflow-hidden">
                    <FarmMap 
                      farms={[mineFarm]} 
                      editable={false} 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Coordinates: {mineFarm.lat}, {mineFarm.lng}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {viewMode === "mine" ? "My Crops" : "All Crops"}
              </h1>

              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    viewMode === "mine"
                      ? "bg-[#1d4c43] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("mine")}
                >
                  My Crops
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    viewMode === "all"
                      ? "bg-[#1d4c43] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("all")}
                >
                  All Crops
                </button>
                {viewMode === "mine" && (
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

            {/* List of crops only if the form is not open */}
            {!showForm &&
              (crops.length > 0 ? (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                    <thead className="bg-[#1d4c43] text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Crop ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Farmer ID</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-left">Quantity</th>
                        <th className="py-3 px-4 text-left">Price</th>
                        <th className="py-3 px-4 text-left">Harvest Date</th>
                        <th className="py-3 px-4 text-left">Availability</th>
                        <th className="py-3 px-4 text-left">Image</th>
                        {viewMode === "mine" && (
                          <th className="py-3 px-4 text-left">Actions</th>
                        )}
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
                          <td className="py-3 px-4">{crop.farmer_id}</td>
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
                          {viewMode === "mine" && (
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
              ))}

            {/*  Crop Form */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-[#1d4c43] text-white px-3 py-1 rounded  w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-auto my-auto">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCrop(null);
                    }}
                    className="bg-[#1d4c43] text-white px-3 py-1 rounded  w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-auto my-auto"
                  >
                    <FiX size={24} />
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
            <MessageList user={user} contacts={buyers} />
          </div>
        )}

        {/* Farm Location Section */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              All Farms Location
            </h2>
            <FarmMap farms={farmsToShow} />
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