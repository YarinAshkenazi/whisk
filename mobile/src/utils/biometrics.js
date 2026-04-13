import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_PREF_KEY = 'whisk_biometric_enabled';

export async function isBiometricAvailable() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { available: false, reason: 'no_hardware' };

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return { available: false, reason: 'not_enrolled' };

  return { available: true, reason: null };
}

export async function getBiometricLabel() {
  if (Platform.OS === 'ios') {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Use Face ID';
    }
    return 'Use Touch ID';
  }
  return 'Use Fingerprint / Biometrics';
}

export async function authenticate(promptMessage = 'Unlock Whisk') {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use Passcode',
    });
    return result;
  } catch {
    return { success: false, error: 'unexpected_error' };
  }
}

export async function getBiometricPreference() {
  try {
    const value = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricPreference(enabled) {
  try {
    if (enabled) {
      await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY);
    }
  } catch {
    // Preference save failed silently
  }
}

export function getUnavailableMessage(reason) {
  switch (reason) {
    case 'no_hardware':
      return 'Your device does not support biometric authentication.';
    case 'not_enrolled':
      return Platform.OS === 'ios'
        ? 'No Face ID or Touch ID is set up. Go to Settings > Face ID & Passcode to enroll.'
        : 'No fingerprint is enrolled. Go to device Settings > Security to add one.';
    default:
      return 'Biometric authentication is not available on this device.';
  }
}
