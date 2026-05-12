import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Clock, MapPin, AlertCircle, RefreshCcw, Navigation, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { socket, subscribeToTrain } from '../services/socketService';
import api from '../services/api';
import { toast } from 'react-toastify';

const LiveStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trainNumber = searchParams.get('train');
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!trainNumber) return;
      // setLoading(true);
      try {
        const response = await api.get(`/trains/live/${trainNumber}`);
        setStatus(response.data.data);
      } catch (error) {
        // Mock data for demo if API fails
        setStatus({
          train: { trainNumber, trainName: 'Mumbai Rajdhani Express' },
          currentStation: { name: 'Ratlam Jn', code: 'RTM' },
          nextStation: { name: 'Kota Jn', code: 'KOTA' },
          currentStatus: 'On Time',
          delayInMinutes: 0,
          platformNumber: 2,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        // setLoading(false);
      }
    };

    fetchStatus();

    // Socket implementation
    if (trainNumber) {
      socket.connect();
      subscribeToTrain(trainNumber);
      
      socket.on('status_update', (data) => {
        setStatus(data);
        toast.info(`Status update for train ${trainNumber}`);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [trainNumber]);

  if (!trainNumber) {
    return <div className="text-center py-20">Please select a train to track.</div>;
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
                <h1 className="text-3xl font-black">{status?.train?.trainName || 'Rajdhani Exp'}</h1>
                <p className="text-blue-100 font-medium tracking-widest">{status?.train?.trainNumber || trainNumber}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-300">Live Tracking Active</span>
             </div>
             <p className="text-2xl font-black">On Time</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Progress Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" /> Route Progress
            </h3>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />

              <div className="space-y-12">
                {[
                  { name: 'Mumbai Central', time: '17:10', status: 'Departed', actual: '17:10', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                  { name: 'Borivali', time: '17:45', status: 'Departed', actual: '17:48', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                  { name: 'Ratlam Jn', time: '22:30', status: 'Current', actual: '22:30', icon: <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/40" /> },
                  { name: 'Kota Jn', time: '02:10', status: 'Upcoming', actual: '--', icon: <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" /> },
                  { name: 'New Delhi', time: '08:30', status: 'Upcoming', actual: '--', icon: <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" /> },
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
                          <p className={`font-bold ${stop.status === 'Current' ? 'text-blue-600 text-lg' : 'text-gray-900 dark:text-white'}`}>
                            {stop.name}
                          </p>
                          <p className="text-sm text-gray-500">{stop.status}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold dark:text-white">{stop.time}</p>
                          <p className={`text-xs ${stop.time === stop.actual ? 'text-green-500' : 'text-red-500'}`}>
                             {stop.actual !== '--' ? `Actual: ${stop.actual}` : 'Scheduled'}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="space-y-6">
           {/* Current Stats */}
           <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Journey Stats</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                       <Clock className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Scheduled Arrival</p>
                       <p className="font-bold dark:text-white">08:30 AM</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                       <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Current Delay</p>
                       <p className="font-bold dark:text-white">0 Minutes</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Current Platform</p>
                       <p className="font-bold dark:text-white">PF #2</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Refresh Control */}
           <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">Last updated {new Date(status?.lastUpdated).toLocaleTimeString()}</p>
              <Button 
                variant="primary" 
                className="w-full gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="w-4 h-4" /> Refresh Status
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;
