import React, { useEffect, useState } from "react";
import { getAllCrops } from "../../api/cropApi";

export default function BuyerDashboard() {
  const [crops, setCrops] = useState([]);
  const [filter, setFilter] = useState({
    name: "",
    type: "",
    availability: "",
    harvestDate: "",
  });

  useEffect(() => {
    async function fetchCrops() {
      const data = await getAllCrops();
      setCrops(data);
    }
    fetchCrops();
  }, []);

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
      filter.harvestDate === "" ? true : new Date(crop.harvest_date) >= new Date(filter.harvestDate);

    return matchesName && matchesType && matchesAvailability && matchesHarvestDate;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buyer Dashboard</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Crop Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter crop name"
            value={filter.name}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Crop Type</label>
          <select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All types</option>
            <option value="food crops">Food Crops</option>
            <option value="forage crops">Forage Crops</option>
            <option value="fiber crops">Fiber Crops</option>
            <option value="oil crops">Oil Crops</option>
            <option value="ornamental crops">Ornamental Crops</option>
            <option value="industrial crops">Industrial Crops</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Availability</label>
          <select
            name="availability"
            value={filter.availability}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Harvest Date From</label>
          <input
            type="date"
            name="harvestDate"
            value={filter.harvestDate}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Crops Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Quantity</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Availability</th>
              <th className="py-2 px-4">Harvest Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrops.map((crop) => (
              <tr key={crop.crop_id} className="text-center border-t border-gray-200 hover:bg-gray-100">
                <td className="py-2 px-4">{crop.crop_id}</td>
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
  );
}
