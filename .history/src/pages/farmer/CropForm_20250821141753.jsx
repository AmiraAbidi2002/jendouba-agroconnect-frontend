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
    quantity: "",
    price: "",
    harvest_date: "",
    availability: true,
    image: null,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCrop) {
      setFormData({
        crop_name: editingCrop.crop_name || "",
        crop_type: editingCrop.crop_type || "food crops",
        quantity: editingCrop.quantity || "",
        price: editingCrop.price || "",
        harvest_date: editingCrop.harvest_date ? editingCrop.harvest_date.split('T')[0] : "",
        availability: editingCrop.availability ?? true,
        image: null,
      });
    }
  }, [editingCrop]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Effacer l'erreur du champ lorsqu'il est modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.crop_name.trim()) {
      newErrors.crop_name = "Crop name is required";
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    if (!formData.harvest_date) {
      newErrors.harvest_date = "Harvest date is required";
    } else {
      const selectedDate = new Date(formData.harvest_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.harvest_date = "Harvest date cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("crop_name", formData.crop_name.trim());
      data.append("crop_type", formData.crop_type);
      data.append("quantity", formData.quantity.toString());
      data.append("price", formData.price.toString());
      // Convertir la date en string au format YYYY-MM-DD
     data.append("harvest_date", formData.harvest_date);
      
      data.append("availability", formData.availability.toString());
      
      if (formData.image) {
        data.append("image", formData.image);
      }

      // Debug: afficher le contenu de FormData
      console.log("FormData content:");
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      if (editingCrop) {
        await updateCrop(editingCrop.crop_id, data);
      } else {
        await createCrop(data);
      }

      setFormData({
        crop_name: "",
        crop_type: "food crops",
        quantity: "",
        price: "",
        harvest_date: "",
        availability: true,
        image: null,
      });
      
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error("Error saving crop:", error);
      alert(error.message || "Error while saving the crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4"
      encType="multipart/form-data"
    >
      <h2 className="text-xl font-semibold mb-4">
        {editingCrop ? "Edit Crop" : "Create New Crop"}
      </h2>

      <div>
        <label className="block font-medium mb-1">Crop Name *</label>
        <input
          type="text"
          name="crop_name"
          placeholder="Enter crop name"
          value={formData.crop_name}
          onChange={handleChange}
          className={`w-full border ${errors.crop_name ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.crop_name && <p className="text-red-500 text-sm mt-1">{errors.crop_name}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Crop Type *</label>
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
        <label className="block font-medium mb-1">Quantity (KG) *</label>
        <input
          type="number"
          name="quantity"
          min="0.1"
          step="0.1"
          placeholder="Enter quantity"
          value={formData.quantity}
          onChange={handleChange}
          className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Price (TND) *</label>
        <input
          type="number"
          name="price"
          min="0.01"
          step="0.01"
          placeholder="Enter price"
          value={formData.price}
          onChange={handleChange}
          className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Harvest Date *</label>
        <input
          type="date"
          name="harvest_date"
          value={formData.harvest_date}
          onChange={handleChange}
          className={`w-full border ${errors.harvest_date ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.harvest_date && <p className="text-red-500 text-sm mt-1">{errors.harvest_date}</p>}
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
          Available
        </label>
      </div>

      <div>
        <label className="block font-medium mb-1">Crop Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white p-2 rounded transition`}
      >
        {isSubmitting ? "Processing..." : (editingCrop ? "Update" : "Create")}
      </button>
    </form>
  );
}