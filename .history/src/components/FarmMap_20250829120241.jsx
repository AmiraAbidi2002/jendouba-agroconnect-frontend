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
    console.log(`Fetching crops for farmer ${farmerId}...`);
    const response = await axios.get(`http://localhost:8080/api/crops/farmer/${farmerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Crops fetched for farmer ${farmerId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching farm crops for farmer ${farmerId}:`, error);
    // Retourner un tableau vide si erreur
    return [];
  }
};

export default function FarmMap({ farms = [], height = 420 }) {
  const [selectedFarmCrops, setSelectedFarmCrops] = useState({});
  const [loadingCrops, setLoadingCrops] = useState({});

  const center = useMemo(() => {
    return farms.length
      ? { lat: farms[0].lat || 36.5, lng: farms[0].lng || 8.8 }
      : { lat: 36.5, lng: 8.8 };
  }, [farms]);

  // Fonction pour charger les crops d'une ferme
  const loadFarmCrops = async (farm) => {
    const farmerId = farm.farmer_id;
    
    // Si déjà en cours de chargement ou déjà chargé, ne pas refaire la requête
    if (loadingCrops[farmerId] || selectedFarmCrops[farmerId]) {
      return;
    }

    // Marquer comme en cours de chargement
    setLoadingCrops(prev => ({ ...prev, [farmerId]: true }));

    try {
      const crops = await fetchFarmCrops(farmerId);
      setSelectedFarmCrops(prev => ({
        ...prev,
        [farmerId]: crops
      }));
    } catch (error) {
      console.error(`Failed to load crops for farmer ${farmerId}:`, error);
      // En cas d'erreur, mettre un tableau vide pour éviter le rechargement infini
      setSelectedFarmCrops(prev => ({
        ...prev,
        [farmerId]: []
      }));
    } finally {
      // Arrêter le loading
      setLoadingCrops(prev => ({ ...prev, [farmerId]: false }));
    }
  };

  // Précharger les crops pour toutes les fermes au montage du composant
  useEffect(() => {
    farms.forEach(farm => {
      if (farm.farmer_id && !selectedFarmCrops[farm.farmer_id]) {
        loadFarmCrops(farm);
      }
    });
  }, [farms]);

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }}>
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
                  // Essayer de charger les crops si pas encore fait
                  if (!selectedFarmCrops[farmerId] && !isLoading) {
                    loadFarmCrops(f);
                  }
                }
              }}
            >
              <Popup minWidth={250} maxWidth={350}>
                <div className="space-y-2">
                  <div className="font-bold text-green-700">{f.farmerName}</div>
                  <div className="text-sm text-gray-600">
                    Farmer ID: {farmerId}
                  </div>
                  
                  {f.locationUrl && (
                    <a
                      href={f.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-sm block"
                    >
                      📍 Ouvrir dans Google Maps
                    </a>
                  )}
                  
                  <div className="mt-3 border-t pt-2">
                    <div className="font-semibold text-gray-800 mb-2">🌾 Cultures disponibles:</div>
                    
                    {isLoading ? (
                      <div className="text-sm text-gray-500 italic flex items-center gap-1">
                        <span className="animate-spin">⏳</span>
                        Chargement des cultures...
                      </div>
                    ) : crops.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">
                        Aucune culture disponible
                      </div>
                    ) : (
                      <>
                        {crops.slice(0, 5).map((c) => (
                          <div key={c.crop_id} className="text-sm mb-1 p-1 bg-gray-50 rounded">
                            <div className="font-medium text-green-600">
                              🌱 {c.crop_name} ({c.crop_type})
                            </div>
                            <div className="text-xs text-gray-600">
                              📦 {c.quantity} kg • 💰 {c.price} TND
                              {c.availability === false && (
                                <span className="text-red-500 ml-1">• ❌ Indisponible</span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {crops.length > 5 && (
                          <div className="text-xs text-gray-500 italic mt-2 p-1 bg-yellow-50 rounded">
                            📋 Et {crops.length - 5} autre{crops.length - 5 > 1 ? 's' : ''} culture{crops.length - 5 > 1 ? 's' : ''}
                          </div>
                        )}
                        
                        <div className="text-xs text-green-600 mt-2 font-medium">
                          📊 Total: {crops.length} culture{crops.length > 1 ? 's' : ''}
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