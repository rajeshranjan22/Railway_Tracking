import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Filter, Star, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../services/api';
import { toast } from 'react-toastify';

const TrainSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/trains/search?from=${from}&to=${to}`);
        setTrains(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch trains');
      } finally {
        setLoading(false);
      }
    };

    if (from && to) {
      fetchTrains();
    } else {
      // If no query, just fetch all trains for demo
      const fetchAll = async () => {
        try {
          const response = await api.get('/trains');
          setTrains(response.data.data);
        } catch (error) {
          toast.error('Failed to fetch trains');
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }
  }, [from, to]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Train className="text-blue-600" />
            Trains from <span className="text-blue-600">{from || 'Anywhere'}</span> to <span className="text-blue-600">{to || 'Everywhere'}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{trains.length} trains found for your route</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            Sort by: Arrival
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          // Skeletons
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))
        ) : trains.length > 0 ? (
          trains.map((train, i) => (
            <motion.div
              key={train._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-1/4 bg-blue-50/50 dark:bg-blue-900/10 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                  <div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                      {train.type}
                    </span>
                    <h3 className="text-xl font-bold dark:text-white mt-3">{train.trainNumber}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{train.trainName}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-orange-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">4.8</span>
                    <span className="text-xs text-gray-400 ml-1">(2.5k reviews)</span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col md:flex-row items-center justify-around gap-8">
                  <div className="text-center md:text-left space-y-1">
                    <p className="text-2xl font-black dark:text-white">17:10</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{train.sourceStation?.name || 'Mumbai'}</p>
                    <p className="text-xs text-gray-400">Mon, 12 May</p>
                  </div>

                  <div className="flex flex-col items-center flex-grow max-w-[200px]">
                    <p className="text-xs text-gray-400 mb-2">15h 20m</p>
                    <div className="relative w-full h-px bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                       <div className="absolute left-0 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                       <div className="absolute right-0 w-2 h-2 rounded-full bg-blue-600" />
                       <Train className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-900 px-1" />
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-2">Daily Journey</p>
                  </div>

                  <div className="text-center md:text-right space-y-1">
                    <p className="text-2xl font-black dark:text-white">08:30</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{train.destinationStation?.name || 'Delhi'}</p>
                    <p className="text-xs text-gray-400">Tue, 13 May</p>
                  </div>
                </div>

                <div className="p-6 md:w-1/4 flex flex-col justify-center items-center md:items-end gap-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {['SL', '3A', '2A', '1A'].map(cls => (
                      <span key={cls} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold dark:text-gray-400">
                        {cls}
                      </span>
                    ))}
                  </div>
                  <Link to={`/live-status?train=${train.trainNumber}`} className="w-full">
                    <Button variant="primary" className="w-full group">
                      Live Status
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
             <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold dark:text-white">No trains found</h3>
             <p className="text-gray-500">Try searching for a different route or check back later.</p>
             <Button className="mt-6" variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSearch;
