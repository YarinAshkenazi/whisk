import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Button from '../../components/Button';
import StatusChip from '../../components/StatusChip';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminUsers } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminUsersScreen() {
  const { data: users, isLoading } = useAdminUsers();
  const qc = useQueryClient();

  if (isLoading) return <LoadingScreen />;

  const toggleStatus = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (e) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    Alert.alert('Change Role', `Set ${user.nickname} to ${newRole}?`, [
      { text: 'Cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          await adminApi.updateUserRole(user.id, newRole);
          qc.invalidateQueries({ queryKey: ['adminUsers'] });
        } catch (e) {
          Alert.alert('Error', 'Failed to update role');
        }
      }},
    ]);
  };

  return (
    <FlatList
      style={styles.container}
      data={users || []}
      keyExtractor={i => i.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nickname}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>{item.country} {'\u2022'} {item.role} {'\u2022'} {item.tastingCount} tastings {'\u2022'} {item.collectionCount} bottles</Text>
            </View>
            <StatusChip status={item.isActive ? 'Active' : 'Inactive'} />
          </View>
          <View style={styles.actions}>
            <Button title={item.isActive ? 'Deactivate' : 'Activate'} onPress={() => toggleStatus(item)} variant={item.isActive ? 'danger' : 'primary'} style={{ flex: 1, marginRight: 8 }} />
            <Button title={item.role === 'Admin' ? 'Demote' : 'Promote'} onPress={() => toggleRole(item)} variant="outline" style={{ flex: 1 }} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  email: { color: colors.textSecondary, fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: spacing.md },
});
