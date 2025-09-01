import React, { useState, useEffect, useMemo } from "react";
import { FiUser, FiPackage, FiMapPin, FiCloud, FiMessageSquare, FiTrendingUp, FiBarChart2, FiCalendar } from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, deleteCrop } from "../../api/cropApi";
import { getMyFarm, getAllFarms } from "../../api/farmApi";
import axios from "axios";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Overview");
  const [crops, setCrops] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAllFarms, setShowAllFarms] = useState(false);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [mineFarm, setMineFarm] = useState(null);

  // Display the JWT in the console for debugging
  useEffect(() => {
    console.log("JWT:", user?.token);
  }, [user]);

  // Recover My Farm
  useEffect(() => {
     if (!user || !user.token) {
    console.log("User not yet ready => no API call");
    return;}

    const fetchFarm = async () => {
      try {
        console.log("JWT:", user.token);
        const data = await getMyFarm(user.token);
        setMineFarm(data);
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };

    fetchFarm();
  }, [user]);

  // Recover all the farms
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

  // Recover crops
  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection]);

  const fetchCrops = async () => {
    try {
      const userId = Number(user?.id ?? user?.sub);
      if (!userId) return;
      const data = await getCropsByFarmer(userId);
      setCrops(data);
    } catch (error) {
      console.error("Error fetch crops:", error);
    }
  };

  // Recover all crops
  useEffect(() => {
    axios.get("http://localhost:8080/api/crops")
      .then(res => setAllCrops(res.data))
      .catch(err => console.error(err));
  }, []);

  // Recover all buyers
  useEffect(() => {
    axios.get("http://localhost:8080/users?type=BUYER")
      .then(res => setBuyers(res.data))
      .catch(err => console.error(err));
  }, []);

  const farmsToShow = useMemo(() => {
    if (showAllFarms) return farms;
    return mineFarm ? [mineFarm] : [];
  }, [showAllFarms, farms, mineFarm]);

  if (!user || user.role !== "FARMER") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access denied</h2>
          <p>You must be a farmer to access this page.</p>
          <p className="text-sm text-gray-600 mt-2">Role detected: {user?.role || "Not connected"}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
                Return to home
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (crop) => { setEditingCrop(crop); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this crop?")) {
      try { await deleteCrop(id); fetchCrops(); } 
      catch (error) { console.error("Error deletion crop:", error); }
    }
  };
  const handleFormSuccess = () => { setShowForm(false); setEditingCrop(null); fetchCrops(); };

  const menuItems = [
    { name: "Overview", icon: <FiBarChart2 className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  const cardClass = "bg-white rounded-xl shadow-md p-6 mb-6 text-gray-900 border border-gray-200";

  // Données factices pour les cartes de progression (inspirées par YourLand)
  const progressData = [
    { title: "Wheat", value: "1.4", unit: "Ton", growth: "45%", growthColor: "text-green-500" },
    { title: "Corn", value: "2.0", unit: "Ton", growth: "55%", growthColor: "text-green-500" },
    { title: "Tomatoes", value: "3.0", unit: "Ton", growth: "51%", growthColor: "text-green-500" },
    { title: "Potatoes", value: "4.0", unit: "Ton", growth: "52%", growthColor: "text-green-500" },
  ];

  // Données factices pour l'analyse prédictive
  const analyticsData = [
    { title: "Predictive analysis", values: ["15%", "10%", "5%", "3%"] },
    { title: "Yield forecast", values: ["6%", "25%", "30%"] },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌱</span> AgroConnect
        </h2>
        <nav className="flex-1">
          {menuItems.map(item => (
            <button
              key={item.name}
              className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-all ${activeSection === item.name ? "bg-white text-[#1d4c43] font-semibold shadow-md" : "hover:bg-[#2a5c45] text-gray-100"}`}
              onClick={() => setActiveSection(item.name)}
            >
              {item.icon}{item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-[#2a5c45] text-sm opacity-75">Logged in as Farmer</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-white">
        {/* Overview Section - Inspirée par YourLand */}
        {activeSection === "Overview" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Farm Overview</h1>
            
            {/* Progress Cards - Inspirées par YourLand */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {progressData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{item.title}</h3>
                    <span className={`text-sm font-medium ${item.growthColor}`}>{item.growth} Growth</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                    <span className="text-sm text-gray-500 ml-1 mb-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Section - Inspirée par YourLand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Predictive Analysis</h3>
                <div className="space-y-3">
                  {analyticsData[0].values.map((value, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FiTrendingUp className="text-blue-500" />
                      </div>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield Forecast</h3>
                <div className="space-y-3">
                  {analyticsData[1].values.map((value, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FiBarChart2 className="text-green-500" />
                      </div>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Section - Inspirée par YourLand */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[12, 13, 14, 15].map(day => (
                  <div key={day} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">{day} September</span>
                      <FiCalendar className="text-blue-500" />
                    </div>
                    <div className="text-xs text-blue-600">Spraying day</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <WeatherWidget />
            </div>
          </div>
        )}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{showAllCrops ? "All Crops" : "My Crops"}</h1>
              <div className="flex space-x-2">
                <button
                  className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                  onClick={() => setShowAllCrops(!showAllCrops)}
                >
                  {showAllCrops ? "Show My Crops" : "Show All Crops"}
                </button>
                {!showAllCrops && (
                  <button
                    className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                    onClick={() => { setEditingCrop(null); setShowForm(true); }}
                  >
                    Add New Crop
                  </button>
                )}
              </div>
            </div>

            {(showAllCrops ? allCrops : crops).length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead className="bg-[#1d4c43] text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Harvest Date</th>
                      {!showAllCrops && <th className="py-3 px-4 text-left">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllCrops ? allCrops : crops).map(crop => (
                      <tr key={crop.crop_id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{crop.crop_name}</td>
                        <td className="py-3 px-4">{crop.crop_type}</td>
                        <td className="py-3 px-4">{crop.quantity} kg</td>
                        <td className="py-3 px-4">{crop.price} TND/kg</td>
                        <td className="py-3 px-4">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                        {!showAllCrops && (
                          <td className="py-3 px-4 flex space-x-2">
                            <button className="text-[#1d4c43] hover:text-[#2a5c45]" onClick={() => handleEdit(crop)}>Edit</button>
                            <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(crop.crop_id)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No crops available.</div>
            )}

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative border border-gray-200">
                  <button onClick={() => { setShowForm(false); setEditingCrop(null); }} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
                  <CropForm editingCrop={editingCrop} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditingCrop(null); }} />
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{showAllFarms ? "All Farms" : "My Farm Location"}</h2>
              <button
                className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                onClick={() => setShowAllFarms(!showAllFarms)}
              >
                {showAllFarms ? "Show Only My Farm" : "Show All Farms"}
              </button>
            </div>
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