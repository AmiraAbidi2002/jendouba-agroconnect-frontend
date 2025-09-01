import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FiUser, FiPackage, FiMapPin, FiCloud, FiMessageSquare, FiEdit, FiSave, FiLogOut, FiMail, FiMap 
} from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, getAllCrops, deleteCrop } from "../../api/cropApi";
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
  const [viewMode, setViewMode] = useState("mine");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "", email: "", address: ""
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

  // ----- Récupérer les buyers -----
  useEffect(() => {
    fetch("http://localhost:8080/users?type=BUYER")
      .then(res => res.json())
      .then(data => setBuyers(data))
      .catch(err => console.error(err));
  }, []);

  // ----- Récupérer mes cultures -----
  const fetchCrops = useCallback(async () => {
    try {
      if (!user) return;
      let data;
      data = viewMode === "mine" ? await getCropsByFarmer(user.id) : await getAllCrops();
      setCrops(data);
    } catch (err) {
      console.error("Error fetch crops:", err);
    }
  }, [user, viewMode]);

  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection, fetchCrops, viewMode]);

  // ----- Handlers Profile -----
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    // TODO: envoyer profileData au backend pour mise à jour
    console.log("Profile saved:", profileData);
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // ----- Handlers Crops -----
  const handleEdit = (crop) => { setEditingCrop(crop); setShowForm(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Do you really want to delete this crop?")) return;
    try { await deleteCrop(id); fetchCrops(); } catch (err) { console.error(err); }
  };
  const handleFormSuccess = () => { setShowForm(false); setEditingCrop(null); fetchCrops(); };

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-800";

  if (!user || user.role !== "FARMER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access denied</h2>
          <p>You must be a farmer to access this page.</p>
          <p className="text-sm text-gray-600 mt-2">Role detected: {user?.role || "Not connected"}</p>
          <button onClick={() => (window.location.href = "/")} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
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
          {menuItems.map(item => (
            <button key={item.name} className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-colors ${activeSection === item.name ? "text-orange-500 bg-white bg-opacity-10" : "text-white hover:bg-white hover:bg-opacity-5"}`}
              onClick={() => setActiveSection(item.name)}>
              {item.icon}{item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45]">
          <p className="text-sm opacity-75 mb-3">Logged in as Farmer</p>
          <button onClick={logout} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition">
            <FiLogOut className="mr-2"/> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-white">
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">Welcome, {profileData.name || user.name}!</h1>
              {isEditingProfile ? (
                <button onClick={handleProfileSave} className="bg-[#1d4c43] text-white px-4 py-2 rounded flex items-center hover:bg-[#2a5c45]">
                  <FiSave className="mr-2"/> Save
                </button>
              ) : (
                <button onClick={handleProfileEdit} className="bg-[#1d4c43] text-white px-4 py-2 rounded flex items-center hover:bg-[#2a5c45]">
                  <FiEdit className="mr-2"/> Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="flex items-center"><FiUser className="mr-2"/> Full Name</label>
                  {isEditingProfile ? (
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"/>
                  ) : <p className="text-gray-900">{profileData.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center"><FiMail className="mr-2"/> Email</label>
                  {isEditingProfile ? (
                    <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"/>
                  ) : <p className="text-gray-900">{profileData.email}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center"><FiMap className="mr-2"/> Address</label>
                  {isEditingProfile ? (
                    <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"/>
                  ) : <p className="text-gray-900">{profileData.address}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1d4c43]">Farm Location</h2>
                {mineFarm ? (
                  <div className="h-64 w-full border rounded-lg overflow-hidden">
                    <FarmMap farms={[{
                      farmer_id: mineFarm.id,
                      farmerName: mineFarm.farmer_name,
                      lat: mineFarm.location?.lat || 36.5,
                      lng: mineFarm.location?.lng || 8.8,
                      locationUrl: `https://www.google.com/maps?q=${mineFarm.location?.lat || 36.5},${mineFarm.location?.lng || 8.8}`,
                      crops: []
                    }]} height={256}/>
                  </div>
                ) : <p>Loading farm location...</p>}
              </div>
            </div>
          </div>
        )}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">My Crops</h1>
              <button onClick={() => setShowForm(true)} className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45]">
                Add Crop
              </button>
            </div>
            {showForm && <CropForm crop={editingCrop} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)}/>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {crops.map(c => (
                <div key={c.id} className="p-4 border rounded-lg shadow-sm bg-[#FEF2F2]">
                  <h2 className="font-bold text-lg">{c.crop_name}</h2>
                  <p>Type: {c.crop_type}</p>
                  <p>Availability: {c.availability ? "Yes" : "No"}</p>
                  <p>Harvest Date: {new Date(c.harvest_date).toLocaleDateString()}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} contacts={buyers}/>
          </div>
        )}

        {/* Weather Section */}
        {activeSection === "Weather Forecast" && (
          <div className={cardClass}>
            <WeatherWidget location={mineFarm?.location}/>
          </div>
        )}

        {/* Farm Location Section */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Farms</h2>
            <FarmMap farms={farmsToShow}/>
          </div>
        )}
      </main>
    </div>
  );
}
