import React, { useEffect, useState } from "react"; 
import { FiUser, FiPackage, FiMapPin, FiMessageSquare, FiEdit, FiSave, FiMail, FiMap, FiKey, FiEye, FiEyeOff, FiLogOut } from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import FarmMap from "../../components/FarmMap";
import axios from "axios";

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
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    location: { lat: 36.4366, lng: 8.4518 }
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Location", icon: <FiMapPin className="mr-3" /> },
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
        password: "",
        location: loc
      });
      
      setOriginalProfileData({
        id: user.sub || user.id || "",
        name: user.name || user.user_name || "",
        email: user.email || "",
        password: "",
        location: loc
      });
    }
  }, [user]);

  const fetchFarmers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/users?type=FARMER");
      setFarmers(response.data);
    } catch (err) {
      console.error("Farmers recovery error:", err);
      setError("Failed to load farmers data");
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/farms");
      setFarms(response.data);
    } catch (err) {
      console.error("Farms recovery error:", err);
      setError("Failed to load farms data");
    }
  };

  const fetchCropsData = async () => {
    try {
      const data = await getAllCrops();
      // Corriger les champs manquants
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
  
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleProfileSave = async () => {
    setLoading(true);
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
      
      if (profileData.password) {
        updateData.password = profileData.password;
      }
      
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
          password: "",
          location: loc
        }));
        
        setOriginalProfileData({
          id: response.data.id || userId,
          name: response.data.user_name || response.data.name,
          email: response.data.email,
          password: "",
          location: loc
        });
      }
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
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

  const handleLocationChange = (lat, lng) => {
    setProfileData(prev => ({
      ...prev,
      location: { lat, lng }
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌿</span>
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
          <p className="text-sm opacity-75 mb-3">Logged in as Buyer</p>
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
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
                      disabled={loading}
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center disabled:opacity-50"
                    >
                      {loading ? "Saving..." : (<> <FiSave className="mr-2" /> Save </>)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="profile-label flex items-center">
                    <FiUser className="mr-2" /> User ID
                  </label>
                  <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{profileData.id}</p>
                </div>

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

                <div>
                  <label className="profile-label flex items-center">
                    <FiKey className="mr-2" /> Password
                  </label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={profileData.password}
                        onChange={handleProfileChange}
                        placeholder="Enter new password"
                        className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300 pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900">Click edit to change password</p>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1d4c43]">Your Location</h2>
                <div className="h-64 w-full border rounded-lg overflow-hidden">
                  <FarmMap 
                    farms={[{
                      farmer_id: profileData.id,
                      farmerName: profileData.name,
                      lat: profileData.location.lat,
                      lng: profileData.location.lng,
                      locationUrl: `${profileData.location.lat},${profileData.location.lng}`,
                      crops: []
                    }]} 
                    height={256}
                    editable={isEditingProfile}
                    onLocationChange={handleLocationChange}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Coordinates: {profileData.location.lat.toFixed(6)}, {profileData.location.lng.toFixed(6)}
                </div>
                {isEditingProfile && (
                  <div className="text-xs text-gray-500">
                    Click on the map to change your location
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Crops</h1>
            
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Filter by name"
                name="name"
                value={filter.name}
                onChange={handleFilterChange}
                className="p-2 border rounded-lg"
              />
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="p-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fruit">Fruit</option>
                <option value="Grain">Grain</option>
              </select>
              <select
                name="availability"
                value={filter.availability}
                onChange={handleFilterChange}
                className="p-2 border rounded-lg"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
              <input
                type="date"
                name="harvestDate"
                value={filter.harvestDate}
                onChange={handleFilterChange}
                className="p-2 border rounded-lg"
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Crop Id</th>
                    <th className="py-3 px-6 text-left">Crop Name</th>
                    <th className="py-3 px-6 text-left"> farmer_id</th>
                    <th className="py-3 px-6 text-left">Type</th>
                    <th className="py-3 px-6 text-left">Available</th>
                    <th className="py-3 px-6 text-left">Harvest Date</th>
                    <th className="py-3 px-6 text-left">Price</th>
                    <th className="py-3 px-6 text-left">Quantity</th>
                    <th className="py-3 px-6 text-left">img</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => (
                      <tr key={crop.crop_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6">{crop.crop_id}</td>
                        <td className="py-3 px-6">{crop.crop_name}</td>
                         <td className="py-3 px-6">{crop.farmer_id}</td>
                        <td className="py-3 px-6">{crop.crop_type}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs ${crop.availability ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {crop.availability ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-6">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                        <td className="py-3 px-6">${crop.price_per_unit}</td>
                        <td className="py-3 px-6">{crop.quantity} {crop.unit}</td>
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
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                        No crops found matching your filters
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
        {activeSection === "Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Farms & Crops Location
            </h2>
            <FarmMap farms={farms} />
          </div>
        )}
      </main>
    </div>
  );
}