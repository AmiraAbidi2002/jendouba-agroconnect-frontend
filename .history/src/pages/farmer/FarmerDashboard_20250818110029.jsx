import React, { useEffect, useState } from "react";
import { getAllCrops, deleteCrop } from "../../api/cropApi.js";
import CropForm from "./CropForm.js";

export default function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);

  const fetchCrops = async () => {
    const data = await getAllCrops();
    setCrops(data);
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    await deleteCrop(id);
    fetchCrops();
  };

  return (
    <div>
      <h1>Farmer Dashboard</h1>
      <CropForm onSuccess={fetchCrops} editingCrop={editingCrop} />
      <ul>
        {crops.map((crop) => (
          <li key={crop.id}>
            {crop.name} - {crop.quantity} unités - {crop.price} DT
            <button onClick={() => setEditingCrop(crop)}>Modifier</button>
            <button onClick={() => handleDelete(crop.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
