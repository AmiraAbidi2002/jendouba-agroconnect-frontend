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
  FiMenu
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
  
  // État pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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

  // Handler pour fermer le menu mobile quand on change de section
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Fermer le menu mobile après sélection
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

 // Ajoutez cet useEffect pour détecter les changements de taille d'écran
useEffect(() => {
  const handleResize = () => {
    setIsDesktop(window.innerWidth >= 1024);
    // Si on passe en desktop, on s'assure que le menu est visible
    if (window.innerWidth >= 1024) {
      setIsMobileMenuOpen(true);
    }
  };

  window.addEventListener('resize', handleResize);
  // Initialiser l'état au chargement
  setIsDesktop(window.innerWidth >= 1024);
  setIsMobileMenuOpen(window.innerWidth >= 1024);

  return () => window.removeEventListener('resize', handleResize);
}, []);

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

  // Classes CSS responsives
  const cardClass = "bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 text-gray-800";

  if (!user || !isFarmer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center border border-gray-200 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
            Access denied
          </h2>
          <p className="text-sm sm:text-base">You must be a farmer to access this page.</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Role detected: {user?.role || "Not connected"}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded text-sm sm:text-base"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#1d4c43] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-2 sm:mr-2 lg:mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-2 sm:mr-2 lg:mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-2 sm:mr-2 lg:mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-2 sm:mr-2 lg:mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-2 sm:mr-2 lg:mr-3" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f0f7f5]"> 
      {/* Menu burger pour mobile UNIQUEMENT */}
      {!isDesktop && (
  <button
    className="fixed top-4 left-4 z-50 bg-[#1d4c43] text-white p-2 rounded-lg shadow-lg"
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  >
    <FiMenu size={20} />
  </button>
)}

      {/* Overlay pour fermer le menu mobile UNIQUEMENT */}
      {isMobileMenuOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 "
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile coulissant, Desktop toujours visible */}
      <aside className={`
       fixed lg:relative 
       w-64 sm:w-72 lg:w-64
       h-full
       bg-[#1d4c43] text-white
       p-4 sm:p-6 lg:p-6
       flex flex-col
       z-50 lg:z-10
       transition-transform duration-300 ease-in-out
       overflow-y-auto
       flex-shrink-0
       ${isDesktop ? " translate-x-0" : isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Bouton de fermeture mobile UNIQUEMENT */}
        {!isDesktop && (
        <button
          className="self-end mb-4  text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <FiX size={24} />
        </button>)}

        {/* Logo - Mobile: 120px, Desktop: 220px */}
        <div className="flex justify-center mb-4 lg:mb-6">
          <img
      src="/src/assets/jendouba_agroconnect_logo.png"
      alt="Logo AgroConnect"
      className={`rounded-full object-cover`}
      style={{
        width: isDesktop ? "220px" : "120px",
        height: isDesktop ? "220px" : "120px",
        minWidth: isDesktop ? "220px" : "120px",
        minHeight: isDesktop ? "220px" : "120px",
      }}
    />
  </div>

        {/* Navigation */}
        <nav className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`flex items-center w-full mb-2 px-3 sm:px-4 lg:px-4 py-2 sm:py-3 lg:py-3 transition-colors rounded-lg text-sm sm:text-base lg:text-base ${
                activeSection === item.name
                  ? "text-orange-500 bg-white bg-opacity-10"
                  : "text-white hover:bg-white hover:bg-opacity-5"
              }`}
              onClick={() => handleSectionChange(item.name)}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        {/* Footer du sidebar */}
        <div className="mt-auto pt-4 border-t border-[#2a5c45]">
          <p className="text-xs sm:text-sm lg:text-sm opacity-75 mb-3">Logged in as Farmer</p>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-3 sm:px-4 lg:px-4 rounded-lg transition text-sm sm:text-base lg:text-base"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Responsive avec padding adaptatif */}
      <main className="flex-1 w-full lg:w-auto p-4 sm:p-6 lg:p-8 overflow-auto bg-[#f0f7f5] ml-0 lg:ml-0"> 
        
        {/* Header mobile avec titre de section */}
        <div className="lg:hidden mb-4 pt-12">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d4c43]">
            {activeSection}
          </h1>
        </div>
        
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div className={`${cardClass} profile-section`}>
            <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-start sm:items-center lg:items-center mb-4 sm:mb-6 lg:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-orange-500">
                Welcome, {profileData.name || user.name}!
              </h1>
              <div className="flex flex-col sm:flex-row lg:flex-row gap-2 w-full sm:w-auto lg:w-auto">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={handleProfileSave}
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center justify-center text-sm sm:text-base lg:text-base"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base lg:text-base"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleProfileEdit}
                    className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center justify-center text-sm sm:text-base lg:text-base"
                  >
                    <FiEdit className="mr-2" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Status Message */}
            {saveStatus.message && (
              <div className={`mb-4 p-3 rounded-lg text-sm sm:text-base lg:text-base ${
                saveStatus.type === "success" 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : saveStatus.type === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {saveStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-6 mb-4 sm:mb-6 lg:mb-6">
              {/*  Profile Details */}
              <div className="space-y-4">
                {/* User ID */}
                <div>
                  <label className="profile-label flex items-center text-sm sm:text-base lg:text-base font-medium text-gray-700 mb-1 lg:mb-0">
                    <FiUser className="mr-2" /> User ID
                  </label>
                  <p className="text-gray-900 bg-[#FEF2F2] p-2 sm:p-3 lg:p-2 rounded-lg text-sm sm:text-base lg:text-base">{user.id}</p>
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="profile-label flex items-center text-sm sm:text-base lg:text-base font-medium text-gray-700 mb-1 lg:mb-0">
                    <FiUser className="mr-2" /> Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-3 sm:px-4 lg:px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300 text-sm sm:text-base lg:text-base"
                    />
                  ) : (
                    <p className="text-gray-900 bg-[#FEF2F2] p-2 sm:p-3 lg:p-2 rounded-lg text-sm sm:text-base lg:text-base">{profileData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="profile-label flex items-center text-sm sm:text-base lg:text-base font-medium text-gray-700 mb-1 lg:mb-0">
                    <FiMail className="mr-2" /> Email
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-3 sm:px-4 lg:px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300 text-sm sm:text-base lg:text-base"
                    />
                  ) : (
                    <p className="text-gray-900 bg-[#FEF2F2] p-2 sm:p-3 lg:p-2 rounded-lg text-sm sm:text-base lg:text-base">{profileData.email}</p>
                  )}
                </div>
              </div>

              {/* Right: Farm Location - Ajusté pour tous les écrans */}
              {mineFarm && (
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-[#1d4c43]">My Farm Location</h2>
                  <div className="h-48 sm:h-56 lg:h-64 w-full border rounded-lg overflow-hidden relative z-0">
                    <FarmMap 
                      farms={[mineFarm]} 
                      editable={false} 
                    />
                  </div>
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600">
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
            <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-start sm:items-center lg:items-center mb-4 sm:mb-6 lg:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-800">
                {viewMode === "mine" ? "My Crops" : "All Crops"}
              </h1>

              <div className="flex flex-col sm:flex-row lg:flex-row gap-2 w-full sm:w-auto lg:w-auto">
                {/* Toggle buttons - Stack vertically sur mobile, horizontal sur desktop */}
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-2 lg:px-3 lg:py-1 rounded text-sm sm:text-base lg:text-base flex-1 sm:flex-none lg:flex-none ${
                      viewMode === "mine"
                        ? "bg-[#1d4c43] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setViewMode("mine")}
                  >
                    My Crops
                  </button>
                  <button
                    className={`px-3 py-2 lg:px-3 lg:py-1 rounded text-sm sm:text-base lg:text-base flex-1 sm:flex-none lg:flex-none ${
                      viewMode === "all"
                        ? "bg-[#1d4c43] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setViewMode("all")}
                  >
                    All Crops
                  </button>
                </div>
                
                {/* Add button */}
                {viewMode === "mine" && (
                  <button
                    className="bg-[#1d4c43] text-white px-3 py-2 lg:px-3 lg:py-1 rounded hover:bg-[#2a5c45] text-sm sm:text-base lg:text-base whitespace-nowrap"
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

            {/* Table des crops - Responsive avec scroll horizontal sur mobile */}
            {!showForm &&
              (crops.length > 0 ? (
                <div className="overflow-x-auto mb-6 -mx-2 sm:mx-0 lg:mx-0">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                      <table className="min-w-full bg-white">
                        <thead className="bg-[#1d4c43] text-white">
                          <tr>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">ID</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Name</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Farmer</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Type</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Qty</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Price</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Date</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Status</th>
                            <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Image</th>
                            {viewMode === "mine" && (
                              <th className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-left text-xs sm:text-sm lg:text-sm">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {crops.map((crop) => (
                            <tr
                              key={crop.crop_id}
                              className="border-t border-gray-200 hover:bg-gray-50"
                            >
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">{crop.crop_id}</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm font-medium">{crop.crop_name}</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">{crop.farmer_id}</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">{crop.crop_type}</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">{crop.quantity} kg</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">{crop.price} TND/kg</td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">
                                {new Date(crop.harvest_date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit'
                                })}
                              </td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4 text-xs sm:text-sm lg:text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  crop.availability 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {crop.availability ? "Available" : "N/A"}
                                </span>
                              </td>
                              <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4">
                                {crop.img_url ? (
                                  <img
                                    src={`http://localhost:8080/api/crops/image/${crop.img_url}`}
                                    alt={crop.crop_name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-full lg:max-h-24 lg:h-auto object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">No Image</span>
                                )}
                              </td>
                              
                              {viewMode === "mine" && (
                                <td className="py-2 sm:py-3 lg:py-3 px-2 sm:px-4 lg:px-4">
                                  <div className="flex flex-col sm:flex-row lg:flex-row gap-1 sm:gap-2 lg:gap-2">
                                    <button
                                      className="text-[#1d4c43] hover:text-[#2a5c45] text-xs sm:text-sm lg:text-sm p-1"
                                      onClick={() => handleEdit(crop)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm lg:text-sm p-1"
                                      onClick={() => handleDelete(crop.crop_id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm sm:text-base lg:text-base">No crops available.</p>
                </div>
              ))}

            {/*  Crop Form - Modal responsive */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
                  <div className="sticky top-0 bg-[#1d4c43] text-white p-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {editingCrop ? "Edit Crop" : "Add New Crop"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingCrop(null);
                      }}
                      className="text-white hover:text-gray-200"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  <div className="p-4">
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
              </div>
            )}
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <h1 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-4">Messages</h1>
            <div className="h-96 sm:h-[500px] lg:h-[600px]">
              <MessageList user={user} contacts={buyers} />
            </div>
          </div>
        )}

        {/* Farm Location Section */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-4">
              All Farms Location
            </h2>
            {/* Conteneur de carte avec hauteur responsive et z-index approprié */}
            <div className="h-64 sm:h-80 lg:h-96 w-full border rounded-lg overflow-hidden relative z-0">
              <FarmMap farms={farmsToShow} />
            </div>
            
            {/* Information supplémentaire sur mobile */}
            <div className="mt-4 lg:hidden">
              <p className="text-sm text-gray-600">
                Total farms: {farmsToShow.length}
              </p>
            </div>
          </div>
        )}

        {/* Weather Section */}
        {activeSection === "Weather Forecast" && (
          <div className={cardClass}>
            <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-4">
              Weather Forecast
            </h2>
            {/* Conteneur pour le widget météo responsive */}
            <div className="w-full">
              <WeatherWidget />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}