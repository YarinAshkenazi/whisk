import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const barrelImg = require('../../assets/barrel.png');

export default function BarrelLevel({ level = 0, totalBottles = 0 }) {
  const barrels = [];
  for (let i = 0; i < 5; i++) {
    barrels.push(
      <View key={i} style={[styles.barrelWrap, i >= level && styles.barrelInactive]}>
        <Image source={barrelImg} style={styles.barrelImg} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.row}>{barrels}</View>
      <Text style={styles.label}>Level {level} {'\u2022'} {totalBottles} bottles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.sm },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  barrelWrap: { width: 30, height: 36 },
  barrelInactive: { opacity: 0.25 },
  barrelImg: { width: 30, height: 36, resizeMode: 'contain' },
  label: { color: colors.textSecondary, fontSize: 12 },
});
