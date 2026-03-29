import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function EmptyState({ icon = '\u{1F943}', title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  message: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
