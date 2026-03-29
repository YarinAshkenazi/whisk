import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminCategories } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminCategoriesScreen() {
  const { data: categories, isLoading } = useAdminCategories();
  const [newName, setNewName] = useState('');
  const qc = useQueryClient();

  if (isLoading) return <LoadingScreen />;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await adminApi.createCategory({ name: newName.trim() });
      setNewName('');
      qc.invalidateQueries({ queryKey: ['adminCategories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    } catch (e) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Deactivate', 'Deactivate this category?', [
      { text: 'Cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        await adminApi.deleteCategory(id);
        qc.invalidateQueries({ queryKey: ['adminCategories'] });
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <Input label="" value={newName} onChangeText={setNewName} placeholder="New category name" style={{ flex: 1, marginBottom: 0, marginRight: 8 }} />
        <Button title="Add" onPress={handleAdd} style={{ alignSelf: 'flex-end' }} />
      </View>
      <FlatList
        data={categories || []}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isActive && { opacity: 0.5 }]}>
            <Text style={styles.name}>{item.name}</Text>
            <Button title="Deactivate" onPress={() => handleDelete(item.id)} variant="danger" style={{ paddingVertical: 6 }} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addRow: { flexDirection: 'row', padding: spacing.md, alignItems: 'flex-end' },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: 15, fontWeight: '500' },
});
