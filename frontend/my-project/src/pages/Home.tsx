import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRightLeft, Shield, Clock, Bell, Train } from 'lucide-react';
import { Button } from '../components/Button';

const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 dark:opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 blur-3xl rounded-full transform -translate-y-1/2 scale-150" />
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Track Your Journey in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Real-Time</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            The most reliable railway tracking system. Search trains, check live status, and get instant updates on delays and platform changes.
          </motion.p>
        </div>

        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> From
              </label>
              <input 
                type="text" 
                placeholder="Station name or code"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              />
            </div>

            <div className="flex justify-center md:pt-8">
               <button className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:rotate-180 transition-all duration-500">
                 <ArrowRightLeft className="w-6 h-6" />
               </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" /> To
              </label>
              <input 
                type="text" 
                placeholder="Station name or code"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
               <Button className="w-full group">
                 <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                 Search Trains
               </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: 'Live Tracking', 
            desc: 'Get precise GPS location and real-time movement of your train.', 
            icon: <MapPin className="w-8 h-8 text-blue-500" />,
            color: 'bg-blue-50 dark:bg-blue-900/20'
          },
          { 
            title: 'Instant Alerts', 
            desc: 'Receive real-time notifications for delays and platform changes.', 
            icon: <Bell className="w-8 h-8 text-orange-500" />,
            color: 'bg-orange-50 dark:bg-orange-900/20'
          },
          { 
            title: 'Accurate Data', 
            desc: 'Powered by official railway data for maximum reliability.', 
            icon: <Shield className="w-8 h-8 text-green-500" />,
            color: 'bg-green-50 dark:bg-green-900/20'
          }
        ].map((feature, i) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Live Status Promo */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="flex-1 space-y-6 z-10">
            <h2 className="text-4xl md:text-5xl font-bold">Never miss your station again.</h2>
            <p className="text-indigo-100 text-lg">Set destination alarms and get notified before your train arrives at your stop.</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 border-none">Check Live Status</Button>
              <Button variant="ghost" className="text-white border-white/20 hover:bg-white/10">Learn More</Button>
            </div>
          </div>
          <div className="flex-1 relative z-10 w-full max-w-sm">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                         <Train className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                         <p className="font-bold">Rajdhani Exp</p>
                         <p className="text-xs text-indigo-200">12951 • Running</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-indigo-200">Next Station</p>
                      <p className="font-bold">Kanpur</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span>Progress</span>
                      <span className="text-indigo-200">75%</span>
                   </div>
                   <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        className="h-full bg-white" 
                      />
                   </div>
                   <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Arriving in 15 mins • <span className="text-green-300 font-bold">On Time</span></span>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default Home;
