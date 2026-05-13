import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/Button';
import { setCredentials, setLoading } from '../redux/slices/authSlice';
import api from '../services/api';
import { authService } from '../services/authService';
import type { RootState } from '../redux/store';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      dispatch(setCredentials(response.data));
      toast.success('Account created successfully! Please verify your email.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      dispatch(setCredentials(response.data));
      toast.success('Signed up with Google successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google Signup failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join RailTrack to track your journeys</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" /> Password
              </label>
              <input
                {...register('password')}
                type="password"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" /> Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full group mt-4"
              isLoading={loading}
            >
              Sign Up
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">OR</span>
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Signup failed')}
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
