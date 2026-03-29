import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAdminCategories } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { getWhiskeyImageUrl } from '../../constants';

export default function AdminEditWhiskeyScreen({ navigation, route }) {
  const existing = route.params?.whiskey;
  const isEdit = !!existing;
  const { data: categories } = useAdminCategories();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: existing?.name || '',
    brand: existing?.brand || '',
    age: existing?.age?.toString() || '',
    country: existing?.country || '',
    region: existing?.region || '',
    distillery: existing?.distillery || '',
    categoryId: existing?.categoryId || 1,
    volumeML: existing?.volumeML?.toString() || '700',
    alcoholPercentage: existing?.alcoholPercentage?.toString() || '',
    imageUrl: existing?.imageUrl || '',
    description: existing?.description || '',
    bodyProfile: existing?.bodyProfile?.toString() || '5',
    smokinessProfile: existing?.smokinessProfile?.toString() || '5',
    sweetnessProfile: existing?.sweetnessProfile?.toString() || '5',
    alcoholProfile: existing?.alcoholProfile?.toString() || '',
    minMarketPriceIls: existing?.minMarketPriceIls?.toString() || '',
    maxMarketPriceIls: existing?.maxMarketPriceIls?.toString() || '',
  });

  const [localImageUri, setLocalImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const pickImage = async (useCamera) => {
    const permMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permMethod();
    if (status !== 'granted') {
      Alert.alert('Permission required', `Please allow ${useCamera ? 'camera' : 'photo library'} access.`);
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Bottle Image', 'Choose image source', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const displayImageUri = localImageUri || getWhiskeyImageUrl(form.imageUrl);

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.country) return Alert.alert('Required', 'Name, brand, and country are required');

    try {
      let imageFileName = form.imageUrl;

      if (localImageUri) {
        setUploading(true);
        const uploadRes = await adminApi.uploadImage(localImageUri);
        imageFileName = uploadRes.data.fileName;
        setUploading(false);
      }

      const payload = {
        ...form,
        imageUrl: imageFileName,
        age: form.age ? Number(form.age) : null,
        categoryId: Number(form.categoryId),
        volumeML: Number(form.volumeML),
        alcoholPercentage: Number(form.alcoholPercentage),
        bodyProfile: Number(form.bodyProfile),
        smokinessProfile: Number(form.smokinessProfile),
        sweetnessProfile: Number(form.sweetnessProfile),
        alcoholProfile: form.alcoholProfile ? Number(form.alcoholProfile) : null,
        minMarketPriceIls: Number(form.minMarketPriceIls),
        maxMarketPriceIls: Number(form.maxMarketPriceIls),
      };

      if (isEdit) {
        await adminApi.updateWhiskey(existing.id, payload);
      } else {
        await adminApi.createWhiskey(payload);
      }
      qc.invalidateQueries({ queryKey: ['adminWhiskies'] });
      qc.invalidateQueries({ queryKey: ['whiskies'] });
      navigation.goBack();
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', e.response?.data?.error || e.response?.data?.[0] || 'Failed to save');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input label="Name" value={form.name} onChangeText={v => setField('name', v)} />
      <Input label="Brand" value={form.brand} onChangeText={v => setField('brand', v)} />
      <Input label="Age (optional)" value={form.age} onChangeText={v => setField('age', v)} keyboardType="numeric" />
      <Input label="Country" value={form.country} onChangeText={v => setField('country', v)} />
      <Input label="Region" value={form.region} onChangeText={v => setField('region', v)} />
      <Input label="Distillery" value={form.distillery} onChangeText={v => setField('distillery', v)} />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories?.map(c => (
          <TouchableOpacity key={c.id} style={[styles.chip, form.categoryId === c.id && styles.chipActive]} onPress={() => setField('categoryId', c.id)}>
            <Text style={[styles.chipText, form.categoryId === c.id && { color: '#FFF' }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}><Input label="Volume (ml)" value={form.volumeML} onChangeText={v => setField('volumeML', v)} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="ABV (%)" value={form.alcoholPercentage} onChangeText={v => setField('alcoholPercentage', v)} keyboardType="numeric" /></View>
      </View>

      <Text style={styles.label}>Bottle Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={showImageOptions} activeOpacity={0.7}>
        {displayImageUri ? (
          <Image source={{ uri: displayImageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>{'\u{1F4F7}'}</Text>
            <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
          </View>
        )}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input label="Description" value={form.description} onChangeText={v => setField('description', v)} multiline numberOfLines={3} />

      <Text style={styles.sectionTitle}>Flavor Profile (0-10)</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}><Input label="Body" value={form.bodyProfile} onChangeText={v => setField('bodyProfile', v)} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="Smokiness" value={form.smokinessProfile} onChangeText={v => setField('smokinessProfile', v)} keyboardType="numeric" /></View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}><Input label="Sweetness" value={form.sweetnessProfile} onChangeText={v => setField('sweetnessProfile', v)} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="Alcohol" value={form.alcoholProfile} onChangeText={v => setField('alcoholProfile', v)} keyboardType="numeric" placeholder="Auto from ABV" /></View>
      </View>

      <Text style={styles.sectionTitle}>Market Price (ILS)</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}><Input label="Min" value={form.minMarketPriceIls} onChangeText={v => setField('minMarketPriceIls', v)} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="Max" value={form.maxMarketPriceIls} onChangeText={v => setField('maxMarketPriceIls', v)} keyboardType="numeric" /></View>
      </View>

      <Button title={uploading ? 'Uploading...' : (isEdit ? 'Save Changes' : 'Create Whiskey')} onPress={handleSave} disabled={uploading} style={{ marginTop: spacing.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.lg },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  row: { flexDirection: 'row' },
  sectionTitle: { ...typography.h3, marginTop: spacing.md, marginBottom: spacing.sm },
  imagePicker: { width: '100%', height: 200, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', marginBottom: spacing.lg, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { color: colors.textMuted, fontSize: 14 },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { color: '#FFF', marginTop: 8, fontSize: 14 },
});
