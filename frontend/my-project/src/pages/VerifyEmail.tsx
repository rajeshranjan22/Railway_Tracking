import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Button } from '../components/Button';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      try {
        if (!token) throw new Error('No token provided');
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl p-8 md:p-12 text-center border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
          {status === 'error' && <XCircle className="w-16 h-16 text-red-500" />}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Error'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>

        {status !== 'loading' && (
          <Link to="/login">
            <Button className="w-full">Proceed to Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
