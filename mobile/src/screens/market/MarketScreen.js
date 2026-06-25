import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import WhiskeyCard from '../../components/WhiskeyCard';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import Card from '../../components/Card';
import MatchBadge from '../../components/MatchBadge';
import { useWhiskies, useRecommendations, useRecommendationStatus } from '../../hooks/useApi';

const PAGE_SIZE = 20;
const SORT_OPTIONS = ['name', 'price', 'age', 'match'];

const MarketCard = React.memo(function MarketCard({ whiskey, onNavigate }) {
  return (
    <WhiskeyCard
      whiskey={whiskey}
      onPress={() => onNavigate(whiskey.id)}
    />
  );
});

export default function MarketScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [filters, setFilters] = useState({});
  const [allItems, setAllItems] = useState([]);
  const totalCountRef = useRef(0);
  const loadingPageRef = useRef(false);

  const params = useMemo(
    () => ({ search, page, pageSize: PAGE_SIZE, sortBy, sortDesc, ...filters }),
    [search, page, sortBy, sortDesc, filters],
  );
  const { data, isLoading, isFetching, refetch } = useWhiskies(params);
  const { data: recs } = useRecommendations();
  const { data: recStatus } = useRecommendationStatus();

  useEffect(() => {
    if (!data?.items) return;
    loadingPageRef.current = false;
    totalCountRef.current = data.totalCount ?? 0;
    setAllItems(prev => {
      if (page === 1) return data.items;
      const ids = new Set(prev.map(i => i.id));
      const fresh = data.items.filter(i => !ids.has(i.id));
      if (fresh.length === 0) return prev;
      return [...prev, ...fresh];
    });
  }, [data, page]);

  const navigateToBottle = useCallback((id) => {
    navigation.navigate('BottleDetail', { id });
  }, [navigation]);

  const handleSearch = useCallback((t) => {
    setSearch(t);
    setPage(1);
    setAllItems([]);
  }, []);

  const handleSort = useCallback((s) => {
    setSortBy(prev => {
      if (prev === s) {
        setSortDesc(d => !d);
        return prev;
      }
      setSortDesc(false);
      return s;
    });
    setPage(1);
    setAllItems([]);
  }, []);

  const handleEndReached = useCallback(() => {
    if (loadingPageRef.current || isFetching) return;
    if (allItems.length < totalCountRef.current) {
      loadingPageRef.current = true;
      setPage(p => p + 1);
    }
  }, [isFetching, allItems.length]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const renderItem = useCallback(({ item }) => (
    <MarketCard whiskey={item} onNavigate={navigateToBottle} />
  ), [navigateToBottle]);

  const keyExtractor = useCallback((item) => item.id, []);

  const recommendations = useMemo(() => {
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
  }, [recStatus, recs, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Filters', { filters, setFilters: (f) => { setFilters(f); setPage(1); } })} activeOpacity={0.7}>
          <Ionicons name="filter" size={22} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search whiskies..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('GiftForFriend')} activeOpacity={0.7}>
          <Text style={styles.iconBtnText}>{'\u{1F381}'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(s => (
          <TouchableOpacity key={s} onPress={() => handleSort(s)} style={[styles.sortChip, sortBy === s && styles.sortChipActive]}>
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}{sortBy === s ? (sortDesc ? ' \u2193' : ' \u2191') : ''}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.requestBtn} onPress={() => navigation.navigate('RequestBottle')}>
          <Text style={styles.requestText}>+ Request</Text>
        </TouchableOpacity>
      </View>

      {isLoading && allItems.length === 0 ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={keyExtractor}
          ListHeaderComponent={recommendations}
          ListEmptyComponent={<EmptyState icon={'\u{1F943}'} title="No whiskies found" message="Try adjusting your search or filters" />}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.accent} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={11}
          initialNumToRender={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: colors.border, height: 44 },
  iconBtn: { backgroundColor: colors.card, borderRadius: borderRadius.sm, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 20 },
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
