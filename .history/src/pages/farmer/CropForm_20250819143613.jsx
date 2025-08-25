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
    image: null,
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
    }else if (type === "number") {
    setFormData({ ...formData, [name]: parseFloat(value) });} 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(formData.price<=0){
      alert("Price can not be null negative!");
      return;
    }

    if(formData.quantity<=0){
      alert("Quantity can not be negative or null");
      return;

    }

    try {
      const data = new FormData();
      data.append("crop_name", formData.crop_name);
      data.append("crop_type", formData.crop_type);
      data.append("quantity", formData.quantity);
      data.append("price", formData.price);
      data.append("harvest_date", formData.harvest_date);
      data.append("availability", formData.availability);
      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingCrop) {
        await updateCrop(editingCrop.crop_id, data);
      } else {
        await createCrop(data);
      }

      setFormData({
        crop_name: "",
        crop_type: "food crops",
        quantity: 0,
        price: 0,
        harvest_date: "",
        availability: true,
        image: null,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error while saving the crop");
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
        <label className="block font-medium mb-1">Crop Name</label>
        <input
          type="text"
          name="crop_name"
          placeholder="Enter crop name"
          value={formData.crop_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Crop Type</label>
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
        <label className="block font-medium mb-1">Quantity</label>
        <input
          type="number"
          name="quantity (KG)"
          min="1"
          placeholder="Enter quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Price</label>
        <input
          type="number"
          name="price (TND)"
          min="1"
          placeholder="Enter price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Harvest Date</label>
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
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
      >
        {editingCrop ? "Update" : "Create"}
      </button>
    </form>
  );
}
