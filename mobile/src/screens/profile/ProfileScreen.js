import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import BarrelLevel from '../../components/BarrelLevel';
import LoadingScreen from '../../components/LoadingScreen';
import { useProfile } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';
import { profileApi } from '../../api/profile';
import { USER_ROLES } from '../../constants';

export default function ProfileScreen({ navigation }) {
  const { data: profile, isLoading } = useProfile();
  const { logout, user } = useAuthStore();

  if (isLoading) return <LoadingScreen />;

  const isAdmin = profile?.role === USER_ROLES.ADMIN;

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will deactivate your account. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await profileApi.deleteAccount();
          await logout();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete account');
        }
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.avatar}>{'\u{1F464}'}</Text>
        <Text style={styles.name}>{profile?.nickname}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <Text style={styles.country}>{profile?.country}</Text>
        {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminText}>Admin</Text></View>}
      </View>

      <Card style={styles.levelCard}>
        <BarrelLevel level={profile?.barrelLevel || 0} />
      </Card>

      <Button title="Edit Profile" onPress={() => navigation.navigate('EditProfile', { profile })} variant="secondary" />

      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Admin Area</Text>
          <Button title="Dashboard" onPress={() => navigation.navigate('AdminDashboard')} variant="secondary" style={styles.adminBtn} />
          <Button title="Manage Users" onPress={() => navigation.navigate('AdminUsers')} variant="secondary" style={styles.adminBtn} />
          <Button title="Manage Whiskies" onPress={() => navigation.navigate('AdminWhiskies')} variant="secondary" style={styles.adminBtn} />
          <Button title="Bottle Requests" onPress={() => navigation.navigate('AdminRequests')} variant="secondary" style={styles.adminBtn} />
          <Button title="Categories" onPress={() => navigation.navigate('AdminCategories')} variant="secondary" style={styles.adminBtn} />
        </View>
      )}

      <View style={styles.dangerZone}>
        <Button title="Sign Out" onPress={logout} variant="outline" />
        <Button title="Delete Account" onPress={handleDeleteAccount} variant="danger" style={{ marginTop: spacing.sm }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { fontSize: 64, marginBottom: spacing.sm },
  name: { ...typography.h2, marginBottom: 2 },
  email: { color: colors.textSecondary, fontSize: 14 },
  country: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  adminBadge: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: spacing.sm },
  adminText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  levelCard: { marginBottom: spacing.md },
  adminSection: { marginTop: spacing.xl, padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md, color: colors.accent },
  adminBtn: { marginBottom: spacing.sm },
  dangerZone: { marginTop: spacing.xxl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
