// src/pages/buyer/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { FiUser, FiPackage, FiMapPin, FiMessageSquare, FiEdit, FiSave, FiLogOut, FiMail, FiMap, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import FarmMap from "../../components/FarmMap";
import { updateProfileRequest } from "../../api/authService";
import axios from "axios";

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const [crops, setCrops] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [activeSection, setActiveSection] = useState("Profile");
  const [filter, setFilter] = useState({ name: "", type: "", availability: "", harvestDate: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    password: "********",
    location: { lat: 36.5, lng: 8.8 }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id,
        name: user.name || user.user_name || "",
        email: user.email || "",
        password: "********",
        location: user.location || { lat: 36.5, lng: 8.8 }
      });
    }
  }, [user]);

  useEffect(() => {
    axios.get("http://localhost:8080/users?type=FARMER")
      .then(res => setFarmers(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchCrops() {
      const data = await getAllCrops();
      setCrops(data);
    }
    fetchCrops();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleProfileSave = async () => {
    try {
      const payload = {
        user_name: profileData.name,
        email: profileData.email,
        location: profileData.location
      };
      const updated = await updateProfileRequest(profileData.id, payload);
      setProfileData({
        name: updated.user_name,
        email: updated.email,
        location: updated.location
      });
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile. Check console.");
    }
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
          {["Profile","Crops","Location","Messages"].map(name => (
            <button
              key={name}
              className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg ${activeSection === name ? "text-orange-500 bg-white bg-opacity-10" : "text-white hover:bg-white hover:bg-opacity-5"}`}
              onClick={() => setActiveSection(name)}
            >
              {name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45]">
          <p className="text-sm opacity-75 mb-3">Logged in as Buyer</p>
          <button onClick={logout} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition">
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto bg-white">
        {activeSection === "Profile" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">Welcome, {profileData.name}!</h1>
              {isEditingProfile ? (
                <button onClick={handleProfileSave} className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center">
                  <FiSave className="mr-2" /> Save
                </button>
              ) : (
                <button onClick={() => setIsEditingProfile(true)} className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center">
                  <FiEdit className="mr-2" /> Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center"><FiUser className="mr-2"/>Full Name</label>
                  {isEditingProfile ? (
                    <input name="name" value={profileData.name} onChange={handleProfileChange} className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2]"/>
                  ) : <p>{profileData.name}</p>}
                </div>

                <div>
                  <label className="flex items-center"><FiMail className="mr-2"/>Email</label>
                  {isEditingProfile ? (
                    <input name="email" value={profileData.email} onChange={handleProfileChange} className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2]"/>
                  ) : <p>{profileData.email}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1d4c43]">Your Location</h2>
                <div className="h-64 w-full border rounded-lg overflow-hidden">
                  <FarmMap farms={[{ farmer_id: profileData.id, farmerName: profileData.name, lat: profileData.location.lat, lng: profileData.location.lng, locationUrl: `https://www.google.com/maps?q=${profileData.location.lat},${profileData.location.lng}`, crops: [] }]} height={256}/>
                </div>
                <div className="text-sm text-gray-600">Coordinates: {profileData.location.lat}, {profileData.location.lng}</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "Crops" && (
          <div className={cardClass}>
            <h1 className="text-3xl font-bold mb-4">Available Crops</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                <thead className="bg-[#1d4c43] text-white">
                  <tr>
                    <th>Name</th><th>Type</th><th>Qty</th><th>Price</th><th>Availability</th><th>Harvest</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrops.map(c => (
                    <tr key={c.crop_id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td>{c.crop_name}</td>
                      <td>{c.crop_type}</td>
                      <td>{c.quantity} kg</td>
                      <td>{c.price} TND/kg</td>
                      <td>{c.availability ? "Available" : "Unavailable"}</td>
                      <td>{new Date(c.harvest_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "Messages" && <div className={cardClass}><MessageList user={user} contacts={farmers} /></div>}
      </main>
    </div>
  );
}
