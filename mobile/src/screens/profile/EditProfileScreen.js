import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, spacing } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useUpdateProfile } from '../../hooks/useApi';

export default function EditProfileScreen({ navigation, route }) {
  const profile = route.params?.profile;
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [country, setCountry] = useState(profile?.country || '');
  const mutation = useUpdateProfile();

  const handleSave = async () => {
    if (!nickname.trim() || !country.trim()) return Alert.alert('Required', 'All fields are required');
    try {
      await mutation.mutateAsync({ nickname: nickname.trim(), country: country.trim() });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input label="Nickname" value={nickname} onChangeText={setNickname} />
      <Input label="Country" value={country} onChangeText={setCountry} />
      <Input label="Email" value={profile?.email || ''} editable={false} style={{ opacity: 0.5 }} />
      <Button title="Save Changes" onPress={handleSave} loading={mutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});
