import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme';

export default function Card({ children, onPress, style }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.card },
});
