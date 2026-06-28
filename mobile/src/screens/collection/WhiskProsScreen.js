import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { useLeaderboard } from '../../hooks/useApi';

const SORT_OPTIONS = [
  { key: 'profitLoss', label: 'P/L' },
  { key: 'closedBottles', label: 'Bottles' },
  { key: 'marketValue', label: 'Value' },
];

export default function WhiskProsScreen() {
  const { data, isLoading, isError, refetch } = useLeaderboard();
  const [sortBy, setSortBy] = useState('profitLoss');

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  if (isLoading) return <LoadingScreen />;

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load leaderboard</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{'\u{1F451}'} Whisk Pros</Text>
        <Text style={styles.subtitle}>Top collectors by closed bottle performance</Text>
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
            onPress={() => setSortBy(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={
          <EmptyState
            icon={'\u{1F451}'}
            title="No pros yet"
            message="Closed bottle collections will appear here once users add sealed bottles."
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, index < 3 && styles.rankTop]}>#{index + 1}</Text>
            <View style={styles.infoCol}>
              <Text style={styles.nickname} numberOfLines={1}>{item.nickname}</Text>
              <View style={styles.metricsRow}>
                <Text style={styles.metricText}>Bottles: {item.closedBottles}</Text>
                <Text style={styles.metricText}>Value: {'\u20AA'}{item.marketValue?.toFixed(0)}</Text>
                <Text style={[styles.metricText, item.profitLoss >= 0 ? styles.plPositive : styles.plNegative]}>
                  P/L: {item.profitLoss >= 0 ? '+' : ''}{'\u20AA'}{item.profitLoss?.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.accent} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: 15, marginBottom: spacing.md },
  retryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.accent, borderRadius: borderRadius.sm },
  retryText: { color: colors.text, fontWeight: '600' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.h2, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13 },
  sortRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  sortChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  sortChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  sortChipTextActive: { color: colors.text, fontWeight: '600' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  rank: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, width: 36 },
  rankTop: { color: colors.gold || colors.accent },
  infoCol: { flex: 1 },
  nickname: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricText: { color: colors.textSecondary, fontSize: 12 },
  plPositive: { color: colors.success, fontWeight: '600' },
  plNegative: { color: colors.error, fontWeight: '600' },
});
