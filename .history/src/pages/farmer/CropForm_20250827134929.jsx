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

export default function CropForm({ editingCrop, onSuccess, onCancel }) {
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
        harvest_date: editingCrop.harvest_date
          ? new Date(editingCrop.harvest_date).toISOString().split("T")[0]
          : "",
        availability: editingCrop.availability ?? true,
        image: null,
      });
    }
  }, [editingCrop]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") setFormData({ ...formData, [name]: checked });
    else if (type === "file") setFormData({ ...formData, image: files[0] });
    else if (type === "number") setFormData({ ...formData, [name]: value ? parseFloat(value) : "" });
    else setFormData({ ...formData, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const todayStr = new Date().toISOString().split("T")[0];

    if (!formData.crop_name.trim()) newErrors.crop_name = "Crop name is required";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity must be > 0";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be > 0";
    if (!formData.harvest_date) newErrors.harvest_date = "Harvest date is required";
    else if (formData.harvest_date < todayStr)
      newErrors.harvest_date = "Harvest date cannot be in the past";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "availability") data.append(key, value ? "true" : "false");
      else if (key === "quantity" && value != null) data.append("quantity", value.toString());
      else if (key === "price" && value != null) data.append("price", value.toString());
      else if (value !== null) data.append(key, value);
    });

    if (editingCrop) {
      await updateCrop(editingCrop.crop_id, data);
    } else {
      await createCrop(data);
    }

    // Reset form
    setFormData({
      crop_name: "",
      crop_type: "food crops",
      quantity: "",
      price: "",
      harvest_date: "",
      availability: true,
      image: null,
    });

    onSuccess();
  } catch (error) {
    console.error("Submission error:", error);
    alert(error.message || "Error while saving crop. Check console for details.");
  } finally {
    setIsSubmitting(false);
  }
};
  
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
      encType="multipart/form-data"
    >
      <h2 className="text-xl font-semibold mb-4">
        {editingCrop ? "Edit Crop" : "Create New Crop"}
      </h2>

      <div>
        <label htmlFor="crop_name" className="block font-medium mb-1">Crop Name *</label>
        <input
          type="text"
          id="crop_name"
          name="crop_name"
          value={formData.crop_name}
          onChange={handleChange}
          className={`w-full border ${errors.crop_name ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.crop_name && <p className="text-red-500 text-sm">{errors.crop_name}</p>}
      </div>

      <div>
        <label htmlFor="crop_type" className="block font-medium mb-1">Crop Type *</label>
        <select
          id="crop_type"
          name="crop_type"
          value={formData.crop_type}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        >
          {CROP_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quantity" className="block font-medium mb-1">Quantity (KG) *</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block font-medium mb-1">Price (TND) *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="harvest_date" className="block font-medium mb-1">Harvest Date *</label>
        <input
          type="date"
          id="harvest_date"
          name="harvest_date"
          value={formData.harvest_date}
          onChange={handleChange}
          className={`w-full border ${errors.harvest_date ? 'border-red-500' : 'border-gray-300'} p-2 rounded`}
        />
        {errors.harvest_date && <p className="text-red-500 text-sm">{errors.harvest_date}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="availability"
          name="availability"
          checked={formData.availability}
          onChange={handleChange}
        />
        <label htmlFor="availability">Available</label>
      </div>

      <div>
        <label htmlFor="image" className="block font-medium mb-1">Crop Image</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white p-2 rounded`}
        >
          {isSubmitting ? "Processing..." : editingCrop ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
