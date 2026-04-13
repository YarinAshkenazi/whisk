import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import Button from './Button';

export default function LockScreen({ onUnlock }) {
  useEffect(() => {
    onUnlock();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'\uD83E\uDD43'}</Text>
      <Text style={styles.title}>Unlock Whisk</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      <Button title="Unlock" onPress={onUnlock} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: { fontSize: 72, marginBottom: spacing.lg },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: { width: '100%', maxWidth: 260 },
});
