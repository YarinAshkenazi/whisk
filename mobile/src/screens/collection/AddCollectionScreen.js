import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import SafeScrollView from '../../components/SafeScrollView';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAddCollectionItem } from '../../hooks/useApi';
import { useFeedback } from '../../utils/feedback';

export default function AddCollectionScreen({ navigation, route }) {
  const { whiskeyId, whiskeyName } = route.params;
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Closed');
  const mutation = useAddCollectionItem();
  const { playCollectionAdd, playError } = useFeedback();

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        whiskeyId,
        purchasePriceIls: price ? Number(price) : null,
        purchaseDate: new Date().toISOString(),
        status,
        notes: notes || null,
      });
      playCollectionAdd();
      Alert.alert('Added', 'Bottle added to collection');
      navigation.goBack();
    } catch (e) {
      playError();
      Alert.alert('Error', 'Failed to add to collection');
    }
  };

  return (
    <SafeScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{whiskeyName}</Text>
      <Input label="Purchase Price (ILS)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Optional" />
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {['Closed', 'Opened', 'Finished'].map(s => (
          <Button key={s} title={s} variant={status === s ? 'primary' : 'secondary'} onPress={() => setStatus(s)} style={{ flex: 1, marginHorizontal: 4 }} />
        ))}
      </View>
      <Input label="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
      <Button title="Add to Collection" onPress={handleSave} loading={mutation.isPending} />
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
