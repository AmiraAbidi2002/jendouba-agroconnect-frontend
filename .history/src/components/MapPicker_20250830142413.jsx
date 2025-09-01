import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix for Leaflet icons not displaying correctly in bundlers (like Webpack/Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Override Leaflet’s default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Component that listens for map clicks and sends the coordinates back
 */
const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
};

/**
 * MapPicker Component
 * Allows user to select a location on the map and generates a Google Maps link.
 * - Default center is Jendouba, Tunisia
 * - Fully mobile-responsive
 */
export default function MapPicker({
  center = { lat: 36.5, lng: 8.8 }, // Default map center
  zoom = 10,
  onChange,
}) {
  const [pos, setPos] = useState(center);

  /**
   * Handle when user clicks on the map:
   * - Update position state
   * - Generate Google Maps URL
   * - Pass data back to parent via onChange callback
   */
  const handlePick = useCallback(
    (latlng) => {
      const p = { lat: latlng.lat, lng: latlng.lng };
      setPos(p);
      const url = `https://www.google.com/maps?q=${p.lat},${p.lng}`;
      onChange?.(url, p.lat, p.lng);
    },
    [onChange]
  );

  return (
    <div className="space-y-3 w-full">
      {/* Instruction text */}
      <div className="text-sm text-gray-700 text-center sm:text-left">
        Click on the map to set the farm location.
      </div>

      {/* Map container - responsive height */}
      <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-md">
        <MapContainer
          center={pos}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <Marker position={pos} />
        </MapContainer>
      </div>

      {/* Display saved URL */}
      <div className="text-xs sm:text-sm text-gray-800 break-words">
        <strong>Saved URL:</strong>{" "}
        <code className="bg-gray-100 px-1 rounded">
          https://www.google.com/maps?q={pos.lat},{pos.lng}
        </code>
      </div>
    </div>
  );
}
