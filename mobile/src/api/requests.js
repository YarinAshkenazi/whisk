import apiClient from './client';

export const requestsApi = {
  create: (data) => apiClient.post('/whiskey-requests', data),
  getMyRequests: () => apiClient.get('/whiskey-requests/me'),
};
