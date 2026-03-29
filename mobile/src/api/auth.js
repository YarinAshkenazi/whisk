import apiClient from './client';

export const authApi = {
  googleLogin: (idToken) => apiClient.post('/auth/google', { idToken }),
  appleLogin: (identityToken, fullName) => apiClient.post('/auth/apple', { identityToken, fullName }),
  devLogin: (email, role = 'User') => apiClient.post('/auth/dev-login', { email, role }),
  getMe: () => apiClient.get('/auth/me'),
};
