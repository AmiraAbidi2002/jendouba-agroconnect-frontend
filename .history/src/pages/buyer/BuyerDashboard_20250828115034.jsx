import React, { useEffect, useState } from "react";
import { FiUser, FiPackage, FiMapPin, FiMessageSquare, FiEdit, FiSave, FiPhone, FiMail, FiMap, FiKey, FiEye, FiEyeOff, FiLogOut } from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import FarmMap from "../../components/FarmMap";
import axios from "axios";

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
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
    location: { lat: 0, lng: 0 }
  });

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  useEffect(() => {
    axios.get("http://localhost:8080/users?type=FARMER")
      .then(res => setFarmers(res.data))
      .catch(err => console.error("Farmers recovery error:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8080/api/farms")
      .then(res => setFarms(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchCrops() {
      const data = await getAllCrops();
      setCrops(data);
    }
    fetchCrops();
  }, []);

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id || user.user_id || "",
        name: user.name || user.username || user.user_name || "",
        email: user.email || "",
        password: "********", 
        location: user.location || { lat: 36.5, lng: 8.8 } // Default to Jendouba coordinates
      });
    }
  }, [user]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    setIsEditingProfile(false);
    console.log("Profile data saved:", profileData);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const filteredCrops = crops.filter(crop => {
    const matchesName = crop.crop_name.toLowerCase().includes(filter.name.toLowerCase());
    const matchesType = filter.type ? crop.crop_type === filter.type : true;
    const matchesAvailability = filter.availability === "" ? true : crop.availability === (filter.availability === "true");
    const matchesHarvestDate = filter.harvestDate === "" ? true : new Date(crop.harvest_date) >= new Date(filter.harvestDate);
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
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div className={`${cardClass} profile-section`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">
                Welcome, {profileData.name}!
              </h1>
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
                    <p className="text-gray-900">••••••••</p>
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
                      locationUrl: `https://www.google.com/maps?q=${profileData.location.lat},${profileData.location.lng}`,
                      crops: []
                    }]} 
                    height={256}
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

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={filter.name} 
                  onChange={handleFilterChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1d4c43]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Type</label>
                <select 
                  name="type" 
                  value={filter.type} 
                  onChange={handleFilterChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1d4c43]"
                >
                  <option value="">All Types</option>
                  <option value="food crops">Food Crops</option>
                  <option value="forage crops">Forage Crops</option>
                  <option value="fiber crops">Fiber Crops</option>
                  <option value="oil crops">Oil Crops</option>
                  <option value="ornamental crops">Ornamental Crops</option>
                  <option value="industrial crops">Industrial Crops</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Availability</label>
                <select 
                  name="availability" 
                  value={filter.availability} 
                  onChange={handleFilterChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1d4c43]"
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Harvest Date From</label>
                <input 
                  type="date" 
                  name="harvestDate" 
                  value={filter.harvestDate} 
                  onChange={handleFilterChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1d4c43]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                <thead className="bg-[#1d4c43] text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Availability</th>
                    <th className="py-3 px-4 text-left">Harvest Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrops.map(crop => (
                    <tr key={crop.crop_id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{crop.crop_name}</td>
                      <td className="py-3 px-4">{crop.crop_type}</td>
                      <td className="py-3 px-4">{crop.quantity} kg</td>
                      <td className="py-3 px-4">{crop.price} TND/kg</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          crop.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {crop.availability ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
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