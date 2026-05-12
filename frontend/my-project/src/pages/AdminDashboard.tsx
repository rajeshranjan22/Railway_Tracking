import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Train, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Settings, 
  Search,
  MoreVertical,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { Button } from '../components/Button';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data.data);
      } catch (error) {
        // Mock data
        setStats({
          totalTrains: 42,
          totalStations: 128,
          totalUsers: 1540,
          activeSchedules: 12,
          revenue: 1250000,
        });
      } finally {
        // setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Trains', value: stats?.totalTrains || 0, icon: <Train />, color: 'bg-blue-500', trend: '+5%' },
    { title: 'Stations', value: stats?.totalStations || 0, icon: <MapPin />, color: 'bg-indigo-500', trend: '+2' },
    { title: 'Active Users', value: stats?.totalUsers || 0, icon: <Users />, color: 'bg-green-500', trend: '+12%' },
    { title: 'Monthly Revenue', value: `$${(stats?.revenue / 1000).toFixed(1)}k`, icon: <TrendingUp />, color: 'bg-orange-500', trend: '+8%' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Admin Console</h1>
          <p className="text-gray-500">Manage your railway network and monitor operations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Settings className="w-4 h-4" /> Config
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Train
          </Button>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg`}>
                {React.cloneElement(card.icon as any, { className: 'w-6 h-6' })}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {card.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-black dark:text-white mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Operations */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold dark:text-white">Live Operations</h3>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                type="text" 
                placeholder="Search train..." 
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
               />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-6 py-4">Train</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Delay</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { id: '12951', name: 'Rajdhani Exp', status: 'Running', delay: '0m', pf: '2' },
                  { id: '12002', name: 'Shatabdi Exp', status: 'Delayed', delay: '15m', pf: '1' },
                  { id: '12260', name: 'Duronto Exp', status: 'On Time', delay: '0m', pf: '5' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {row.id.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold dark:text-white text-sm">{row.name}</p>
                          <p className="text-xs text-gray-500">#{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        row.status === 'Delayed' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-300 font-medium">{row.delay}</td>
                    <td className="px-6 py-4 text-sm dark:text-gray-300 font-bold">PF {row.pf}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Logs */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
           <h3 className="font-bold dark:text-white mb-6 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-orange-500" /> System Alerts
           </h3>
           <div className="space-y-4">
             {[
               { type: 'delay', msg: 'Train 12002 delayed by 15 mins at CNB', time: '2m ago' },
               { type: 'platform', msg: 'Platform change for 12260 at NDLS', time: '15m ago' },
               { type: 'system', msg: 'Backup completed successfully', time: '1h ago' },
             ].map((alert, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                 <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      alert.type === 'delay' ? 'bg-red-500' : alert.type === 'platform' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-medium dark:text-gray-200">{alert.msg}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </p>
                 </div>
               </div>
             ))}
           </div>
           <Button variant="secondary" className="w-full mt-6">View All Logs</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
