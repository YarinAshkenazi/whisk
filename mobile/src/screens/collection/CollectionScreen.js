import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/Card';
import StatusChip from '../../components/StatusChip';
import BarrelLevel from '../../components/BarrelLevel';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { useCollection, useCollectionSummary } from '../../hooks/useApi';

export default function CollectionScreen({ navigation }) {
  const { data: items, isLoading, refetch } = useCollection();
  const { data: summary } = useCollectionSummary();

  if (isLoading) return <LoadingScreen />;

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <Card style={styles.summaryCard}>
        <View style={styles.levelRow}>
          <BarrelLevel level={summary.barrelLevel} totalBottles={summary.totalBottles} />
          <TouchableOpacity style={styles.crownBtn} onPress={() => navigation.navigate('WhiskPros')} activeOpacity={0.7}>
            <Text style={styles.crownIcon}>{'\u{1F451}'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <StatItem label="Closed" value={summary.closedBottles} />
          <StatItem label="Cost" value={`\u20AA${summary.totalPurchaseCost?.toFixed(0)}`} />
          <StatItem label="Value" value={`\u20AA${summary.totalMarketValue?.toFixed(0)}`} />
          <StatItem label="P/L" value={`\u20AA${summary.profitLoss?.toFixed(0)}`} color={summary.profitLoss >= 0 ? colors.success : colors.error} />
          <StatItem label="Total Spent" value={`\u20AA${summary.totalSpent?.toFixed(0)}`} />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items || []}
        keyExtractor={i => i.id}
        ListHeaderComponent={renderSummary}
        ListEmptyComponent={<EmptyState icon={'\u{1F4E6}'} title="Collection empty" message="Add bottles from the market" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EditCollection', { item })}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>{item.whiskeyName}</Text>
                <StatusChip status={item.status} />
              </View>
              <View style={styles.cardRight}>
                {item.purchasePriceIls != null && <Text style={styles.cardPrice}>Paid: {'\u20AA'}{item.purchasePriceIls?.toFixed(0)}</Text>}
                {item.currentMarketValue != null && <Text style={styles.cardValue}>Value: {'\u20AA'}{item.currentMarketValue?.toFixed(0)}</Text>}
              </View>
            </View>
            {item.notes ? <Text style={styles.cardNotes} numberOfLines={1}>{item.notes}</Text> : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.accent} />}
      />
    </View>
  );
}

function StatItem({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryCard: { marginBottom: spacing.md },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  crownBtn: { padding: 8, borderRadius: borderRadius.sm, backgroundColor: colors.surface },
  crownIcon: { fontSize: 22 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  statItem: { alignItems: 'center', minWidth: 60 },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { color: colors.textSecondary, fontSize: 12 },
  cardValue: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  cardNotes: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
