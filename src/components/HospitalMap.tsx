"use client";

import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { useState, useCallback, useMemo } from "react";
import { useEmergencyStore } from "@/store/useEmergencyStore";
import { useTheme } from "next-themes";

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '2rem',
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#061716" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#061716" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#2d5a57" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4ebfb6" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4ebfb6" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#062b29" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2d5a57" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#0d312f" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#061716" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4ebfb6" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#144a47" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#061716" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4ebfb6" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#04100f" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2d5a57" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#04100f" }],
  },
];

export default function HospitalMap() {
  const { result, location } = useEmergencyStore();
  const { theme } = useTheme();
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    styles: theme === "dark" ? darkMapStyles : [],
  }), [theme]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const center = useMemo(() => {
    if (location) return { lat: location.lat, lng: location.lng };
    if (result?.hospitals?.[0]) return { lat: result.hospitals[0].lat, lng: result.hospitals[0].lng };
    return { lat: 34.015, lng: 71.5249 }; // Default to Peshawar
  }, [location, result]);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded || !result?.hospitals) return null;

  return (
    <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* User Location Marker */}
        {location && (
          <MarkerF
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4ebfb6",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
          />
        )}

        {/* Hospital Markers */}
        {result.hospitals.filter(h => h.lat && h.lng).map((hospital, idx) => (
          <MarkerF
            key={idx}
            position={{ lat: hospital.lat, lng: hospital.lng }}
            onClick={() => setSelectedHospital(hospital)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        ))}

        {selectedHospital && (
          <InfoWindowF
            position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }}
            onCloseClick={() => setSelectedHospital(null)}
          >
            <div className="p-2 min-w-[150px] bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white">{selectedHospital.name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{selectedHospital.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.name + ' ' + selectedHospital.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] bg-brand-green text-white px-2 py-1 rounded-md"
              >
                Directions
              </a>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
