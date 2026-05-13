import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Train, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Heatmap logic is usually done via a side effect since it's not a native React Leaflet component
import 'leaflet.heat';

const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const createTrainIcon = (delay: number) => {
  const color = delay > 15 ? '#ef4444' : delay > 0 ? '#f59e0b' : '#3b82f6';
  return L.divIcon({
    className: 'custom-train-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4Z"/><path d="M7 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/><path d="M2 11h20"/><path d="M5 15v-4"/><path d="M19 15v-4"/></svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const GlobalMap: React.FC = () => {
  const [trains, setTrains] = useState<any[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const fetchAllSims = async () => {
      try {
        const response = await api.get('/trains/live/all');
        setTrains(response.data.data);
      } catch (error) {
        console.error('Failed to fetch all live trains', error);
      }
    };

    fetchAllSims();
    const interval = setInterval(fetchAllSims, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const heatPoints: [number, number, number][] = trains
    .filter(t => t.delay > 0)
    .map(t => [t.currentLat, t.currentLon, t.delay / 30]); // Intensity based on delay

  return (
    <div className="h-[calc(100vh-100px)] w-full relative flex flex-col">
      <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <MapPin className="text-blue-600" /> Network Overview
          </h1>
          <p className="text-sm text-gray-500">{trains.length} Active Trains Simulating</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => setShowHeatmap(!showHeatmap)}
             className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showHeatmap ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
           >
             Delay Heatmap: {showHeatmap ? 'ON' : 'OFF'}
           </button>
        </div>
      </div>

      <div className="flex-grow relative overflow-hidden">
        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {showHeatmap && <HeatmapLayer points={heatPoints} />}

          {!showHeatmap && (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={40}
            >
              {trains.map((train) => (
                <Marker 
                  key={train.trainNumber} 
                  position={[train.currentLat, train.currentLon]}
                  icon={createTrainIcon(train.delay)}
                >
                  <Popup>
                    <div className="p-3 min-w-[200px] space-y-3">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Train className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold">{train.trainName}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-xs">
                           <Clock className="w-3 h-3 text-gray-400" />
                           <span className={train.delay > 0 ? 'text-orange-500 font-bold' : 'text-green-500 font-bold'}>
                             {train.delay > 0 ? `+${train.delay}m` : 'On Time'}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                           <AlertTriangle className="w-3 h-3 text-gray-400" />
                           <span className="text-gray-600">{train.weather}</span>
                        </div>
                      </div>
                      <a 
                        href={`/live-status?train=${train.trainNumber}`}
                        className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        Detailed Track
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>

        {/* Real-time stats sidebar overlay */}
        <AnimatePresence>
           <motion.div 
             initial={{ x: 300 }}
             animate={{ x: 0 }}
             className="absolute top-6 right-6 z-[1000] w-72 space-y-4 pointer-events-none"
           >
             <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 pointer-events-auto">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Delayed Alerts</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {trains.filter(t => t.delay > 5).length > 0 ? (
                     trains.filter(t => t.delay > 5).map(t => (
                       <div key={t.trainNumber} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                          <div className={`w-2 h-2 rounded-full mt-2 ${t.delay > 15 ? 'bg-red-500' : 'bg-orange-500'}`} />
                          <div>
                             <p className="text-sm font-bold dark:text-white">{t.trainName}</p>
                             <p className="text-xs text-gray-500">{t.delay} mins late • {t.status}</p>
                          </div>
                       </div>
                     ))
                   ) : (
                     <p className="text-sm text-gray-500 italic">All trains running smoothly.</p>
                   )}
                </div>
             </div>
           </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GlobalMap;
