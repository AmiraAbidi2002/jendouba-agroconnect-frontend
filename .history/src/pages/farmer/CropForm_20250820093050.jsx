import React, { useState, useEffect } from "react";
import { createCrop, updateCrop } from "../api/cropApi";

const CROP_TYPES = ["food crops","forage crops","fiber crops","oil crops","ornamental crops","industrial crops"];

export default function CropForm({ editingCrop, onSuccess }) {
  const [form,setForm] = useState({crop_name:"",crop_type:"food crops",quantity:0,price:0,harvest_date:"",availability:true});
  useEffect(()=>{ if(editingCrop) setForm({...editingCrop}); },[editingCrop]);

  const handleChange=e=>setForm({...form,[e.target.name]:e.target.type==="checkbox"?e.target.checked:e.target.value});

  const handleSubmit=async e=>{
    e.preventDefault();
    try{
      if(editingCrop) await updateCrop(editingCrop.crop_id,form);
      else await createCrop(form);
      setForm({crop_name:"",crop_type:"food crops",quantity:0,price:0,harvest_date:"",availability:true});
      onSuccess();
    }catch(err){console.error(err); alert("Error saving crop");}
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-2">
      <input name="crop_name" value={form.crop_name} onChange={handleChange} placeholder="Name" className="border p-1 w-full"/>
      <select name="crop_type" value={form.crop_type} onChange={handleChange} className="border p-1 w-full">
        {CROP_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="border p-1 w-full"/>
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="border p-1 w-full"/>
      <input name="harvest_date" type="date" value={form.harvest_date} onChange={handleChange} className="border p-1 w-full"/>
      <label className="flex items-center space-x-2"><input name="availability" type="checkbox" checked={form.availability} onChange={handleChange}/> Available</label>
      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
    </form>
  );
}
