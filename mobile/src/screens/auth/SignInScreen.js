import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
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
    setLoading('dev');
    setAuthError('');
    try {
      const devEmail = role === 'Admin' ? 'admin@whisk.dev' : 'user@whisk.dev';
      const res = await authApi.devLogin(devEmail, role);
      await setAuth(res.data.token, null);
    } catch (e) {
      const msg = e.response?.data?.error
        || (e.response ? `Server returned ${e.response.status}` : `Network error: ${e.message}`);
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(null);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password) {
      setAuthError('Please enter email and password');
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
    }

    setLoading('email');
    setAuthError('');
    try {
      const res = isRegister
        ? await authApi.emailRegister(email.trim(), password)
        : await authApi.emailLogin(email.trim(), password);
      await setAuth(res.data.token, null);
    } catch (e) {
      setAuthError(
        e.response?.data?.error || (isRegister ? 'Registration failed' : 'Invalid email or password')
      );
    } finally {
      setLoading(null);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setAuthError('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>{'\u{1F943}'}</Text>
          <Text style={styles.title}>Whisk</Text>
          <Text style={styles.subtitle}>Your whisky journey starts here</Text>

          <View style={styles.emailSection}>
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
              placeholder={isRegister ? 'Create a password' : 'Enter password'}
              style={styles.input}
            />
            {isRegister && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Re-enter password"
                style={styles.input}
              />
            )}
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
            <Button
              title={isRegister ? 'Create Account' : 'Login'}
              onPress={handleEmailSubmit}
              loading={loading === 'email'}
              style={styles.socialBtn}
            />
            <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>
                {isRegister
                  ? 'Already have an account? Log in'
                  : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  emoji: { fontSize: 72, marginBottom: spacing.md },
  title: { ...typography.h1, fontSize: 42, color: colors.accent, fontWeight: '800', letterSpacing: 2 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl },
  emailSection: { width: '100%', marginBottom: spacing.md },
  input: { marginBottom: spacing.sm },
  errorText: { color: colors.error || '#F44336', fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
  toggleBtn: { marginTop: spacing.sm, alignItems: 'center' },
  toggleText: { color: colors.accent, fontSize: 14 },
  orText: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  buttons: { width: '100%', gap: spacing.md },
  socialBtn: { width: '100%' },
  devSection: { marginTop: spacing.xxl, width: '100%', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.warning + '44', borderStyle: 'dashed' },
  devLabel: { color: colors.warning, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
});
