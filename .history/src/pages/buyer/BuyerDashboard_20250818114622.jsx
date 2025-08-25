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
      <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Filter by name"
          value={filter.name}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
        <select
          name="type"
          value={filter.type}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All types</option>
          <option value="food crops">Food Crops</option>
          <option value="forage crops">Forage Crops</option>
          <option value="fiber crops">Fiber Crops</option>
          <option value="oil crops">Oil Crops</option>
          <option value="ornamental crops">Ornamental Crops</option>
          <option value="industrial crops">Industrial Crops</option>
        </select>
        <select
          name="availability"
          value={filter.availability}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <input
          type="date"
          name="harvestDate"
          value={filter.harvestDate}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Crop list */}
      <ul>
        {filteredCrops.map((crop) => (
          <li key={crop.crop_id}>
            {crop.crop_name} - {crop.quantity} units - ${crop.price} - {crop.crop_type} -{" "}
            {crop.availability ? "Available" : "Unavailable"} -{" "}
            {new Date(crop.harvest_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
