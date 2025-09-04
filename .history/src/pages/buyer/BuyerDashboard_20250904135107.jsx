import React, { useEffect, useState } from "react"; 
import { FiUser, FiPackage, FiMapPin, FiMessageSquare, FiEdit, FiSave, FiMail, FiLogOut, FiFilter, FiCalendar,FiMenu, FiX,FiCloud } from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import FarmMap from "../../components/FarmMap";
import WeatherWidget from "../../components/WeatherWidget";
import axios from "axios";
import logo from "../../assets/jendouba_agroconnect_logo.png"
export const API_URL = "https://jendouba-agroconnect-backend-1.onrender.com";


// Hook  
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

export default function BuyerDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [activeSection, setActiveSection] = useState("Profile");
  const [filter, setFilter] = useState({
    name: "",
    type: "",
    availability: "",
    harvestDate: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    location: { lat: 36.4366, lng: 8.4518 }
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // use  of hook 
  const isMobile = !useMediaQuery("(min-width: 768px)");

   // Check if user is a farmer (case-insensitive)
  const isBuyer = user && user.role && user.role.toUpperCase() === "BUYER";
  // Types of cultures  
  const cropTypes = [
    "Food crops",
    "Forage crops", 
    "Fiber crops",
    "Oil crops",
    "Ornamental crops",
    "Industrial crops"
  ];

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farms & Crops Location", icon: <FiMapPin className="mr-3" /> },
     { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

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

  useEffect(() => {
    fetchFarmers();
    fetchFarms();
    fetchCropsData();
    
    if (user) { 
      const loc = parseLatLng(user.location);
      
      setProfileData({
        id: user.sub || user.id || "",
        name: user.name || user.user_name || "",
        email: user.email || "",
        location: loc
      });
      
      setOriginalProfileData({
        id: user.sub || user.id || "",
        name: user.name || user.user_name || "",
        email: user.email || "",
        location: loc
      });
    }
  }, [user]);

  const fetchFarmers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users?type=FARMER`);
      setFarmers(response.data);
    } catch (err) {
      console.error("Farmers recovery error:", err);
      setError("Failed to load farmers data");
    }
  };

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/farms`);
      setFarms(response.data);
    } catch (err) {
      console.error("Farms recovery error:", err);
      setError("Failed to load farms data");
    }finally {
        setIsLoading(false);
      }
  };

  const fetchCropsData = async () => {
    try {
      const data = await getAllCrops();
     
      const correctedCrops = data.map(crop => ({
        ...crop,
        farmer_id: crop.farmer_id || crop.farmerId || "Unknown",
        farmer_name: crop.farmer_name || crop.farmerName || "Unknown Farmer",
        price_per_unit: crop.price_per_unit || crop.price || 0,
        unit: crop.unit || "kg"
      }));
      setCrops(correctedCrops);
    } catch (err) {
      console.error("Crops recovery error:", err);
      setError("Failed to load crops data");
    }
  };

  useEffect(() => {
    console.log("Crops data:", crops);
    if (crops.length > 0) {
      console.log("First crop farmer_id:", crops[0].farmer_id);
      console.log("All crops farmer_ids:", crops.map(c => c.farmer_id));
    }
    crops.forEach(crop => {
      console.log(`Crop ${crop.crop_id} - Farmer ID:`, crop.farmer_id);
    });
  }, [crops]);
  
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

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
      
      
      
      const response = await axios.put(`${API_URL}/users/${userId}`, updateData);
      
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
    setError("");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  

  

  const filteredCrops = crops.filter(crop => {
    const matchesName = crop.crop_name?.toLowerCase().includes(filter.name.toLowerCase()) || false;
    const matchesType = filter.type ? crop.crop_type === filter.type : true;
    const matchesAvailability = filter.availability === "" ? true : crop.availability === (filter.availability === "true");
    
    let matchesHarvestDate = true;
    if (filter.harvestDate) {
      try {
        const cropHarvestDate = new Date(crop.harvest_date);
        const filterDate = new Date(filter.harvestDate);
        cropHarvestDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        matchesHarvestDate = cropHarvestDate >= filterDate;
      } catch (error) {
        console.error("Error comparing dates:", error);
      }
    }
    
    return matchesName && matchesType && matchesAvailability && matchesHarvestDate;
  });

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-800";
 
 
 
 
  if (!user || !isBuyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access denied
          </h2>
          <p>You must be a buyer to access this page.</p>
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
  return (
     <div className="flex flex-row h-screen bg-[#f0f7f5]"> 
          {/* Sidebar desktop */}
          {!isMobile && (
            <aside className="  h-full w-64 bg-[#1d4c43] text-white p-6 ">
              <img
                src={logo}
                alt="logo"
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
                    onClick={() =>{ 
                      setActiveSection(item.name);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t border-[#2a5c45]">
                <p className="text-sm opacity-75 mb-3">Logged in as Buyer</p>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
                >
                  <FiLogOut className="mr-2" /> Logout
                </button>
              </div>
            </aside>
          )}
    
          {/* Sidebar mobile */}
          {isMobile && (
            <>
              <button
                className="p-4 fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg"
                onClick={() => setIsSidebarOpen(v => !v)}
              >
                {isSidebarOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
              </button>
              
              {isSidebarOpen && (
                <aside
                  className="fixed top-0 left-0 h-screen w-64 bg-[#1d4c43] text-white p-6 z-40 overflow-auto"
                >
                  <img
                    src={logo}
                    alt="logo"
                    className="mr-2 rounded-full object-cover"
                    style={{ width: "220px", height: "220px", minWidth: "220px", minHeight: "220px" }}
                  />
    
                  <nav className="flex-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.name}
                        className={` flex items-center w-full mb-2 px-4 py-3 transition-colors rounded-lg ${
                          activeSection === item.name
                            ? "text-orange-500 bg-white bg-opacity-10"
                            : "text-white hover:bg-white hover:bg-opacity-5"
                        }`}
                        onClick={() =>{ 
                          setActiveSection(item.name);
                          setIsSidebarOpen(false);
                        }}
                      >
                        {item.icon}
                        {item.name}
                      </button>
                    ))}
                  </nav>
                  <div className="mt-auto pt-4 border-t border-[#2a5c45]">
                    <p className="text-sm opacity-75 mb-3">Logged in as Buyer</p>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </div>
                </aside>
              )}
            </>
          )}
    
          {/* Main Content */}
          <main className={`flex-1 p-8 overflow-auto bg-[#f0f7f5] z-0 relative `}> 
           
    
        
        {/* Profile Section */}
{activeSection === "Profile" && (
  <div className={`${cardClass} profile-section`}>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-orange-500">
        Welcome, {profileData.name}!
      </h1>
      <div className="flex space-x-2">
        {isEditingProfile ? (
          <>
            <button
              onClick={handleProfileSave}
              disabled={isLoading}
              className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center disabled:opacity-50"
            >
              {isLoading ? "Saving..." : (<> <FiSave className="mr-2" /> Save </>)}
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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="space-y-4">
        {/* User ID */}
        <div>
          <label className="profile-label flex items-center">
            <FiUser className="mr-2" /> User ID
          </label>
          <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{profileData.id}</p>
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

      {/* Location (no editable) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1d4c43]">Your Location</h2>
        <div className="h-64 w-full border rounded-lg overflow-hidden">
          <FarmMap 
            farms={[{ lat: profileData.location.lat, lng: profileData.location.lng }]} 
            height={256} 
            editable={false} //  no editable map
          />
        </div>
        <div className="text-sm text-gray-600">
          Coordinates: {profileData.location.lat.toFixed(6)}, {profileData.location.lng.toFixed(6)}
        </div>
      </div>
    </div>
  </div>
)}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Crops</h1>
            
            {/* Filters by labels */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiFilter className="mr-2 text-[#1d4c43]" />
                <h3 className="text-lg font-semibold text-gray-700">Filter Crops</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filter by Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    name="name"
                    value={filter.name}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4c43] focus:border-transparent"
                  />
                </div>

                {/* Filter by Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Type
                  </label>
                  <select
                    name="type"
                    value={filter.type}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4c43] focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {cropTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={filter.availability}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4c43] focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                {/* Filter by Harvest Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" />
                      Harvest Date (After)
                    </div>
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={filter.harvestDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4c43] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Shows crops harvested after this date
                  </p>
                </div>
              </div>

              {/* Reset Filters Button */}
              {(filter.name || filter.type || filter.availability || filter.harvestDate) && (
                <div className="mt-4">
                  <button
                    onClick={() => setFilter({
                      name: "",
                      type: "",
                      availability: "",
                      harvestDate: ""
                    })}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredCrops.length} of {crops.length} crops
                {(filter.name || filter.type || filter.availability || filter.harvestDate) && 
                 " (filtered)"}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-[#1d4c43] text-white uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Crop ID</th>
                    <th className="py-3 px-6 text-left">Crop Name</th>
                    <th className="py-3 px-6 text-left">Farmer ID</th>
                    <th className="py-3 px-6 text-left">Type</th>
                    <th className="py-3 px-6 text-left">Available</th>
                    <th className="py-3 px-6 text-left">Harvest Date</th>
                    <th className="py-3 px-6 text-left">Price</th>
                    <th className="py-3 px-6 text-left">Quantity</th>
                    <th className="py-3 px-6 text-left">Image</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => (
                      <tr key={crop.crop_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">{crop.crop_id}</td>
                        <td className="py-3 px-6 font-medium">{crop.crop_name}</td>
                        <td className="py-3 px-6">{crop.farmer_id}</td>
                        <td className="py-3 px-6">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {crop.crop_type}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            crop.availability 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {crop.availability ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {new Date(crop.harvest_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 font-semibold">
                          ${crop.price_per_unit}
                        </td>
                        <td className="py-3 px-6">
                          {crop.quantity} {crop.unit}
                        </td>
                        <td className="py-3 px-6">
                          {crop.img_url ? (
                            <img
                              src={crop.img_url}
                              alt={crop.crop_name}
                              className="w-full max-h-24 h-auto object-cover rounded"
                              onError={(e) => (e.target.style.display = 'none')}
                              />
                             ) : (
                              <span className="text-xs text-gray-500">No Image</span>
                              )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-8 px-6 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiPackage className="text-4xl text-gray-300 mb-2" />
                          <p className="text-lg">No crops found</p>
                          <p className="text-sm">
                            {crops.length === 0 
                              ? "No crops available in the system" 
                              : "No crops match your filters"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} contacts={farmers} />
          </div>
        )}

        {/* Location Section */}
        {activeSection === "Farms & Crops Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Farms & Crops Location
            </h2>
            <FarmMap farms={farms} />
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