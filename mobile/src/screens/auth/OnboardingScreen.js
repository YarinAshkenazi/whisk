import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { profileApi } from '../../api/profile';
import { useAuthStore } from '../../store/authStore';
import { COUNTRIES } from '../../constants';

export default function OnboardingScreen() {
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth, token, logout } = useAuthStore();

  const handleComplete = async () => {
    if (!nickname.trim()) return Alert.alert('Required', 'Please enter a nickname');
    if (!country.trim()) return Alert.alert('Required', 'Please select a country');
    if (!isOver18) return Alert.alert('Required', 'You must confirm you are 18+');
    if (!acceptTerms) return Alert.alert('Required', 'You must accept terms');

    setLoading(true);
    try {
      const res = await profileApi.completeOnboarding({ nickname: nickname.trim(), country: country.trim(), isOver18, acceptTerms });
      await setAuth(res.data.token, null);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>{'\u{1F943}'}</Text>
        <Text style={styles.title}>Welcome to Whisk</Text>
        <Text style={styles.subtitle}>Complete your profile to get started</Text>

        <Input label="Nickname" value={nickname} onChangeText={setNickname} placeholder="Your whisky alias" />
        <Input label="Country" value={country} onChangeText={setCountry} placeholder="e.g., Israel" />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>I confirm I am 18 or older</Text>
          <Switch value={isOver18} onValueChange={setIsOver18} trackColor={{ true: colors.accent }} thumbColor="#FFF" />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>I accept the Terms of Service</Text>
          <Switch value={acceptTerms} onValueChange={setAcceptTerms} trackColor={{ true: colors.accent }} thumbColor="#FFF" />
        </View>

        <Button title="Start My Whisky Journey" onPress={handleComplete} loading={loading} style={{ marginTop: spacing.lg }} />

        <TouchableOpacity onPress={logout} style={styles.signOutLink}>
          <Text style={styles.signOutText}>Sign out and start over</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingTop: spacing.xxl * 1.5 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, textAlign: 'center', color: colors.accent },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.xl },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  switchLabel: { color: colors.text, fontSize: 15, flex: 1, marginRight: spacing.md },
  signOutLink: { marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.md },
  signOutText: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
});
