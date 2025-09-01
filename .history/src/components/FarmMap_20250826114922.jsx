// src/components/FarmMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix pour icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function FarmMap({ farms = [], height = 420 }) {
  const center = useMemo(() => {
    if (!farms.length) return { lat: 36.5, lng: 8.8 }; // Default: Jendouba
    // Centrer sur la première ferme si plusieurs
    return { lat: farms[0].lat || 36.5, lng: farms[0].lng || 8.8 };
  }, [farms]);

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((farm, idx) => (
          <Marker
            key={farm.farmer_id || idx}
            position={[farm.lat || 0, farm.lng || 0]}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{farm.farmerName || "Unknown Farmer"}</div>
                {farm.locationUrl && (
                  <a
                    href={farm.locationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open in Google Maps
                  </a>
                )}
                {farm.crops && farm.crops.length > 0 ? (
                  <div className="mt-2">
                    <div className="font-semibold">Crops:</div>
                    {farm.crops.slice(0, 5).map((c) => (
                      <div key={c.crop_id} className="text-sm">
                        • {c.crop_name} ({c.crop_type}) — {c.quantity} kg @ {c.price} TND
                        {c.availability === false ? " (unavailable)" : ""}
                      </div>
                    ))}
                    {farm.crops.length > 5 && (
                      <div className="text-xs text-gray-500">…et plus</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2">No crops</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
