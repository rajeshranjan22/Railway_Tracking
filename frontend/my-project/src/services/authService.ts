import api from './api';

export const authService = {
  logoutAll: async () => {
    return await api.post('/auth/logout-all');
  },
  
  verifyEmail: async (token: string) => {
    return await api.put(`/auth/verifyemail/${token}`);
  },

  forgotPassword: async (email: string) => {
    return await api.post('/auth/forgotpassword', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return await api.put(`/auth/resetpassword/${token}`, { password });
  },

  googleLogin: async (token: string) => {
    return await api.post('/auth/google', { token });
  }
};
