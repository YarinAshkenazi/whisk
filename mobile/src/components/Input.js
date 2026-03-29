import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  input: { backgroundColor: colors.inputBg, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 12, marginTop: 4 },
});
