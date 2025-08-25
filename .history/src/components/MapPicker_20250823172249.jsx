import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// fix des icônes Leaflet en bundler
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
};

export default function MapPicker({
  center = { lat: 36.5, lng: 8.8 }, // Jendouba par défaut
  zoom = 10,
  onChange
}) {
  const [pos, setPos] = useState(center);

  const handlePick = useCallback((latlng) => {
    const p = { lat: latlng.lat, lng: latlng.lng };
    setPos(p);
    const url = `https://www.google.com/maps?q=${p.lat},${p.lng}`;
    onChange?.(url, p.lat, p.lng);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Cliquez sur la carte pour définir la position de la ferme.
      </div>
      <div style={{ height: 300, width: "100%" }}>
        <MapContainer center={pos} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <Marker position={pos} />
        </MapContainer>
      </div>
      <div className="text-xs">
        <strong>URL enregistrée :</strong>{" "}
        <code>{`https://www.google.com/maps?q=${pos.lat},${pos.lng}`}</code>
      </div>
    </div>
  );
}
