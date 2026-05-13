import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isSent ? "Check your inbox for instructions" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" /> Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-transparent'} rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full group"
                isLoading={loading}
              >
                Send Reset Link
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a password reset link to your email. It may take a few minutes to arrive.
              </p>
              <Button
                onClick={() => setIsSent(false)}
                className="w-full group !bg-gray-200 !text-gray-800 hover:!bg-gray-300 dark:!bg-gray-800 dark:!text-white dark:hover:!bg-gray-700"
              >
                Try another email
              </Button>
            </div>
          )}

          <div className="mt-8 text-center text-sm">
            <Link to="/login" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
