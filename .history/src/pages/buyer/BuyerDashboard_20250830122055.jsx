import React, { useEffect, useState } from "react";
import { 
  FiUser, FiPackage, FiMapPin, FiMessageSquare, FiEdit, FiSave, 
  FiMail, FiLogOut, FiFilter, FiCalendar 
} from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import FarmMap from "../../components/FarmMap";
import axios from "axios";

export default function BuyerDashboard() {
  const { user, logout, updateUser } = useAuth();

  // State
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [activeSection, setActiveSection] = useState("Profile");
  const [filter, setFilter] = useState({ name: "", type: "", availability: "", harvestDate: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({ id: "", name: "", email: "", password: "", location: { lat: 36.4366, lng: 8.4518 }});
  const [originalProfileData, setOriginalProfileData] = useState(null);

  const cropTypes = ["Vegetable", "Fruit", "Grain", "Legume", "Herb", "Spice"];
  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  // Parse lat/lng from string or object
  const parseLatLng = (loc) => {
    if (!loc) return { lat: 36.4366, lng: 8.4518 };
    if (typeof loc === "string") {
      const [lat, lng] = loc.split(",");
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    } else if (loc.lat !== undefined && loc.lng !== undefined) {
      return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) };
    }
    return { lat: 36.4366, lng: 8.4518 };
  };

  // Initial data fetch
  useEffect(() => {
    fetchFarmers();
    fetchFarms();
    fetchCrops();

    if (user) {
      const loc = parseLatLng(user.location);
      const userData = {
        id: user.sub || user.id || "",
        name: user.name || user.user_name || "",
        email: user.email || "",
        password: "",
        location: loc
      };
      setProfileData(userData);
      setOriginalProfileData(userData);
    }
  }, [user]);

  const fetchFarmers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/users?type=FARMER");
      setFarmers(res.data);
    } catch (err) {
      console.error("Farmers fetch error:", err);
      setError("Failed to load farmers data");
    }
  };

  const fetchFarms = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/farms");
      setFarms(res.data);
    } catch (err) {
      console.error("Farms fetch error:", err);
      setError("Failed to load farms data");
    }
  };

  const fetchCrops = async () => {
    try {
      const data = await getAllCrops();
      // Normalize missing fields
      const corrected = data.map(crop => ({
        ...crop,
        farmer_id: crop.farmer_id || crop.farmerId || "Unknown",
        farmer_name: crop.farmer_name || crop.farmerName || "Unknown Farmer",
        price_per_unit: crop.price_per_unit || crop.price || 0,
        unit: crop.unit || "kg"
      }));
      setCrops(corrected);
    } catch (err) {
      console.error("Crops fetch error:", err);
      setError("Failed to load crops data");
    }
  };

  // Profile handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileCancel = () => {
    setProfileData({ ...originalProfileData });
    setIsEditingProfile(false);
    setError("");
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  const handleLocationChange = (lat, lng) => {
    setProfileData(prev => ({ ...prev, location: { lat, lng } }));
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleProfileSave = async () => {
    setLoading(true); setError("");
    try {
      const userId = user.sub || user.id;
      if (!userId) throw new Error("User ID not found");
      const updateData = { user_name: profileData.name, email: profileData.email, location: `${profileData.location.lat},${profileData.location.lng}` };
      if (profileData.password) updateData.password = profileData.password;

      const res = await axios.put(`http://localhost:8080/users/${userId}`, updateData);
      const loc = parseLatLng(res.data.location);
      updateUser({ ...user, id: res.data.id || userId, name: res.data.user_name || res.data.name, email: res.data.email, location: loc });
      setProfileData({ ...profileData, password: "", location: loc });
      setOriginalProfileData({ ...profileData, password: "", location: loc });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally { setLoading(false); }
  };

  // Filter handler
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  // Filtered crops
  const filteredCrops = crops.filter(crop => {
    const matchesName = crop.crop_name?.toLowerCase().includes(filter.name.toLowerCase()) ?? false;
    const matchesType = filter.type ? crop.crop_type === filter.type : true;
    const matchesAvailability = filter.availability === "" ? true : crop.availability === (filter.availability === "true");
    let matchesHarvestDate = true;
    if (filter.harvestDate) {
      try {
        const cropDate = new Date(crop.harvest_date); cropDate.setHours(0,0,0,0);
        const filterDate = new Date(filter.harvestDate); filterDate.setHours(0,0,0,0);
        matchesHarvestDate = cropDate >= filterDate;
      } catch {}
    }
    return matchesName && matchesType && matchesAvailability && matchesHarvestDate;
  });

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-800";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <img src="/src/assets/jendouba_agroconnect_logo.png" alt="Logo" className="mr-2 rounded-full object-cover" style={{ width: "220px", height: "220px" }}/>
        <nav className="flex-1">
          {menuItems.map(item => (
            <button key={item.name} className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-colors ${activeSection === item.name ? "text-orange-500 bg-white bg-opacity-10" : "text-white hover:bg-white hover:bg-opacity-5"}`} onClick={() => setActiveSection(item.name)}>
              {item.icon}{item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45]">
          <p className="text-sm opacity-75 mb-3">Logged in as Buyer</p>
          <button onClick={logout} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"><FiLogOut className="mr-2"/> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto bg-white">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Profile */}
        {activeSection === "Profile" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">Welcome, {profileData.name}!</h1>
              <div className="flex space-x-2">
                {isEditingProfile ? (
                  <>
                    <button onClick={handleProfileSave} disabled={loading} className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center disabled:opacity-50">{loading ? "Saving..." : <><FiSave className="mr-2"/> Save</>}</button>
                    <button onClick={handleProfileCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center">Cancel</button>
                  </>
                ) : (
                  <button onClick={handleProfileEdit} className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"><FiEdit className="mr-2"/> Edit</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Profile Info */}
              <div className="space-y-4">
                <div><label className="flex items-center"><FiUser className="mr-2"/> User ID</label><p className="bg-[#FEF2F2] p-2 rounded">{profileData.id}</p></div>
                <div><label className="flex items-center"><FiUser className="mr-2"/> Full Name</label>{isEditingProfile ? <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full rounded px-4 py-2 border bg-[#FEF2F2]"/> : <p>{profileData.name}</p>}</div>
                <div><label className="flex items-center"><FiMail className="mr-2"/> Email</label>{isEditingProfile ? <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full rounded px-4 py-2 border bg-[#FEF2F2]"/> : <p>{profileData.email}</p>}</div>
              </div>
              {/* Right: Location */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1d4c43]">Your Location</h2>
                <div className="h-64 w-full border rounded-lg overflow-hidden"><FarmMap farms={[{ lat: profileData.location.lat, lng: profileData.location.lng }]} height={256} editable={false}/></div>
                <div className="text-sm text-gray-600">Coordinates: {profileData.location.lat.toFixed(6)}, {profileData.location.lng.toFixed(6)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Crops */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Crops</h1>
            {/* Filters & Table */}
            {/* ...Keep filters and table as in your original code... */}
          </div>
        )}

        {/* Messages */}
        {activeSection === "Messages" && (
          <div className={cardClass}><MessageList user={user} contacts={farmers}/></div>
        )}

        {/* Location */}
        {activeSection === "Location" && (
          <div className={cardClass}><h2 className="text-2xl font-bold mb-4">Farms & Crops Location</h2><FarmMap farms={farms}/></div>
        )}
      </main>
    </div>
  );
}
