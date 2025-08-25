import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Icône custom pour marker
const farmIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png", // exemple d'icône ferme
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function FarmMap({ farms }) {
  return (
    <MapContainer
      center={[36.5, 8.8]} // centre sur Jendouba
      zoom={10}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {farms.map((farm) => (
        <Marker
          key={farm.id}
          position={[farm.latitude, farm.longitude]}
          icon={farmIcon}
        >
          <Popup>
            <strong>{farm.farmer_name}</strong>
            <br />
            {farm.crops.map((c) => (
              <div key={c.crop_id}>
                {c.crop_name} - {c.quantity}kg
              </div>
            ))}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
