import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

export default function LoadingScreen({ message }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
});
