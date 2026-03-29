import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function DeltaSlider({ label, value, onChange, leftLabel = 'Too weak', rightLabel = 'Too strong' }) {
  const dots = [];
  for (let i = -5; i <= 5; i++) {
    const isActive = i === value;
    const isPositive = i > 0;
    const isNegative = i < 0;
    const dotColor = isActive
      ? (i === 0 ? colors.success : isPositive ? colors.error : colors.warning)
      : colors.border;
    dots.push(
      <TouchableOpacity key={i} onPress={() => onChange(i)} style={styles.dotWrapper}>
        <View style={[styles.dot, { backgroundColor: dotColor }, isActive && styles.dotActive]} />
        {(i === -5 || i === 0 || i === 5) && <Text style={styles.dotLabel}>{i}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: <Text style={styles.value}>{value}</Text></Text>
      <View style={styles.sliderRow}>{dots}</View>
      <View style={styles.labelRow}>
        <Text style={styles.edgeLabel}>{leftLabel}</Text>
        <Text style={[styles.edgeLabel, { color: colors.success }]}>Perfect</Text>
        <Text style={styles.edgeLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: spacing.sm },
  value: { color: colors.accent },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  dotWrapper: { alignItems: 'center', padding: 4 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotActive: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#FFF' },
  dotLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 },
  edgeLabel: { color: colors.textMuted, fontSize: 10 },
});
