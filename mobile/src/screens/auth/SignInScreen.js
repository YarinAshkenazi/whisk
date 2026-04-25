import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function SignInScreen() {
  const [loading, setLoading] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const { setAuth } = useAuthStore();

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      Alert.alert('Google Sign-In', 'Configure Google OAuth credentials in app.json and backend. For dev testing, use Dev Login below.');
    } catch (e) {
      Alert.alert('Error', e.message);
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
      const email = role === 'Admin' ? 'admin@whisk.dev' : 'user@whisk.dev';
      const res = await authApi.devLogin(email, role);
      await setAuth(res.data.token, null);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to connect to server. Make sure the backend is running.');
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
