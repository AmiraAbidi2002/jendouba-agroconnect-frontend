import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "axios";
export const API_URL = "https://jendouba-agroconnect-backend-1.onrender.com";

// Configure Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper function to retrieve JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Function to fetch crops for a specific farmer
const fetchFarmCrops = async (farmerId) => {
  try {
    const token = getToken();
    console.log(`Fetching crops for farmer ${farmerId}...`);
    const response = await axios.get(`${API_URL}/api/crops/farmer/${farmerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Crops fetched for farmer ${farmerId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crops for farmer ${farmerId}:`, error);
    // Return empty array if request fails
    return [];
  }
};

export default function FarmMap({ farms = [], height = 420 }) {
  const [selectedFarmCrops, setSelectedFarmCrops] = useState({});
  const [loadingCrops, setLoadingCrops] = useState({});

  // Set initial map center based on the first farm, or default location
  const center = useMemo(() => {
    return farms.length
      ? { lat: farms[0].lat || 36.5, lng: farms[0].lng || 8.8 }
      : { lat: 36.5, lng: 8.8 };
  }, [farms]);

  // Load crops for a specific farm when needed
  const loadFarmCrops = async (farm) => {
    const farmerId = farm.farmer_id;

    // Skip if crops are already loading or already loaded
    if (loadingCrops[farmerId] || selectedFarmCrops[farmerId]) {
      return;
    }

    // Mark as loading
    setLoadingCrops((prev) => ({ ...prev, [farmerId]: true }));

    try {
      const crops = await fetchFarmCrops(farmerId);
      setSelectedFarmCrops((prev) => ({
        ...prev,
        [farmerId]: crops,
      }));
    } catch (error) {
      console.error(`Failed to load crops for farmer ${farmerId}:`, error);
      // In case of error, set empty array to avoid infinite reload
      setSelectedFarmCrops((prev) => ({
        ...prev,
        [farmerId]: [],
      }));
    } finally {
      // Mark as not loading anymore
      setLoadingCrops((prev) => ({ ...prev, [farmerId]: false }));
    }
  };

  // Preload crops for all farms on component mount
  useEffect(() => {
    farms.forEach((farm) => {
      if (farm.farmer_id && !selectedFarmCrops[farm.farmer_id]) {
        loadFarmCrops(farm);
      }
    });
  }, [farms]);

  return (
    <div style={{ height }}>
      <MapContainer
        center={center}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {farms.map((f) => {
          const farmerId = f.farmer_id;
          const crops = selectedFarmCrops[farmerId] || [];
          const isLoading = loadingCrops[farmerId];

          return (
            <Marker
              key={farmerId}
              position={[f.lat, f.lng]}
              eventHandlers={{
                click: () => {
                  // Try to load crops when marker is clicked if not already loaded
                  if (!selectedFarmCrops[farmerId] && !isLoading) {
                    loadFarmCrops(f);
                  }
                },
              }}
            >
              <Popup minWidth={250} maxWidth={350}>
                <div className="space-y-2">
                  {/* Farmer details */}
                  <div className="font-bold text-green-700">{f.farmerName}</div>
                  <div className="text-sm text-gray-600">
                    Farmer ID: {farmerId}
                  </div>

                  {/* Google Maps link */}
                  {f.locationUrl && (
                    <a
                      href={f.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-sm block"
                    >
                      📍 Open in Google Maps
                    </a>
                  )}

                  {/* Crop section */}
                  <div className="mt-3 border-t pt-2">
                    <div className="font-semibold text-gray-800 mb-2">
                      🌾 Available Crops:
                    </div>

                    {isLoading ? (
                      // Loading state
                      <div className="text-sm text-gray-500 italic flex items-center gap-1">
                        <span className="animate-spin">⏳</span>
                        Loading crops...
                      </div>
                    ) : crops.length === 0 ? (
                      // No crops
                      <div className="text-sm text-gray-500 italic">
                        No crops available
                      </div>
                    ) : (
                      <>
                        {/* Display first 5 crops */}
                        {crops.slice(0, 5).map((c) => (
                          <div
                            key={c.crop_id}
                            className="text-sm mb-1 p-1 bg-gray-50 rounded"
                          >
                            <div className="font-medium text-green-600">
                              🌱 {c.crop_name} ({c.crop_type})
                            </div>
                            <div className="text-xs text-gray-600">
                              📦 {c.quantity} kg • 💰 {c.price} TND
                              {c.availability === false && (
                                <span className="text-red-500 ml-1">
                                  • ❌ Not Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Show message if more than 5 crops */}
                        {crops.length > 5 && (
                          <div className="text-xs text-gray-500 italic mt-2 p-1 bg-yellow-50 rounded">
                            📋 And {crops.length - 5} more crop
                            {crops.length - 5 > 1 ? "s" : ""}
                          </div>
                        )}

                        {/* Total number of crops */}
                        <div className="text-xs text-green-600 mt-2 font-medium">
                          📊 Total: {crops.length} crop
                          {crops.length > 1 ? "s" : ""}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
