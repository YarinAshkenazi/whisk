import React, { useState } from 'react';
import { StyleSheet, Alert, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import SafeScrollView from '../../components/SafeScrollView';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAdminCategories } from '../../hooks/useApi';
import { adminApi } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { getWhiskeyImageUrl } from '../../constants';
import { useFeedback } from '../../utils/feedback';

export default function AdminEditWhiskeyScreen({ navigation, route }) {
  const existing = route.params?.whiskey;
  const prefill = route.params?.prefill;
  const isEdit = !!existing;
  const { data: categories } = useAdminCategories();
  const qc = useQueryClient();
  const { playSuccess, playError } = useFeedback();

  const source = existing || prefill || {};
  const [form, setForm] = useState({
    name: source.name || '',
    brand: source.brand || '',
    age: existing?.age?.toString() || '',
    country: existing?.country || '',
    region: existing?.region || '',
    distillery: existing?.distillery || '',
    categoryId: existing?.categoryId || 1,
    volumeML: existing?.volumeML?.toString() || '700',
    alcoholPercentage: existing?.alcoholPercentage?.toString() || '',
    imageUrl: existing?.imageUrl || '',
    description: existing?.description || prefill?.details || '',
    bodyProfile: existing?.bodyProfile?.toString() || '5',
    smokinessProfile: existing?.smokinessProfile?.toString() || '5',
    sweetnessProfile: existing?.sweetnessProfile?.toString() || '5',
    alcoholProfile: existing?.alcoholProfile?.toString() || '',
    minMarketPriceIls: existing?.minMarketPriceIls?.toString() || '',
    maxMarketPriceIls: existing?.maxMarketPriceIls?.toString() || '',
  });

  const [localImageUri, setLocalImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);

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

  const handleAiFill = async () => {
    if (!form.name.trim()) return Alert.alert('Name required', 'Enter a bottle name before using AI Fill.');
    setAiFilling(true);
    try {
      const res = await adminApi.aiPrefill({ bottleName: form.name.trim(), brand: form.brand.trim() || null }, { timeout: 45000 });
      const ai = res.data;
      setForm(prev => ({
        ...prev,
        name: ai.name || prev.name,
        brand: ai.brand || prev.brand,
        age: ai.age != null ? String(ai.age) : '',
        country: ai.country || prev.country,
        region: ai.region || prev.region,
        distillery: ai.distillery || prev.distillery,
        categoryId: ai.categoryId || prev.categoryId,
        volumeML: ai.volumeML ? String(ai.volumeML) : prev.volumeML,
        alcoholPercentage: ai.alcoholPercentage ? String(ai.alcoholPercentage) : prev.alcoholPercentage,
        description: ai.description || prev.description,
        bodyProfile: ai.bodyProfile != null ? String(ai.bodyProfile) : prev.bodyProfile,
        smokinessProfile: ai.smokinessProfile != null ? String(ai.smokinessProfile) : prev.smokinessProfile,
        sweetnessProfile: ai.sweetnessProfile != null ? String(ai.sweetnessProfile) : prev.sweetnessProfile,
        alcoholProfile: ai.alcoholProfile != null ? String(ai.alcoholProfile) : prev.alcoholProfile,
        minMarketPriceIls: ai.minMarketPriceIls ? String(ai.minMarketPriceIls) : prev.minMarketPriceIls,
        maxMarketPriceIls: ai.maxMarketPriceIls ? String(ai.maxMarketPriceIls) : prev.maxMarketPriceIls,
      }));
      playSuccess();
    } catch (e) {
      playError();
      const msg = e.response?.data?.error || e.response?.data?.title || e.message || 'Could not generate details. Please fill the form manually.';
      Alert.alert('AI Fill Failed', msg);
    } finally {
      setAiFilling(false);
    }
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
        requestId: prefill?.requestId || null,
      };

      if (isEdit) {
        await adminApi.updateWhiskey(existing.id, payload);
      } else {
        await adminApi.createWhiskey(payload);
      }
      qc.invalidateQueries({ queryKey: ['adminWhiskies'] });
      qc.invalidateQueries({ queryKey: ['whiskies'] });
      if (prefill?.requestId) qc.invalidateQueries({ queryKey: ['adminRequests'] });
      playSuccess();
      navigation.goBack();
    } catch (e) {
      setUploading(false);
      playError();
      Alert.alert('Error', e.response?.data?.error || e.response?.data?.[0] || 'Failed to save');
    }
  };

  return (
    <SafeScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input label="Name" value={form.name} onChangeText={v => setField('name', v)} />
      <Input label="Brand" value={form.brand} onChangeText={v => setField('brand', v)} />

      {!isEdit && (
        <TouchableOpacity style={[styles.aiBtn, aiFilling && styles.aiBtnDisabled]} onPress={handleAiFill} disabled={aiFilling} activeOpacity={0.7}>
          {aiFilling ? (
            <ActivityIndicator color={colors.accent} size="small" style={{ marginRight: 8 }} />
          ) : (
            <Text style={styles.aiIcon}>{'\u2728'}</Text>
          )}
          <Text style={styles.aiBtnText}>{aiFilling ? 'Generating...' : 'AI Fill'}</Text>
        </TouchableOpacity>
      )}

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
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
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
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent, borderRadius: 12, paddingVertical: 10, marginBottom: spacing.md },
  aiBtnDisabled: { opacity: 0.6 },
  aiIcon: { fontSize: 18, marginRight: 8 },
  aiBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
});
