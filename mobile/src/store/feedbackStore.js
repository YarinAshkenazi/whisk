import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SOUND_KEY = 'whisk_sound_enabled';
const HAPTIC_KEY = 'whisk_haptic_enabled';

export const useFeedbackStore = create((set, get) => ({
  soundEnabled: true,
  hapticEnabled: true,
  loaded: false,

  initialize: async () => {
    try {
      const [sound, haptic] = await Promise.all([
        SecureStore.getItemAsync(SOUND_KEY),
        SecureStore.getItemAsync(HAPTIC_KEY),
      ]);
      set({
        soundEnabled: sound !== 'false',
        hapticEnabled: haptic !== 'false',
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  setSoundEnabled: async (enabled) => {
    set({ soundEnabled: enabled });
    await SecureStore.setItemAsync(SOUND_KEY, String(enabled)).catch(() => {});
  },

  setHapticEnabled: async (enabled) => {
    set({ hapticEnabled: enabled });
    await SecureStore.setItemAsync(HAPTIC_KEY, String(enabled)).catch(() => {});
  },
}));
