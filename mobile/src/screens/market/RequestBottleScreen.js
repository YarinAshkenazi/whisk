import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import SafeScrollView from '../../components/SafeScrollView';
import { colors, spacing } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useCreateRequest } from '../../hooks/useApi';

export default function RequestBottleScreen({ navigation }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [details, setDetails] = useState('');
  const mutation = useCreateRequest();

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim()) return Alert.alert('Required', 'Name and brand are required');
    try {
      await mutation.mutateAsync({ name: name.trim(), brand: brand.trim(), details: details.trim() || null });
      Alert.alert('Submitted', 'Your request has been sent to admins');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit request');
    }
  };

  return (
    <SafeScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input label="Whiskey Name" value={name} onChangeText={setName} placeholder="e.g., Springbank 15" />
      <Input label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g., Springbank" />
      <Input label="Additional Details (optional)" value={details} onChangeText={setDetails} placeholder="Anything that helps identify it" multiline numberOfLines={3} />
      <Button title="Submit Request" onPress={handleSubmit} loading={mutation.isPending} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});
