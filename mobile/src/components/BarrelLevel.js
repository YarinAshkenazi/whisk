import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function BarrelLevel({ level = 0, totalBottles = 0 }) {
  const barrels = [];
  for (let i = 0; i < 5; i++) {
    barrels.push(
      <Text key={i} style={[styles.barrel, i < level && styles.barrelActive]}>
        {i < level ? '\u{1F6E2}' : '\u{26AA}'}
      </Text>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.row}>{barrels}</View>
      <Text style={styles.label}>Level {level} \u2022 {totalBottles} bottles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.sm },
  row: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  barrel: { fontSize: 22 },
  barrelActive: { opacity: 1 },
  label: { color: colors.textSecondary, fontSize: 12 },
});
