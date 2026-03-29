import { Platform } from 'react-native';

// Physical device (Expo Go): uses hostname so it works across different networks
// Android emulator: 10.0.2.2 maps to host loopback
const DEV_HOST = Platform.select({ android: '10.0.2.2', default: 'YarinLaptop.local' });
export const API_URL = __DEV__ ? `http://${DEV_HOST}:5000/api` : 'https://api.whisk.app/api';
export const BASE_URL = __DEV__ ? `http://${DEV_HOST}:5000` : 'https://api.whisk.app';

export function getWhiskeyImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${BASE_URL}/WhiskImages/${imageUrl}`;
}

export const COLLECTION_STATUS = {
  CLOSED: 'Closed',
  OPENED: 'Opened',
  FINISHED: 'Finished',
};

export const USER_ROLES = {
  USER: 'User',
  ADMIN: 'Admin',
};

export const DELTA_RANGE = { MIN: -5, MAX: 5 };

export const MIN_TASTINGS_FOR_RECS = 3;

export const WHISKEY_CATEGORIES = [
  'Single Malt Scotch',
  'Blended Scotch',
  'Japanese',
  'Irish',
  'Indian',
  'Israeli',
];

export const COUNTRIES = [
  'Israel', 'United States', 'United Kingdom', 'Scotland', 'Ireland',
  'Japan', 'India', 'Canada', 'Australia', 'Taiwan', 'France', 'Germany',
  'Sweden', 'Other',
];

export const STATUS_COLORS = {
  Closed: '#4CAF50',
  Opened: '#FF9800',
  Finished: '#9E9E9E',
  Pending: '#FF9800',
  Approved: '#4CAF50',
  Rejected: '#F44336',
};
