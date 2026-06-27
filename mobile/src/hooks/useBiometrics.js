import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import {
  isBiometricAvailable,
  getBiometricLabel,
  authenticate,
  getBiometricPreference,
  setBiometricPreference,
  getUnavailableMessage,
} from '../utils/biometrics';

const BACKGROUND_LOCK_THRESHOLD_MS = 15_000;

export function useBiometrics(isAuthenticated) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [label, setLabel] = useState('Use Biometrics');
  const [loading, setLoading] = useState(true);

  const backgroundedAt = useRef(null);
  const hasInitialUnlocked = useRef(false);
  const suppressedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [pref, biometricLabel] = await Promise.all([
        getBiometricPreference(),
        getBiometricLabel(),
      ]);
      if (cancelled) return;
      setLabel(biometricLabel);
      setIsEnabled(pref);
      if (pref && isAuthenticated) {
        setIsLocked(true);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isEnabled) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (suppressedRef.current) return;

      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (nextState === 'active' && backgroundedAt.current) {
        const elapsed = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (elapsed >= BACKGROUND_LOCK_THRESHOLD_MS) {
          setIsLocked(true);
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, isEnabled]);

  const unlock = useCallback(async () => {
    const result = await authenticate('Unlock Whisk');
    if (result.success) {
      setIsLocked(false);
      hasInitialUnlocked.current = true;
      return true;
    }
    return false;
  }, []);

  const toggle = useCallback(async () => {
    if (isEnabled) {
      await setBiometricPreference(false);
      setIsEnabled(false);
      setIsLocked(false);
      return;
    }

    const { available, reason } = await isBiometricAvailable();
    if (!available) {
      Alert.alert('Not Available', getUnavailableMessage(reason));
      return;
    }

    const result = await authenticate('Enable biometric unlock');
    if (result.success) {
      await setBiometricPreference(true);
      setIsEnabled(true);
    }
  }, [isEnabled]);

  const suppressLock = useCallback(() => {
    suppressedRef.current = true;
  }, []);

  const resumeLock = useCallback(() => {
    suppressedRef.current = false;
    backgroundedAt.current = null;
  }, []);

  return { isEnabled, isLocked, label, loading, unlock, toggle, suppressLock, resumeLock };
}
