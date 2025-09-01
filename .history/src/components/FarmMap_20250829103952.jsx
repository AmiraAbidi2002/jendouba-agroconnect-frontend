import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "axios";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getToken = () => localStorage.getItem("token");

// Fonction pour récupérer les crops d'une ferme spécifique
const fetchFarmCrops = async (farmerId) => {
  try {
    const token = getToken();
    const response = await axios.get(`http://localhost:8080/api/farms/${farmerId}/crops`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching farm crops:", error);
    return [];
  }
};

export default function FarmMap({ farms = [], height = 420 }) {
  const [selectedFarmCrops, setSelectedFarmCrops] = useState({});
  const center = useMemo(() => {
    return farms.length
      ? { lat: farms[0].lat || 36.5, lng: farms[0].lng || 8.8 }
      : { lat: 36.5, lng: 8.8 };
  }, [farms]);

  // Fonction pour charger les crops d'une ferme lorsqu'on clique sur le marker
  const handleMarkerClick = async (farm) => {
    // Si les crops de cette ferme n'ont pas encore été chargés
    if (!selectedFarmCrops[farm.farmer_id]) {
      const crops = await fetchFarmCrops(farm.farmer_id);
      setSelectedFarmCrops(prev => ({
        ...prev,
        [farm.farmer_id]: crops
      }));
    }
  };

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((f) => (
          <Marker 
            key={f.farmer_id} 
            position={[f.lat, f.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(f)
            }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{f.farmerName}</div>
                <a
                  href={f.locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Ouvrir dans Google Maps
                </a>
                <div className="mt-2">
                  <div className="font-semibold">Cultures:</div>
                  {(!selectedFarmCrops[f.farmer_id] || selectedFarmCrops[f.farmer_id].length === 0) && (
                    <div className="text-sm text-gray-500">Chargement des cultures...</div>
                  )}
                  {selectedFarmCrops[f.farmer_id]?.slice(0, 5).map((c) => (
                    <div key={c.crop_id} className="text-sm">
                      • {c.crop_name} ({c.crop_type}) — {c.quantity} kg @ {c.price} TND
                      {c.availability === false ? " (indisponible)" : ""}
                    </div>
                  ))}
                  {selectedFarmCrops[f.farmer_id] && selectedFarmCrops[f.farmer_id].length > 5 && (
                    <div className="text-xs text-gray-500">…et {selectedFarmCrops[f.farmer_id].length - 5} de plus</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}