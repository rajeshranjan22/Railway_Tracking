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
  ArrowUpRight,
  Clock,
  Activity,
  Zap,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Button } from '../components/Button';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Active Trains', value: stats?.activeTrains || 0, icon: <Train />, color: 'bg-blue-500', trend: '+5%', sub: 'Currently tracking' },
    { title: 'Delayed Trains', value: stats?.delayedTrains || 0, icon: <AlertTriangle />, color: 'bg-red-500', trend: '-2', sub: 'Action required' },
    { title: 'On-Time Rate', value: `${stats?.onTimePercentage || 0}%`, icon: <Zap />, color: 'bg-yellow-500', trend: '+1.2%', sub: 'Last 24 hours' },
    { title: 'System Uptime', value: `${stats?.systemUptime || 0}%`, icon: <Activity />, color: 'bg-green-500', trend: 'Stable', sub: 'Server status' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-500">Real-time system performance and railway metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Settings className="w-4 h-4" /> Config
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Add Train
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg`}>
                {React.cloneElement(card.icon as any, { className: 'w-6 h-6' })}
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold ${
                card.trend.includes('+') ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 
                card.trend === 'Stable' ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'
              } px-2 py-1 rounded-full`}>
                {card.trend.includes('+') && <ArrowUpRight className="w-3 h-3" />} {card.trend}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-black dark:text-white mt-1">{card.value}</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Active Trains Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Daily Active Trains
            </h3>
            <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-bold px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyActiveTrains || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Most Delayed Routes Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Most Delayed Routes (min)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.delayedRoutes || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis dataKey="route" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontWeight: 'bold', fontSize: 12}} width={80} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="delay" radius={[0, 8, 8, 0]}>
                  {(stats?.delayedRoutes || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#facc15'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Average Delay Trends */}
        <motion.div 
          className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-indigo-500" /> Delay Trends
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.delayTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Line type="stepAfter" dataKey="avgDelay" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Station Traffic */}
        <motion.div 
          className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" /> Station Traffic
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.stationTraffic || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="station" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Activity & Popular Searches */}
        <motion.div 
          className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" /> Popular Searches
          </h3>
          <div className="space-y-4">
            {(stats?.popularSearches || []).map((search: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <span className="font-bold dark:text-white">{search.term}</span>
                </div>
                <span className="text-sm font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                  {search.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Activity Line Chart */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> User Engagement
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userActivity || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="step" dataKey="users" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live System Logs */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl p-8">
           <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
             <Search className="w-5 h-5 text-gray-400" /> Recent Activity
           </h3>
           <div className="space-y-4">
             {[
               { user: 'admin_1', action: 'Created Station: NDLS', time: '2m ago' },
               { user: 'sys_bot', action: 'Simulation sync completed', time: '15m ago' },
               { user: 'admin_2', action: 'Updated Schedule: 12951', time: '1h ago' },
               { user: 'admin_1', action: 'Deleted Route: MUM-BPL', time: '3h ago' },
             ].map((log, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md cursor-default">
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                   {log.user.split('_')[0][0]}
                 </div>
                 <div>
                    <p className="text-sm font-bold dark:text-gray-200">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{log.user}</span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {log.time}</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>
           <Button variant="secondary" className="w-full mt-6 rounded-2xl">View Audit Trail</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
