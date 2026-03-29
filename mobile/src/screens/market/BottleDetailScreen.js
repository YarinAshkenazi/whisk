import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getWhiskeyImageUrl } from '../../constants';
import Button from '../../components/Button';
import MatchBadge from '../../components/MatchBadge';
import LoadingScreen from '../../components/LoadingScreen';
import { useWhiskey } from '../../hooks/useApi';

function ProfileBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  return (
    <View style={styles.profileBar}>
      <Text style={styles.profileLabel}>{label}</Text>
      <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

export default function BottleDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { data: w, isLoading } = useWhiskey(id);

  if (isLoading || !w) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={getWhiskeyImageUrl(w.imageUrl) ? { uri: getWhiskeyImageUrl(w.imageUrl) } : undefined} style={styles.image} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{w.name}</Text>
          <Text style={styles.brand}>{w.brand}</Text>
        </View>
        <MatchBadge percent={w.matchPercent} size="lg" />
      </View>

      <View style={styles.metaRow}>
        <MetaItem label="Category" value={w.categoryName} />
        <MetaItem label="Age" value={w.age ? `${w.age} yr` : 'NAS'} />
        <MetaItem label="ABV" value={`${w.alcoholPercentage}%`} />
        <MetaItem label="Volume" value={`${w.volumeML}ml`} />
      </View>
      <View style={styles.metaRow}>
        <MetaItem label="Country" value={w.country} />
        <MetaItem label="Region" value={w.region} />
        <MetaItem label="Distillery" value={w.distillery} />
      </View>

      <Text style={styles.description}>{w.description}</Text>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Market Price (ILS)</Text>
        <Text style={styles.price}>{'\u20AA'}{w.minMarketPriceIls?.toFixed(0)} - {w.maxMarketPriceIls?.toFixed(0)}</Text>
        <Text style={styles.priceAvg}>Avg: {'\u20AA'}{w.avgMarketPriceIls?.toFixed(0)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Flavor Profile</Text>
      <ProfileBar label="Body" value={w.bodyProfile} />
      <ProfileBar label="Smokiness" value={w.smokinessProfile} />
      <ProfileBar label="Sweetness" value={w.sweetnessProfile} />
      <ProfileBar label="Alcohol" value={w.alcoholProfile || (w.alcoholPercentage / 10)} />

      <View style={styles.actions}>
        <Button title="Add Tasting" onPress={() => navigation.navigate('AddTasting', { whiskeyId: w.id, whiskeyName: w.name })} />
        <Button title="Add to Collection" onPress={() => navigation.navigate('AddCollection', { whiskeyId: w.id, whiskeyName: w.name })} variant="secondary" style={{ marginTop: spacing.sm }} />
      </View>
    </ScrollView>
  );
}

function MetaItem({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  image: { width: '100%', height: 250, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.lg },
  name: { ...typography.h2, marginBottom: 4 },
  brand: { color: colors.accent, fontSize: 16, fontWeight: '500' },
  metaRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md, flexWrap: 'wrap' },
  metaItem: { minWidth: 80 },
  metaLabel: { color: colors.textMuted, fontSize: 11 },
  metaValue: { color: colors.text, fontSize: 14, fontWeight: '500' },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  priceCard: { backgroundColor: colors.card, margin: spacing.lg, padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  priceLabel: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.gold, fontSize: 24, fontWeight: '700', marginTop: 4 },
  priceAvg: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  profileBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  profileLabel: { width: 80, color: colors.textSecondary, fontSize: 13 },
  barBg: { flex: 1, height: 8, backgroundColor: colors.surface, borderRadius: 4, marginHorizontal: spacing.sm },
  barFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  profileValue: { width: 30, color: colors.text, fontSize: 13, textAlign: 'right' },
  actions: { padding: spacing.lg },
});
