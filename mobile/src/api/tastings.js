import apiClient from './client';

export const tastingsApi = {
  getTastings: () => apiClient.get('/tastings'),
  getTasting: (id) => apiClient.get(`/tastings/${id}`),
  addTasting: (data) => apiClient.post('/tastings', data),
  updateTasting: (id, data) => apiClient.put(`/tastings/${id}`, data),
  deleteTasting: (id) => apiClient.delete(`/tastings/${id}`),
};
