import axios from 'axios';
import { API_URL } from '../constants';
import { useAuthStore } from '../store/authStore';

console.log('[apiClient] baseURL =', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  adapter: 'fetch',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[apiClient] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ? JSON.stringify(config.data) : '');
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('[apiClient] ERROR:', error.message, '| status:', error.response?.status, '| data:', JSON.stringify(error.response?.data), '| code:', error.code);
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
