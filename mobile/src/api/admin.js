import apiClient from './client';

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: () => apiClient.get('/admin/users'),
  updateUserStatus: (id, isActive) => apiClient.put(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id, role) => apiClient.put(`/admin/users/${id}/role`, { role }),
  getWhiskies: () => apiClient.get('/admin/whiskies'),
  createWhiskey: (data) => apiClient.post('/admin/whiskies', data),
  updateWhiskey: (id, data) => apiClient.put(`/admin/whiskies/${id}`, data),
  deleteWhiskey: (id) => apiClient.delete(`/admin/whiskies/${id}`),
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
  getRequests: () => apiClient.get('/admin/whiskey-requests'),
  approveRequest: (id) => apiClient.put(`/admin/whiskey-requests/${id}/approve`),
  rejectRequest: (id) => apiClient.put(`/admin/whiskey-requests/${id}/reject`),
  updateMarketPrices: (id, data) => apiClient.put(`/admin/whiskies/${id}/market-prices`, data),
};
