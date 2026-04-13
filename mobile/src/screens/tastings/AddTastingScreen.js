import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import DeltaSlider from '../../components/DeltaSlider';
import Input from '../../components/Input';
import { useAddTasting } from '../../hooks/useApi';
import { useFeedback } from '../../utils/feedback';

export default function AddTastingScreen({ navigation, route }) {
  const { whiskeyId, whiskeyName } = route.params;
  const [body, setBody] = useState(0);
  const [smoke, setSmoke] = useState(0);
  const [sweet, setSweet] = useState(0);
  const [alcohol, setAlcohol] = useState(0);
  const [notes, setNotes] = useState('');
  const [isOwned, setIsOwned] = useState(true);
  const mutation = useAddTasting();
  const { playRatingTick, playSuccess, playError } = useFeedback();

  const handleSave = async () => {
    try {
      const result = await mutation.mutateAsync({
        whiskeyId, tastingDate: new Date().toISOString(), isOwned, notes: notes || null,
        bodyDelta: body, smokeDelta: smoke, sweetDelta: sweet, alcoholDelta: alcohol,
      });
      playSuccess();
      Alert.alert('Tasting Added', `Personal fit: ${result.personalFitPercent}%`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      playError();
      Alert.alert('Error', 'Failed to save tasting');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{whiskeyName}</Text>
      <Text style={styles.subtitle}>Rate how this bottle matches your taste</Text>

      <DeltaSlider label="Body" value={body} onChange={setBody} onFeedback={playRatingTick} leftLabel="Too light" rightLabel="Too heavy" />
      <DeltaSlider label="Smokiness" value={smoke} onChange={setSmoke} onFeedback={playRatingTick} leftLabel="Not smoky enough" rightLabel="Too smoky" />
      <DeltaSlider label="Sweetness" value={sweet} onChange={setSweet} onFeedback={playRatingTick} leftLabel="Not sweet enough" rightLabel="Too sweet" />
      <DeltaSlider label="Alcohol" value={alcohol} onChange={setAlcohol} onFeedback={playRatingTick} leftLabel="Too mild" rightLabel="Too strong" />

      <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Your impressions..." multiline numberOfLines={3} />

      <Button title="Save Tasting" onPress={handleSave} loading={mutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.xl },
});
