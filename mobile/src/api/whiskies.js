import apiClient from './client';

export const whiskiesApi = {
  getWhiskies: (params) => apiClient.get('/whiskies', { params }),
  getWhiskey: (id) => apiClient.get(`/whiskies/${id}`),
  getMatch: (id) => apiClient.get(`/whiskies/${id}/match`),
  getCategories: () => apiClient.get('/categories'),
};
