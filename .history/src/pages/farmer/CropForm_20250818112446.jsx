import React, { useState, useEffect } from "react";
import { createCrop, updateCrop } from "../../api/cropApi";

export default function CropForm({ onSuccess, editingCrop }) {
  const [formData, setFormData] = useState({
    crop_name: "",
    crop_type: "",
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
        crop_type: editingCrop.crop_type || "",
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
        crop_type: "",
        quantity: 0,
        price: 0,
        harvest_date: "",
        availability: true,
        image_url: "",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error saving crop");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="crop_name"
        placeholder="Name"
        value={formData.crop_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="crop_type"
        placeholder="Type"
        value={formData.crop_type}
        onChange={handleChange}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Prix"
        value={formData.price}
        onChange={handleChange}
      />
      <input
        type="date"
        name="harvest_date"
        value={formData.harvest_date}
        onChange={handleChange}
      />
      <label>
        availability
        <input
          type="checkbox"
          name="availability"
          checked={formData.availability}
          onChange={handleChange}
        />
      </label>
      <input
        type="text"
        name="image_url"
        placeholder="URL de l'image"
        value={formData.image_url}
        onChange={handleChange}
      />
      <button type="submit">{editingCrop ? "Modifier" : "Create"}</button>
    </form>
  );
}
