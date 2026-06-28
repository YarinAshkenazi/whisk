import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/Card';
import MatchBadge from '../../components/MatchBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { useTastings, useRecommendationStatus } from '../../hooks/useApi';

export default function TastingsScreen({ navigation }) {
  const { data: tastings, isLoading, refetch } = useTastings();
  const { data: recStatus } = useRecommendationStatus();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTastings = useMemo(() => {
    const list = tastings || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(t => {
      const name = t.whiskeyName || '';
      return name.toLowerCase().includes(q);
    });
  }, [tastings, searchQuery]);

  if (isLoading) return <LoadingScreen />;

  const renderUnlockBanner = () => {
    if (recStatus?.isUnlocked) return null;
    const remaining = (recStatus?.requiredTastings || 3) - (recStatus?.tastingCount || 0);
    return (
      <Card style={styles.banner}>
        <Text style={styles.bannerText}>{'\u{1F512}'} Add {remaining} more tasting{remaining !== 1 ? 's' : ''} to unlock personalized recommendations!</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {renderUnlockBanner()}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tastings by bottle name..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredTastings}
        keyExtractor={i => i.id}
        ListEmptyComponent={<EmptyState icon={'\u{1F4DD}'} title={searchQuery.trim() ? 'No tastings found' : 'No tastings yet'} message={searchQuery.trim() ? '' : 'Add your first tasting from a bottle detail screen'} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EditTasting', { tasting: item })}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>{item.whiskeyName}</Text>
                <Text style={styles.cardDate}>{new Date(item.tastingDate).toLocaleDateString()}</Text>
              </View>
              <MatchBadge percent={item.personalFitPercent} size="sm" />
            </View>
            {item.notes ? <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text> : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.accent} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
  searchInput: { backgroundColor: colors.inputBg || colors.card, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: colors.border, height: 44 },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  banner: { marginHorizontal: spacing.md, marginTop: spacing.md, backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.accent },
  bannerText: { color: colors.text, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardDate: { color: colors.textSecondary, fontSize: 12 },
  cardNotes: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
});
