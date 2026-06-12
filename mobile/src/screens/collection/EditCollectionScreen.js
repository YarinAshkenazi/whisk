import React, { useState } from 'react';
import { StyleSheet, Alert, Text, View } from 'react-native';
import SafeScrollView from '../../components/SafeScrollView';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useUpdateCollectionItem, useDeleteCollectionItem } from '../../hooks/useApi';

export default function EditCollectionScreen({ navigation, route }) {
  const { item } = route.params;
  const [price, setPrice] = useState(item.purchasePriceIls?.toString() || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [status, setStatus] = useState(item.status);
  const updateMutation = useUpdateCollectionItem();
  const deleteMutation = useDeleteCollectionItem();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: {
        purchasePriceIls: price ? Number(price) : null,
        status, notes,
      }});
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const handleDelete = () => {
    Alert.alert('Remove', 'Remove from collection?', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await deleteMutation.mutateAsync(item.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <SafeScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.whiskeyName}</Text>
      <Input label="Purchase Price (ILS)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {['Closed', 'Opened', 'Finished'].map(s => (
          <Button key={s} title={s} variant={status === s ? 'primary' : 'secondary'} onPress={() => setStatus(s)} style={{ flex: 1, marginHorizontal: 4 }} />
        ))}
      </View>
      <Input label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
      <Button title="Save Changes" onPress={handleSave} loading={updateMutation.isPending} />
      <Button title="Remove from Collection" onPress={handleDelete} variant="danger" style={{ marginTop: spacing.sm }} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: spacing.lg },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  statusRow: { flexDirection: 'row', marginBottom: spacing.lg },
});
