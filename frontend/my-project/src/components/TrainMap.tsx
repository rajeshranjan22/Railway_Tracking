import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for different statuses
const createTrainIcon = (delay: number) => {
  const color = delay > 15 ? '#ef4444' : delay > 0 ? '#f59e0b' : '#3b82f6';
  return L.divIcon({
    className: 'custom-train-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.5s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4Z"/><path d="M7 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/><path d="M2 11h20"/><path d="M5 15v-4"/><path d="M19 15v-4"/></svg>
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background-color: ${color};
        clip-path: polygon(50% 100%, 0 0, 100% 0);
      "></div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

interface TrainMapProps {
  lat: number;
  lon: number;
  trainName: string;
  delay: number;
  routeCoordinates?: [number, number][];
}

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), {
      animate: true,
      duration: 1.5
    });
  }, [lat, lon, map]);
  return null;
};

const TrainMap: React.FC<TrainMapProps> = ({ lat, lon, trainName, delay, routeCoordinates }) => {
  return (
    <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-900 relative">
      <MapContainer 
        center={[lat, lon]} 
        zoom={8} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Route Polyline */}
        {routeCoordinates && (
          <>
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ 
                color: '#94a3b8', 
                weight: 4, 
                dashArray: '1, 10',
                lineJoin: 'round'
              }} 
            />
            {/* Markers for Stations along the route */}
            {routeCoordinates.map((coord, idx) => (
              <CircleMarker 
                key={idx}
                center={coord}
                pathOptions={{ 
                  fillColor: '#64748b', 
                  fillOpacity: 1, 
                  color: 'white', 
                  weight: 2 
                }}
                radius={6}
              >
                <Popup>Station along route</Popup>
              </CircleMarker>
            ))}
          </>
        )}

        {/* Live Train Marker */}
        <Marker 
          position={[lat, lon]} 
          icon={createTrainIcon(delay)}
        >
          <Popup className="custom-popup">
            <div className="p-2">
              <h3 className="font-bold text-lg">{trainName}</h3>
              <p className={`text-sm font-bold ${delay > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {delay > 0 ? `Delayed by ${delay} mins` : 'Running on Time'}
              </p>
            </div>
          </Popup>
        </Marker>

        <RecenterMap lat={lat} lon={lon} />
      </MapContainer>
      
      {/* Legend overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 space-y-2">
         <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Live Legend</p>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold dark:text-white">On Time</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs font-bold dark:text-white">Minor Delay</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-bold dark:text-white">Major Delay (&gt;15m)</span>
         </div>
      </div>
    </div>
  );
};

export default TrainMap;
