import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

const variants = {
  primary: { bg: colors.accent, text: '#FFF' },
  secondary: { bg: colors.card, text: colors.text },
  outline: { bg: 'transparent', text: colors.accent, border: colors.accent },
  danger: { bg: colors.error, text: '#FFF' },
};

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const v = variants[variant] || variants.primary;
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: v.bg }, v.border && { borderWidth: 1.5, borderColor: v.border }, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator color={v.text} /> : <Text numberOfLines={1} style={[styles.text, { color: v.text }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  text: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
