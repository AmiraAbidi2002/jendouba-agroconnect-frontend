import React from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export default function FarmMap({ farms }) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: "TA_CLE_GOOGLE_MAPS_ICI" });

  if (!isLoaded) return <p>Loading map...</p>;

  // Si aucun farm, centrer sur valeur par défaut
  const center = farms.length > 0 
    ? { lat: parseFloat(farms[0].lat), lng: parseFloat(farms[0].lng) } 
    : { lat: 36.5, lng: 8.8 };

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      {farms.map((farm) => (
        <Marker
          key={farm.id}
          position={{ lat: parseFloat(farm.lat), lng: parseFloat(farm.lng) }}
          title={farm.name}
        />
      ))}
    </GoogleMap>
  );
}
