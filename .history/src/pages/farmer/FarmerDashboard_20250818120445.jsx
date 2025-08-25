import React, { useState, useEffect } from "react";
import CropForm from "./CropForm"; // ton formulaire de création
import { getAllCrops, deleteCrop } from "../../api/cropApi";

export default function FarmerDashboard() {
  const [activeSection, setActiveSection] = useState("Crops");
  const [crops, setCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // récupérer les crops du farmer
  const fetchCrops = async () => {
    const data = await getAllCrops(); // tu peux filtrer par farmer_id si besoin backend
    setCrops(data);
  };

  useEffect(() => {
    if (activeSection === "Crops") {
      fetchCrops();
    }
  }, [activeSection]);

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      await deleteCrop(id);
      fetchCrops();
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">YourFarm</h2>
        {["Profile", "Crops", "Farm Location", "Weather Forecast", "Messages"].map((section) => (
          <button
            key={section}
            className={`mb-4 text-left px-3 py-2 rounded hover:bg-green-700 ${
              activeSection === section ? "bg-green-700 font-semibold" : ""
            }`}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeSection === "Crops" && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Crops</h1>
            
            {/* Bouton pour créer un crop */}
            <button
              className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-500"
              onClick={() => setShowForm(true)}
            >
              {editingCrop ? "Edit Crop" : "Add New Crop"}
            </button>

            {/* Formulaire */}
            {showForm && (
              <div className="mb-6 p-4 bg-white rounded shadow">
                <CropForm editingCrop={editingCrop} onSuccess={handleFormSuccess} />
              </div>
            )}

            {/* Liste des crops */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="py-2 px-4">ID</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Price</th>
                    <th className="py-2 px-4">Availability</th>
                    <th className="py-2 px-4">Harvest Date</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop) => (
                    <tr key={crop.crop_id} className="text-center border-t border-gray-200 hover:bg-gray-100">
                      <td className="py-2 px-4">{crop.crop_id}</td>
                      <td className="py-2 px-4">{crop.crop_name}</td>
                      <td className="py-2 px-4">{crop.crop_type}</td>
                      <td className="py-2 px-4">{crop.quantity}</td>
                      <td className="py-2 px-4">${crop.price}</td>
                      <td className="py-2 px-4">{crop.availability ? "Available" : "Unavailable"}</td>
                      <td className="py-2 px-4">{new Date(crop.harvest_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 flex justify-center gap-2">
                        <button
                          className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-300"
                          onClick={() => handleEdit(crop)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400"
                          onClick={() => handleDelete(crop.crop_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder pour les autres sections */}
        {activeSection !== "Crops" && (
          <div className="text-gray-700 text-xl">Section "{activeSection}" will be implemented soon.</div>
        )}
      </main>
    </div>
  );
}
