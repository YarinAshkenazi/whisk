import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useCategories } from '../../hooks/useApi';

export default function FilterScreen({ navigation, route }) {
  const initialFilters = route.params?.filters || {};
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId || null);
  const [country, setCountry] = useState(initialFilters.country || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || '');
  const { data: categories } = useCategories();

  const apply = () => {
    const f = {};
    if (categoryId) f.categoryId = categoryId;
    if (country) f.country = country;
    if (minPrice) f.minPrice = Number(minPrice);
    if (maxPrice) f.maxPrice = Number(maxPrice);
    route.params?.setFilters?.(f);
    navigation.goBack();
  };

  const clear = () => {
    route.params?.setFilters?.({});
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Category</Text>
      <View style={styles.chips}>
        {categories?.map(c => (
          <TouchableOpacity key={c.id} style={[styles.chip, categoryId === c.id && styles.chipActive]} onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}>
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Input label="Country" value={country} onChangeText={setCountry} placeholder="e.g., Scotland" />
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}><Input label="Min Price (ILS)" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="Max Price (ILS)" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" /></View>
      </View>
      <Button title="Apply Filters" onPress={apply} />
      <Button title="Clear All" onPress={clear} variant="outline" style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  section: { ...typography.h3, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#FFF' },
  row: { flexDirection: 'row' },
});
