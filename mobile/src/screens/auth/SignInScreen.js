import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

const GOOGLE_WEB_CLIENT_ID =
  '355982767755-qjoe5vqcr34n0k6b21ml5bnnpr0co1n5.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export default function SignInScreen() {
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const { setAuth } = useAuthStore();

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setAuthError('');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Failed to get Google ID token');
        setLoading(null);
        return;
      }

      const res = await authApi.googleLogin(idToken);
      await setAuth(res.data.token, null);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services is not available on this device');
            break;
          default:
            Alert.alert('Google Sign-In Error', error.message);
        }
      } else {
        const msg =
          error.response?.data?.error ||
          (error.response ? `Server returned ${error.response.status}` : error.message);
        Alert.alert('Login Error', msg);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading('apple');
    try {
      Alert.alert('Apple Sign-In', 'Configure Apple Sign-In credentials. For dev testing, use Dev Login below.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDevLogin = async (role) => {
    console.log('[DevLogin] pressed, role =', role);
    setLoading('dev');
    setAuthError('');
    try {
      const devEmail = role === 'Admin' ? 'admin@whisk.dev' : 'user@whisk.dev';
      console.log('[DevLogin] calling authApi.devLogin with', devEmail, role);
      const res = await authApi.devLogin(devEmail, role);
      console.log('[DevLogin] success, token received');
      await setAuth(res.data.token, null);
    } catch (e) {
      console.log('[DevLogin] CATCH:', e.message, '| code:', e.code, '| status:', e.response?.status, '| data:', JSON.stringify(e.response?.data));
      const msg = e.response?.data?.error
        || (e.response ? `Server returned ${e.response.status}` : `Network error: ${e.message}`);
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setAuthError('Please enter email and password');
      return;
    }

    setLoading('email');
    setAuthError('');
    try {
      const res = await authApi.emailLogin(email.trim(), password);
      await setAuth(res.data.token, null);
    } catch (e) {
      setAuthError(e.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{'\u{1F943}'}</Text>
        <Text style={styles.title}>Whisk</Text>
        <Text style={styles.subtitle}>Your whisky journey starts here</Text>

        <View style={styles.emailLoginSection}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            style={styles.input}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter password"
            style={styles.input}
            error={authError}
          />
          <Button
            title="Login"
            onPress={handleEmailLogin}
            loading={loading === 'email'}
            style={styles.socialBtn}
          />
        </View>

        <Text style={styles.orText}>or continue with</Text>

        <View style={styles.buttons}>
          <Button
            title={'\u{1F310}  Sign in with Google'}
            onPress={handleGoogleSignIn}
            loading={loading === 'google'}
            style={[styles.socialBtn, { backgroundColor: '#4285F4' }]}
          />
          {Platform.OS === 'ios' && (
            <Button
              title={'\u{F8FF}  Sign in with Apple'}
              onPress={handleAppleSignIn}
              loading={loading === 'apple'}
              style={[styles.socialBtn, { backgroundColor: '#000' }]}
            />
          )}
        </View>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devLabel}>Development Only</Text>
            <Button title="Dev Login (User)" onPress={() => handleDevLogin('User')} variant="secondary" loading={loading === 'dev'} />
            <View style={{ height: 8 }} />
            <Button title="Dev Login (Admin)" onPress={() => handleDevLogin('Admin')} variant="outline" loading={loading === 'dev'} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emoji: { fontSize: 72, marginBottom: spacing.md },
  title: { ...typography.h1, fontSize: 42, color: colors.accent, fontWeight: '800', letterSpacing: 2 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl },
  emailLoginSection: { width: '100%', marginBottom: spacing.md },
  input: { marginBottom: spacing.sm },
  orText: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  buttons: { width: '100%', gap: spacing.md },
  socialBtn: { width: '100%' },
  devSection: { marginTop: spacing.xxl, width: '100%', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.warning + '44', borderStyle: 'dashed' },
  devLabel: { color: colors.warning, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
});
