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
import GlobalMap from '../pages/GlobalMap';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';

// Placeholder components
const NotFound = () => <div className="text-center py-20"><h1 className="text-6xl font-extrabold text-blue-600">404</h1><p className="text-2xl mt-4 dark:text-white">Page not found</p></div>;

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="trains" element={<TrainSearch />} />
        <Route path="live-status" element={<LiveStatus />} />
        <Route path="network-map" element={<GlobalMap />} />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="admin" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to={isAuthenticated ? "/" : "/login"} />} />
        {/* Protected Routes would go here */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
