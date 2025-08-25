// src/pages/buyer/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FiUser, FiPackage, FiMapPin,
  FiCloud, FiMessageSquare
} from "react-icons/fi";
import { getAllCrops } from "../../api/cropApi";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import axios from "axios";
import FarmMap from "../../components/FarmMap";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSection, setActiveSection] = useState("Crops");
  const [crops, setCrops] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
    type: "",
    availability: "",
    harvestDate: "",
  });

  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

useEffect(() => {
    if (!user) return;
    axios.get(`http://localhost:8080/messages?recipientId=${user.id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [user]);

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

  // handle filters
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesName = crop.crop_name.toLowerCase().includes(filter.name.toLowerCase());
    const matchesType = filter.type ? crop.crop_type === filter.type : true;
    const matchesAvailability =
      filter.availability === ""
        ? true
        : crop.availability === (filter.availability === "true");
    const matchesHarvestDate =
      filter.harvestDate === ""
        ? true
        : new Date(crop.harvest_date) >= new Date(filter.harvestDate);

    return matchesName && matchesType && matchesAvailability && matchesHarvestDate;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4c43] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-[#1d4c43] p-1 rounded mr-2">🌿</span>
          AgroConnect
        </h2>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center mb-2 px-4 py-3 rounded-lg ${
              activeSection === item.name
                ? "bg-white text-[#1d4c43] font-semibold"
                : "hover:bg-[#2a5c45] text-gray-100"
            }`}
            onClick={() => setActiveSection(item.name)}
          >
            {item.icon}
            {item.name}
          </button>
        ))}

        <div className="mt-auto border-t border-[#2a5c45] pt-4 text-sm opacity-75">
          Logged in as Buyer
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === "Crops" && (
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Available Crops</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter crop name"
                  value={filter.name}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-2 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-2 py-2"
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
                <label className="block font-semibold mb-1">Availability</label>
                <select
                  name="availability"
                  value={filter.availability}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-2 py-2"
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Harvest Date From</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={filter.harvestDate}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded px-2 py-2"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
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
                  {filteredCrops.map((crop) => (
                    <tr key={crop.crop_id} className="border-t border-gray-200 hover:bg-gray-100">
                      <td className="py-2 px-4">{crop.crop_name}</td>
                      <td className="py-2 px-4">{crop.crop_type}</td>
                      <td className="py-2 px-4">{crop.quantity}</td>
                      <td className="py-2 px-4">${crop.price}</td>
                      <td className="py-2 px-4">{crop.availability ? "Available" : "Unavailable"}</td>
                      <td className="py-2 px-4">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

         {activeSection === "Messages" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <MessageList user={user} />
          </div>
        )}

          {activeSection === "Location" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Farms & Crops</h2>
            <FarmMap farms={farms} />

          </div>
        )}
        

      </main>
    </div>
  );
}
