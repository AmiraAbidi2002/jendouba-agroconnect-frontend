import React, { useEffect, useState } from "react";
import { getAllCrops } from "../../api/cropApi";

export default function BuyerDashboard() {
  const [crops, setCrops] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function fetchCrops() {
      const data = await getAllCrops();
      setCrops(data);
    }
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1>Buyer Dashboard</h1>
      <input 
        type="text" 
        placeholder="Filtrer par nom" 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredCrops.map((crop) => (
          <li key={crop.id}>
            {crop.name} - {crop.quantity} unités - {crop.price} DT
          </li>
        ))}
      </ul>
    </div>
  );
}
