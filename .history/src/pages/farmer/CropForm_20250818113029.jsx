import React, { useState, useEffect } from "react";
import { createCrop, updateCrop } from "../../api/cropApi";

const CROP_TYPES = [
  "food crops",
  "forage crops",
  "fiber crops",
  "oil crops",
  "ornamental crops",
  "industrial crops",
];

export default function CropForm({ onSuccess, editingCrop }) {
  const [formData, setFormData] = useState({
    crop_name: "",
    crop_type: "food crops",
    quantity: 0,
    price: 0,
    harvest_date: "",
    availability: true,
    image_url: "",
  });

  useEffect(() => {
    if (editingCrop) {
      setFormData({
        crop_name: editingCrop.crop_name || "",
        crop_type: editingCrop.crop_type || "food crops",
        quantity: editingCrop.quantity || 0,
        price: editingCrop.price || 0,
        harvest_date: editingCrop.harvest_date || "",
        availability: editingCrop.availability ?? true,
        image_url: editingCrop.image_url || "",
      });
    }
  }, [editingCrop]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await updateCrop(editingCrop.crop_id, formData);
      } else {
        await createCrop(formData);
      }
      setFormData({
        crop_name: "",
        crop_type: "food crops",
        quantity: 0,
        price: 0,
        harvest_date: "",
        availability: true,
        image_url: "",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement du crop");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">
        {editingCrop ? "Modifier un crop" : "Créer un nouveau crop"}
      </h2>

      <div>
        <label className="block font-medium mb-1">Nom du crop</label>
        <input
          type="text"
          name="crop_name"
          placeholder="Nom"
          value={formData.crop_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Type de crop</label>
        <select
          name="crop_type"
          value={formData.crop_type}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        >
          {CROP_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Quantité</label>
        <input
          type="number"
          name="quantity"
          placeholder="Quantité"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Prix</label>
        <input
          type="number"
          name="price"
          placeholder="Prix"
          value={formData.price}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Date de récolte</label>
        <input
          type="date"
          name="harvest_date"
          value={formData.harvest_date}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="availability"
          checked={formData.availability}
          onChange={handleChange}
          id="availability"
        />
        <label htmlFor="availability" className="font-medium">
          Disponible
        </label>
      </div>

      <div>
        <label className="block font-medium mb-1">URL de l'image</label>
        <input
          type="text"
          name="image_url"
          placeholder="URL de l'image"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
      >
        {editingCrop ? "Modifier" : "Créer"}
      </button>
    </form>
  );
}
