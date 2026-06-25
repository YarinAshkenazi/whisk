import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminDashboard } from '../../hooks/useApi';

export default function AdminDashboardScreen() {
  const { data, isLoading } = useAdminDashboard();
  if (isLoading) return <LoadingScreen />;

  const f1Display = data?.f1Score != null
    ? `${(data.f1Score * 100).toFixed(1)}%`
    : (data?.f1SampleSize != null ? `${data.f1SampleSize} samples` : null);

  const stats = [
    { label: 'Total Users', value: data?.totalUsers, icon: '\u{1F465}' },
    { label: 'Active Users', value: data?.activeUsers, icon: '\u{2705}' },
    { label: 'Whiskies', value: data?.totalWhiskies, icon: '\u{1F943}' },
    { label: 'Tastings', value: data?.totalTastings, icon: '\u{1F4DD}' },
    { label: 'Collection Items', value: data?.totalCollectionItems, icon: '\u{1F4E6}' },
    { label: 'Pending Requests', value: data?.pendingRequests, icon: '\u{23F3}' },
    { label: 'F1 Score', value: f1Display ?? 'Not enough data', icon: '\u{1F3AF}' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{'\u{1F4CA}'} Dashboard</Text>
      <View style={styles.grid}>
        {stats.map((s, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value ?? '-'}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', alignItems: 'center', padding: spacing.lg },
  statIcon: { fontSize: 28, marginBottom: spacing.sm },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.accent },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
});
