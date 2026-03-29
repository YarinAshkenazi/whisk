import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';
import MatchBadge from './MatchBadge';

export default function WhiskeyCard({ whiskey, onPress, showMatch = true }) {
  const avg = ((whiskey.minMarketPriceIls || 0) + (whiskey.maxMarketPriceIls || 0)) / 2;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: whiskey.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{whiskey.name}</Text>
        <Text style={styles.brand}>{whiskey.brand}</Text>
        <Text style={styles.category}>{whiskey.categoryName}{whiskey.age ? ` \u2022 ${whiskey.age}yr` : ''}</Text>
        <Text style={styles.price}>\u20AA{whiskey.minMarketPriceIls?.toFixed(0)} - {whiskey.maxMarketPriceIls?.toFixed(0)}</Text>
      </View>
      {showMatch && <View style={styles.matchContainer}><MatchBadge percent={whiskey.matchPercent} /></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.sm + 2, marginBottom: spacing.sm + 2, ...shadows.card, alignItems: 'center' },
  image: { width: 60, height: 80, borderRadius: borderRadius.sm, backgroundColor: colors.surface, marginRight: spacing.md },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  brand: { color: colors.accent, fontSize: 13, fontWeight: '500', marginBottom: 2 },
  category: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  price: { color: colors.gold, fontSize: 14, fontWeight: '600' },
  matchContainer: { marginLeft: spacing.sm },
});
