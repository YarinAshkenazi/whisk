import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Button from '../../components/Button';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminWhiskies } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminWhiskiesScreen({ navigation }) {
  const { data: whiskies, isLoading } = useAdminWhiskies();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!whiskies) return [];
    const q = search.trim().toLowerCase();
    if (!q) return whiskies;
    return whiskies.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.brand.toLowerCase().includes(q) ||
      (w.categoryName && w.categoryName.toLowerCase().includes(q))
    );
  }, [whiskies, search]);

  if (isLoading) return <LoadingScreen />;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['adminWhiskies'] });
    qc.invalidateQueries({ queryKey: ['whiskies'] });
  };

  const handleToggleStatus = (w) => {
    const action = w.isActive ? 'Deactivate' : 'Activate';
    Alert.alert(action, `${action} ${w.name}?`, [
      { text: 'Cancel' },
      { text: action, style: w.isActive ? 'destructive' : 'default', onPress: async () => {
        try {
          await adminApi.updateWhiskeyStatus(w.id, !w.isActive);
          invalidate();
        } catch (e) {
          Alert.alert('Error', e.response?.data?.error || `Failed to ${action.toLowerCase()}`);
        }
      }},
    ]);
  };

  const handleDelete = (w) => {
    Alert.alert(
      'Delete Permanently',
      `This will permanently delete "${w.name}". This cannot be undone.\n\nIf this whiskey has tastings or collection entries, it cannot be deleted — deactivate it instead.`,
      [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminApi.deleteWhiskey(w.id);
            invalidate();
          } catch (e) {
            Alert.alert('Cannot Delete', e.response?.data?.error || 'Failed to delete whiskey');
          }
        }},
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, brand, or category..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        <Button title="+ Add Whiskey" onPress={() => navigation.navigate('AdminEditWhiskey', { whiskey: null })} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isActive && styles.cardInactive]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.brand} {'\u2022'} {item.categoryName}</Text>
                <Text style={styles.price}>₪{item.minMarketPriceIls} - ₪{item.maxMarketPriceIls}</Text>
              </View>
              {!item.isActive && <Text style={styles.inactive}>Inactive</Text>}
            </View>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => navigation.navigate('AdminEditWhiskey', { whiskey: item })} variant="secondary" style={{ flex: 1, marginRight: 8 }} />
              <Button
                title={item.isActive ? 'Deactivate' : 'Activate'}
                onPress={() => handleToggleStatus(item)}
                variant={item.isActive ? 'danger' : 'primary'}
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title="Delete"
              onPress={() => handleDelete(item)}
              variant="danger"
              style={{ marginTop: spacing.xs }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, gap: spacing.sm },
  searchInput: { backgroundColor: colors.inputBg, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: colors.border },
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
