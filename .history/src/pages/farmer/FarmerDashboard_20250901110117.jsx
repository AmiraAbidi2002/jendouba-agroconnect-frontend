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
  FiX,
  FiMenu,
  FiTrash2
} from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, getAllCrops, deleteCrop } from "../../api/cropApi";
import { getMyFarm, getAllFarms } from "../../api/farmApi";
import axios from "axios";

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
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Check if user is a farmer (case-insensitive)
  const isFarmer = user && user.role && user.role.toUpperCase() === "FARMER";

  // Memoize farms data - this must be called unconditionally
  const farmsToShow = useMemo(() => farms, [farms]);

  const parseLatLng = (loc) => {
    try {
      if (!loc) return { lat: 36.4366, lng: 8.4518 };
      
      if (typeof loc === 'string') {
        const [lat, lng] = loc.split(",");
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      } else if (loc && loc.lat !== undefined && loc.lng !== undefined) {
        return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) };
      }
      
      return { lat: 36.4366, lng: 8.4518 };
    } catch {
      return { lat: 36.4366, lng: 8.4518 };
    }
  };

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
    } catch (error) {
      console.error("Error fetch crops:", error);
    }
  }, [user, viewMode, isFarmer]);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when changing section on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeSection, isMobile]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    setIsLoading(true);
    setError("");
    
    try {
      const userId = user.sub || user.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const updateData = {
        user_name: profileData.name,
        email: profileData.email,
        location: `${profileData.location.lat},${profileData.location.lng}`
      };
      
      const response = await axios.put(`http://localhost:8080/users/${userId}`, updateData);
      
      if (response.data) {
        const loc = parseLatLng(response.data.location);
        
        updateUser({
          ...user,
          id: response.data.id || userId,
          name: response.data.user_name || response.data.name,
          email: response.data.email,
          location: loc
        });
        
        setProfileData(prev => ({
          ...prev,
          name: response.data.user_name || response.data.name,
          email: response.data.email,
          location: loc
        }));
        
        setOriginalProfileData({
          id: response.data.id || userId,
          name: response.data.user_name || response.data.name,
          email: response.data.email,
          location: loc
        });
      }
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
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
    <div className="flex min-h-screen bg-[#f0f7f5] relative">
      {/* Overlay pour mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-64 bg-[#1d4c43] text-white p-6 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <img
          src="/src/assets/jendouba_agroconnect_logo.png"
          alt="Logo AgroConnect"
          className="mr-2 rounded-full object-cover hidden md:block"
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
      <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#f0f7f5] relative">
        {/* Bouton hamburger pour mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-50 bg-[#1d4c43] text-white p-2 rounded-lg"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        )}
        
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
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center disabled:opacity-50"
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
              {/* Profile Details */}
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
                    <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{profileData.name}</p>
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
                    <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{profileData.email}</p>
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
                  {/* Version mobile - cartes */}
                  <div className="md:hidden grid gap-4">
                    {crops.map((crop) => (
                      <div key={crop.crop_id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{crop.crop_name}</h3>
                            <p className="text-sm text-gray-600">{crop.crop_type}</p>
                          </div>
                          {viewMode === "mine" && (
                            <div className="flex space-x-2">
                              <button onClick={() => handleEdit(crop)} className="text-[#1d4c43]">
                                <FiEdit />
                              </button>
                              <button onClick={() => handleDelete(crop.crop_id)} className="text-red-500">
                                <FiTrash2 />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>Quantity: {crop.quantity} kg</div>
                          <div>Price: {crop.price} TND/kg</div>
                          <div>Harvest: {new Date(crop.harvest_date).toLocaleDateString()}</div>
                          <div>{crop.availability ? "Available" : "Not available"}</div>
                        </div>
                        {crop.img_url && (
                          <img
                            src={`http://localhost:8080/api/crops/image/${crop.img_url}`}
                            alt={crop.crop_name}
                            className="mt-2 w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Version desktop (tableau) */}
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow hidden md:table">
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
                                src={`http://localhost:8080/api/crops/image/${crop.img_url}`}
                                alt={crop.crop_name}
                                className="w-full max-h-24 h-auto object-cover rounded"
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

            {/* Crop Form */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-4">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCrop(null);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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