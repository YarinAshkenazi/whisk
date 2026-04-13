import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../theme';

export default function MatchBadge({ percent, size = 'md' }) {
  if (percent == null) return null;
  const color = percent >= 75 ? colors.success : percent >= 50 ? colors.amber : colors.error;
  const sz = size === 'lg' ? 56 : size === 'sm' ? 32 : 42;
  const baseFontSize = size === 'lg' ? 16 : size === 'sm' ? 10 : 13;
  const fs = percent >= 100 ? baseFontSize - 2 : baseFontSize;

  return (
    <View style={[styles.badge, { width: sz, height: sz, borderColor: color }]}>
      <Text numberOfLines={1} style={[styles.text, { fontSize: fs, color }]}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: borderRadius.full, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  text: { fontWeight: '700' },
});
