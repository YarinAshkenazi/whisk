import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import DeltaSlider from '../../components/DeltaSlider';
import Input from '../../components/Input';
import { useUpdateTasting, useDeleteTasting } from '../../hooks/useApi';
import { useFeedback } from '../../utils/feedback';

export default function EditTastingScreen({ navigation, route }) {
  const { tasting } = route.params;
  const [body, setBody] = useState(tasting.bodyDelta);
  const [smoke, setSmoke] = useState(tasting.smokeDelta);
  const [sweet, setSweet] = useState(tasting.sweetDelta);
  const [alcohol, setAlcohol] = useState(tasting.alcoholDelta);
  const [notes, setNotes] = useState(tasting.notes || '');
  const updateMutation = useUpdateTasting();
  const deleteMutation = useDeleteTasting();
  const { playRatingTick, playSuccess, playError } = useFeedback();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: tasting.id, data: {
        tastingDate: tasting.tastingDate, isOwned: tasting.isOwned, notes: notes || null,
        bodyDelta: body, smokeDelta: smoke, sweetDelta: sweet, alcoholDelta: alcohol,
      }});
      playSuccess();
      navigation.goBack();
    } catch (e) {
      playError();
      Alert.alert('Error', 'Failed to update tasting');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Tasting', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteMutation.mutateAsync(tasting.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{tasting.whiskeyName}</Text>
      <Text style={styles.date}>{new Date(tasting.tastingDate).toLocaleDateString()}</Text>
      <Text style={styles.fit}>Current Fit: {tasting.personalFitPercent}%</Text>

      <DeltaSlider label="Body" value={body} onChange={setBody} onFeedback={playRatingTick} leftLabel="Too light" rightLabel="Too heavy" />
      <DeltaSlider label="Smokiness" value={smoke} onChange={setSmoke} onFeedback={playRatingTick} leftLabel="Not smoky enough" rightLabel="Too smoky" />
      <DeltaSlider label="Sweetness" value={sweet} onChange={setSweet} onFeedback={playRatingTick} leftLabel="Not sweet enough" rightLabel="Too sweet" />
      <DeltaSlider label="Alcohol" value={alcohol} onChange={setAlcohol} onFeedback={playRatingTick} leftLabel="Too mild" rightLabel="Too strong" />

      <Input label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <Button title="Save Changes" onPress={handleSave} loading={updateMutation.isPending} />
      <Button title="Delete Tasting" onPress={handleDelete} variant="danger" style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: 4 },
  date: { color: colors.textSecondary, fontSize: 13, marginBottom: 4 },
  fit: { color: colors.accent, fontSize: 15, fontWeight: '600', marginBottom: spacing.xl },
});
