import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import TrainSearch from '../pages/TrainSearch';
import LiveStatus from '../pages/LiveStatus';
import AdminDashboard from '../pages/AdminDashboard';

// Placeholder components
const NotFound = () => <div className="text-center py-20"><h1 className="text-6xl font-extrabold text-blue-600">404</h1><p className="text-2xl mt-4 dark:text-white">Page not found</p></div>;

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="trains" element={<TrainSearch />} />
        <Route path="live-status" element={<LiveStatus />} />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
        {/* Protected Routes would go here */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
