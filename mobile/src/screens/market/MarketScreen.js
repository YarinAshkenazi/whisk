import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import WhiskeyCard from '../../components/WhiskeyCard';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import Card from '../../components/Card';
import MatchBadge from '../../components/MatchBadge';
import { useWhiskies, useRecommendations, useRecommendationStatus } from '../../hooks/useApi';

export default function MarketScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({});

  const params = { search, page, pageSize: 20, sortBy, sortDesc: false, ...filters };
  const { data, isLoading, refetch } = useWhiskies(params);
  const { data: recs } = useRecommendations();
  const { data: recStatus } = useRecommendationStatus();

  const renderRecommendations = () => {
    if (!recStatus?.isUnlocked) {
      return (
        <Card style={styles.recCard}>
          <Text style={styles.recTitle}>{'\u2728'} Recommendations</Text>
          <Text style={styles.recLocked}>Add {(recStatus?.requiredTastings || 3) - (recStatus?.tastingCount || 0)} more tastings to unlock personalized recommendations</Text>
        </Card>
      );
    }
    if (!recs?.length) return null;
    return (
      <Card style={styles.recCard}>
        <Text style={styles.recTitle}>{'\u2728'} Recommended for You</Text>
        <FlatList
          horizontal
          data={recs.slice(0, 6)}
          keyExtractor={i => i.whiskeyId}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recItem} onPress={() => navigation.navigate('BottleDetail', { id: item.whiskeyId })}>
              <MatchBadge percent={item.matchPercent} size="sm" />
              <Text style={styles.recName} numberOfLines={2}>{item.whiskeyName}</Text>
            </TouchableOpacity>
          )}
        />
      </Card>
    );
  };

  const sortOptions = ['name', 'price', 'age', 'match'];

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search whiskies..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1); }}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('Filters', { filters, setFilters: (f) => { setFilters(f); setPage(1); } })}>
          <Text style={styles.filterIcon}>{'\u{1F50D}'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortRow}>
        {sortOptions.map(s => (
          <TouchableOpacity key={s} onPress={() => setSortBy(s)} style={[styles.sortChip, sortBy === s && styles.sortChipActive]}>
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.requestBtn} onPress={() => navigation.navigate('RequestBottle')}>
          <Text style={styles.requestText}>+ Request</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !data ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={i => i.id}
          ListHeaderComponent={renderRecommendations}
          ListEmptyComponent={<EmptyState icon={'\u{1F943}'} title="No whiskies found" message="Try adjusting your search or filters" />}
          renderItem={({ item }) => (
            <WhiskeyCard whiskey={item} onPress={() => navigation.navigate('BottleDetail', { id: item.id })} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.accent} />}
          onEndReached={() => { if (data && data.items.length < data.totalCount) setPage(p => p + 1); }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  filterBtn: { backgroundColor: colors.card, borderRadius: borderRadius.sm, width: 44, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 20 },
  sortRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm, gap: spacing.xs, flexWrap: 'wrap' },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  sortChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  sortTextActive: { color: '#FFF' },
  requestBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.gold, marginLeft: 'auto' },
  requestText: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  recCard: { marginBottom: spacing.md },
  recTitle: { ...typography.h3, color: colors.accent, marginBottom: spacing.sm },
  recLocked: { color: colors.textSecondary, fontSize: 13 },
  recItem: { width: 80, alignItems: 'center', marginRight: spacing.md },
  recName: { color: colors.text, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
