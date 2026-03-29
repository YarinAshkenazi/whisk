import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/Card';
import MatchBadge from '../../components/MatchBadge';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { useTastings, useRecommendationStatus } from '../../hooks/useApi';

export default function TastingsScreen({ navigation }) {
  const { data: tastings, isLoading, refetch } = useTastings();
  const { data: recStatus } = useRecommendationStatus();

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
      <FlatList
        data={tastings || []}
        keyExtractor={i => i.id}
        ListEmptyComponent={<EmptyState icon={'\u{1F4DD}'} title="No tastings yet" message="Add your first tasting from a bottle detail screen" />}
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
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  banner: { marginHorizontal: spacing.md, marginTop: spacing.md, backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: colors.accent },
  bannerText: { color: colors.text, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardDate: { color: colors.textSecondary, fontSize: 12 },
  cardNotes: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
});
