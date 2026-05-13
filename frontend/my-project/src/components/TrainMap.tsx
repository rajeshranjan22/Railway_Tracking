import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TrainMapProps {
  lat: number;
  lon: number;
  trainName: string;
}

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
};

const TrainMap: React.FC<TrainMapProps> = ({ lat, lon, trainName }) => {
  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
      <MapContainer 
        center={[lat, lon]} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-center font-bold">
              {trainName}
            </div>
          </Popup>
        </Marker>
        <RecenterMap lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
};

export default TrainMap;
