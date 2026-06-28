import apiClient from './client';

export const collectionApi = {
  getCollection: () => apiClient.get('/collection'),
  getSummary: () => apiClient.get('/collection/summary'),
  addItem: (data) => apiClient.post('/collection', data),
  updateItem: (id, data) => apiClient.put(`/collection/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/collection/${id}`),
  getLeaderboard: () => apiClient.get('/collection/leaderboard'),
};
