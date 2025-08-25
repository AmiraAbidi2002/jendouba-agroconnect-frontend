import React, { useState, useEffect } from "react";
import { createCrop, updateCrop } from "../../api/cropApi";

export default function CropForm({ onSuccess, editingCrop }) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    harvestDate: "",
  });

  useEffect(() => {
    if (editingCrop) setFormData(editingCrop);
  }, [editingCrop]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCrop) {
      await updateCrop(editingCrop.id, formData);
    } else {
      await createCrop(formData);
    }
    setFormData({ name: "", quantity: "", price: "", harvestDate: "" });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} />
      <input type="number" name="quantity" placeholder="Quantité" value={formData.quantity} onChange={handleChange} />
      <input type="number" name="price" placeholder="Prix" value={formData.price} onChange={handleChange} />
      <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} />
      <button type="submit">{editingCrop ? "Modifier" : "Créer"}</button>
    </form>
  );
}
