import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import Button from '../../components/Button';
import StatusChip from '../../components/StatusChip';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import { useAdminRequests } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminRequestsScreen({ navigation }) {
  const { data: requests, isLoading } = useAdminRequests();
  const qc = useQueryClient();

  if (isLoading) return <LoadingScreen />;

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await adminApi.approveRequest(id);
      } else {
        await adminApi.rejectRequest(id);
      }
      qc.invalidateQueries({ queryKey: ['adminRequests'] });
    } catch (e) {
      Alert.alert('Error', 'Action failed');
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={requests || []}
      keyExtractor={i => i.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState icon={'\u{1F4E8}'} title="No requests" />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.user}>From: {item.userNickname}</Text>
            </View>
            <StatusChip status={item.status} />
          </View>
          {item.details && <Text style={styles.details}>{item.details}</Text>}
          {item.status === 'Pending' && (
            <View style={styles.actions}>
              <Button title="Approve" onPress={() => handleAction(item.id, 'approve')} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Reject" onPress={() => handleAction(item.id, 'reject')} variant="danger" style={{ flex: 1 }} />
            </View>
          )}
          {item.status === 'Approved' && !item.approvedWhiskeyId && (
            <Button title="Create Whiskey from Request" onPress={() => navigation.navigate('AdminEditWhiskey', { whiskey: null, prefill: { requestId: item.id, name: item.name, brand: item.brand, details: item.details } })} variant="secondary" style={{ marginTop: spacing.sm }} />
          )}
          {item.status === 'Pending' && (
            <Button title="Approve & Create Whiskey" onPress={async () => {
              try {
                await adminApi.approveRequest(item.id);
                qc.invalidateQueries({ queryKey: ['adminRequests'] });
                navigation.navigate('AdminEditWhiskey', { whiskey: null, prefill: { requestId: item.id, name: item.name, brand: item.brand, details: item.details } });
              } catch (e) { Alert.alert('Error', 'Failed to approve'); }
            }} variant="secondary" style={{ marginTop: spacing.xs }} />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  brand: { color: colors.accent, fontSize: 13 },
  user: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  details: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm },
  actions: { flexDirection: 'row', marginTop: spacing.md },
});
