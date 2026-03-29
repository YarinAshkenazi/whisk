import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../theme';
import { STATUS_COLORS } from '../constants';

export default function StatusChip({ status }) {
  const color = STATUS_COLORS[status] || '#888';
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderRadius: borderRadius.full, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
});
