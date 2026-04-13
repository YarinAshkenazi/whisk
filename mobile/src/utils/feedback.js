import { useCallback, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useFeedbackStore } from '../store/feedbackStore';

const sounds = {
  ratingTick: require('../../assets/sounds/rating-tick.wav'),
  success: require('../../assets/sounds/success-soft.wav'),
  error: require('../../assets/sounds/error-soft.wav'),
  collectionAdd: require('../../assets/sounds/collection-add.wav'),
};

console.log('[Feedback] Sound assets resolved:', {
  ratingTick: sounds.ratingTick,
  success: sounds.success,
  error: sounds.error,
  collectionAdd: sounds.collectionAdd,
});

const MIN_INTERVAL_MS = 80;

const PLAYER_OPTIONS = { keepAudioSessionActive: true };

function haptic(type) {
  try {
    switch (type) {
      case 'selection':
        Haptics.selectionAsync();
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        break;
    }
  } catch {
    // Haptic engine unavailable
  }
}

function playPlayer(player, label) {
  if (!player) {
    console.warn(`[Feedback] Player "${label}" is null/undefined`);
    return;
  }
  try {
    console.log(`[Feedback] Playing "${label}" — isLoaded=${player.isLoaded}, duration=${player.duration}s, volume=${player.volume}`);
    player.seekTo(0);
    player.play();
  } catch (err) {
    console.warn(`[Feedback] Playback error for "${label}":`, err);
  }
}

/**
 * Central feedback hook. Call once per screen, then use the returned functions.
 * Audio players are managed by expo-audio's lifecycle hooks.
 */
export function useFeedback() {
  const { soundEnabled, hapticEnabled } = useFeedbackStore();
  const throttle = useRef({});

  const ratingTickPlayer = useAudioPlayer(sounds.ratingTick, PLAYER_OPTIONS);
  const successPlayer = useAudioPlayer(sounds.success, PLAYER_OPTIONS);
  const errorPlayer = useAudioPlayer(sounds.error, PLAYER_OPTIONS);
  const collectionAddPlayer = useAudioPlayer(sounds.collectionAdd, PLAYER_OPTIONS);

  const fire = useCallback((key, player, label, hapticType) => {
    const now = Date.now();
    if (throttle.current[key] && now - throttle.current[key] < MIN_INTERVAL_MS) return;
    throttle.current[key] = now;
    if (soundEnabled) playPlayer(player, label);
    if (hapticEnabled) haptic(hapticType);
  }, [soundEnabled, hapticEnabled]);

  const playRatingTick = useCallback(
    () => fire('tick', ratingTickPlayer, 'ratingTick', 'selection'),
    [fire, ratingTickPlayer],
  );

  const playSuccess = useCallback(
    () => fire('success', successPlayer, 'success', 'success'),
    [fire, successPlayer],
  );

  const playError = useCallback(
    () => fire('error', errorPlayer, 'error', 'error'),
    [fire, errorPlayer],
  );

  const playCollectionAdd = useCallback(
    () => fire('collection', collectionAddPlayer, 'collectionAdd', 'success'),
    [fire, collectionAddPlayer],
  );

  return { playRatingTick, playSuccess, playError, playCollectionAdd };
}
