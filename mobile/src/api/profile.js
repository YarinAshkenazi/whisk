import apiClient from './client';

export const profileApi = {
  getProfile: () => apiClient.get('/profile/me'),
  updateProfile: (data) => apiClient.put('/profile/me', data),
  completeOnboarding: (data) => apiClient.put('/profile/onboarding', data),
  deleteAccount: () => apiClient.delete('/profile/me'),
};
