import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Clock, MapPin, AlertCircle, RefreshCcw, Navigation, CheckCircle2, Wind, CloudRain, Sun, CloudFog } from 'lucide-react';
import { Button } from '../components/Button';
import { socket, subscribeToTrain } from '../services/socketService';
import api from '../services/api';
import { toast } from 'react-toastify';
import TrainMap from '../components/TrainMap';

const LiveStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trainNumber = searchParams.get('train');
  const [status, setStatus] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!trainNumber) return;
      try {
        const response = await api.get(`/trains/live/${trainNumber}`);
        setStatus(response.data.data);
      } catch (error) {
        setStatus({
          train: { trainNumber, trainName: `Train ${trainNumber}` },
          currentStation: { name: 'Unknown Station', code: '---' },
          nextStation: { name: 'Calculating...', code: '---' },
          currentStatus: 'Searching...',
          delayInMinutes: 0,
          platformNumber: 0,
          lastUpdated: new Date().toISOString(),
        });
      }
    };

    fetchStatus();

    if (trainNumber) {
      socket.connect();
      subscribeToTrain(trainNumber);
      
      // Listen for the simulation engine updates
      socket.on('train_update', (data) => {
        setLiveData(data);
        // Sync general status with live data
        setStatus((prev: any) => ({
          ...prev,
          currentStatus: data.status,
          delayInMinutes: data.delay,
        }));
      });

      socket.on('platform_update', (data) => {
        toast.info(data.message, {
          icon: <MapPin className="text-blue-500" />
        });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [trainNumber]);

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Heavy Rain': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'Fog': return <CloudFog className="w-5 h-5 text-gray-400" />;
      default: return <Sun className="w-5 h-5 text-yellow-400" />;
    }
  };

  if (!trainNumber) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl text-center border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Train className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Track Your Train</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Enter a train number or explore available trains to start tracking in real-time.</p>
          
          <form 
            onSubmit={(e: any) => {
              e.preventDefault();
              const num = e.target.trainNum.value;
              if (num) window.location.href = `/live-status?train=${num}`;
            }}
            className="space-y-4"
          >
            <input 
              name="trainNum"
              type="text" 
              placeholder="e.g. 12951" 
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white text-lg font-bold"
            />
            <Button type="submit" className="w-full h-14 text-lg">
              Start Tracking
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
            <p className="text-sm text-gray-500">Don't know the train number?</p>
            <Link to="/trains" className="text-blue-600 font-bold hover:underline mt-1 block">
              Browse all trains
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Train className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black">{liveData?.trainName || status?.train?.trainName || 'Rajdhani Exp'}</h1>
                <p className="text-blue-100 font-medium tracking-widest">{status?.train?.trainNumber || trainNumber}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
             <div className="flex items-center justify-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${liveData?.status === 'Signal Issue' ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">Live Tracking</span>
             </div>
             <p className="text-2xl font-black">{liveData?.status || status?.currentStatus || 'On Time'}</p>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>

      {/* Map Integration */}
      {liveData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" /> Real-time Location
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                {getWeatherIcon(liveData.weather)} {liveData.weather}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
                <Wind className="w-4 h-4" /> {liveData.speed} km/h
              </div>
            </div>
          </div>
          <TrainMap 
            lat={liveData.lat} 
            lon={liveData.lon} 
            trainName={liveData.trainName} 
            delay={liveData.delay}
            routeCoordinates={liveData.routeCoordinates}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" /> Route Progress
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-12">
                {[
                  { name: 'Mumbai Central', time: '17:10', status: 'Departed', actual: '17:10', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                  { name: 'Borivali', time: '17:45', status: 'Departed', actual: '17:48', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                  { name: liveData?.nextStation || status?.nextStation?.name || 'Ratlam Jn', time: 'Next Stop', status: 'In Transit', actual: '--', icon: <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/40 animate-pulse" /> },
                ].map((stop, i) => (
                  <motion.div 
                    key={stop.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-12"
                  >
                    <div className="absolute left-2.5 -translate-x-1/2 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                       {stop.icon}
                    </div>
                    <div className="flex justify-between items-start">
                       <div>
                          <p className={`font-bold ${stop.status === 'In Transit' ? 'text-blue-600 text-lg' : 'text-gray-900 dark:text-white'}`}>
                            {stop.name}
                          </p>
                          <p className="text-sm text-gray-500">{stop.status}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold dark:text-white">{stop.time}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Live Journey Stats</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                       <Clock className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Estimated ETA</p>
                       <p className="font-bold dark:text-white">{liveData?.eta ? `${liveData.eta} mins` : 'Calculating...'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                       <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Accumulated Delay</p>
                       <p className="font-bold dark:text-white">{liveData?.delay || status?.delayInMinutes || 0} Minutes</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Platform info</p>
                       <p className="font-bold dark:text-white">{status?.platformNumber ? `PF #${status.platformNumber}` : 'Assigning...'}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">Last updated {new Date().toLocaleTimeString()}</p>
              <Button 
                variant="primary" 
                className="w-full gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="w-4 h-4" /> Reset Tracking
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;

