import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Button from '../../components/Button';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminWhiskies } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminWhiskiesScreen({ navigation }) {
  const { data: whiskies, isLoading } = useAdminWhiskies();
  const qc = useQueryClient();

  if (isLoading) return <LoadingScreen />;

  const handleDelete = (w) => {
    Alert.alert('Deactivate', `Deactivate ${w.name}?`, [
      { text: 'Cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        await adminApi.deleteWhiskey(w.id);
        qc.invalidateQueries({ queryKey: ['adminWhiskies'] });
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <Button title="+ Add Whiskey" onPress={() => navigation.navigate('AdminEditWhiskey', { whiskey: null })} style={{ margin: spacing.md }} />
      <FlatList
        data={whiskies || []}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isActive && styles.cardInactive]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.brand} \u2022 {item.categoryName}</Text>
                <Text style={styles.price}>{'\u20AA'}{item.minMarketPriceIls} - {item.maxMarketPriceIls}</Text>
              </View>
              {!item.isActive && <Text style={styles.inactive}>Inactive</Text>}
            </View>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => navigation.navigate('AdminEditWhiskey', { whiskey: item })} variant="secondary" style={{ flex: 1, marginRight: 8 }} />
              <Button title="Deactivate" onPress={() => handleDelete(item)} variant="danger" style={{ flex: 1 }} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardInactive: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  price: { color: colors.gold, fontSize: 13, fontWeight: '600', marginTop: 4 },
  inactive: { color: colors.error, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: spacing.md },
});
