import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whiskiesApi } from '../api/whiskies';
import { collectionApi } from '../api/collection';
import { tastingsApi } from '../api/tastings';
import { recommendationsApi } from '../api/recommendations';
import { requestsApi } from '../api/requests';
import { profileApi } from '../api/profile';
import { adminApi } from '../api/admin';

// Whiskies
export const useWhiskies = (params) =>
  useQuery({ queryKey: ['whiskies', params], queryFn: () => whiskiesApi.getWhiskies(params).then(r => r.data) });

export const useWhiskey = (id) =>
  useQuery({ queryKey: ['whiskey', id], queryFn: () => whiskiesApi.getWhiskey(id).then(r => r.data), enabled: !!id });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => whiskiesApi.getCategories().then(r => r.data) });

// Collection
export const useCollection = () =>
  useQuery({ queryKey: ['collection'], queryFn: () => collectionApi.getCollection().then(r => r.data) });

export const useCollectionSummary = () =>
  useQuery({ queryKey: ['collectionSummary'], queryFn: () => collectionApi.getSummary().then(r => r.data) });

export const useAddCollectionItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => collectionApi.addItem(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collectionSummary'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateCollectionItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => collectionApi.updateItem(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collectionSummary'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useDeleteCollectionItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => collectionApi.deleteItem(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collectionSummary'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Tastings
export const useTastings = () =>
  useQuery({ queryKey: ['tastings'], queryFn: () => tastingsApi.getTastings().then(r => r.data) });

export const useTasting = (id) =>
  useQuery({ queryKey: ['tasting', id], queryFn: () => tastingsApi.getTasting(id).then(r => r.data), enabled: !!id });

export const useAddTasting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tastingsApi.addTasting(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tastings'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['recStatus'] });
      qc.invalidateQueries({ queryKey: ['whiskies'] });
    },
  });
};

export const useUpdateTasting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tastingsApi.updateTasting(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tastings'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['recStatus'] });
      qc.invalidateQueries({ queryKey: ['whiskies'] });
    },
  });
};

export const useDeleteTasting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tastingsApi.deleteTasting(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tastings'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['recStatus'] });
      qc.invalidateQueries({ queryKey: ['whiskies'] });
    },
  });
};

// Recommendations
export const useRecommendations = () =>
  useQuery({ queryKey: ['recommendations'], queryFn: () => recommendationsApi.getRecommendations().then(r => r.data) });

export const useRecommendationStatus = () =>
  useQuery({ queryKey: ['recStatus'], queryFn: () => recommendationsApi.getStatus().then(r => r.data) });

// Requests
export const useMyRequests = () =>
  useQuery({ queryKey: ['myRequests'], queryFn: () => requestsApi.getMyRequests().then(r => r.data) });

export const useCreateRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => requestsApi.create(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myRequests'] }),
  });
};

// Profile
export const useProfile = () =>
  useQuery({ queryKey: ['profile'], queryFn: () => profileApi.getProfile().then(r => r.data) });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => profileApi.updateProfile(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
};

// Admin
export const useAdminDashboard = () =>
  useQuery({ queryKey: ['adminDashboard'], queryFn: () => adminApi.getDashboard().then(r => r.data) });

export const useAdminUsers = () =>
  useQuery({ queryKey: ['adminUsers'], queryFn: () => adminApi.getUsers().then(r => r.data) });

export const useAdminWhiskies = () =>
  useQuery({ queryKey: ['adminWhiskies'], queryFn: () => adminApi.getWhiskies().then(r => r.data) });

export const useAdminCategories = () =>
  useQuery({ queryKey: ['adminCategories'], queryFn: () => adminApi.getCategories().then(r => r.data) });

export const useAdminRequests = () =>
  useQuery({ queryKey: ['adminRequests'], queryFn: () => adminApi.getRequests().then(r => r.data) });
