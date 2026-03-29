import apiClient from './client';

export const recommendationsApi = {
  getRecommendations: () => apiClient.get('/recommendations'),
  getStatus: () => apiClient.get('/recommendations/status'),
};
