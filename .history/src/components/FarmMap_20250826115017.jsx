import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default function FarmMap({ farms = [], height = 420 }) {
  const center = useMemo(() => {
    //  Jendouba
    return farms.length
      ? { lat: farms[0].lat || 36.5, lng: farms[0].lng || 8.8 }
      : { lat: 36.5, lng: 8.8 };
  }, [farms]);

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((f) => (
          <Marker key={f.farmer_id} position={[f.lat || 0, f.lng || 0]}>
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{f.farmerName}</div>
                <a
                  href={f.locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  open dans Google Maps
                </a>
                <div className="mt-2">
                  <div className="font-semibold">Crops:</div>
                  {(!f.crops || f.crops.length === 0) && (
                    <div className="text-sm text-gray-500">Aucun crop</div>
                  )}
                  {f.crops?.slice(0, 5).map((c) => (
                    <div key={c.crop_id} className="text-sm">
                      • {c.crop_name} ({c.crop_type}) — {c.quantity} kg @ {c.price} TND
                      {c.availability === false ? " (indisponible)" : ""}
                    </div>
                  ))}
                  {f.crops && f.crops.length > 5 && (
                    <div className="text-xs text-gray-500">…et plus</div>
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
