import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import SafeScrollView from '../../components/SafeScrollView';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { whiskiesApi } from '../../api/whiskies';
import { getWhiskeyImageUrl } from '../../constants';
import { useFeedback } from '../../utils/feedback';

export default function GiftForFriendScreen({ navigation }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { playSuccess, playError } = useFeedback();

  const validate = () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe what you are looking for.');
      return false;
    }
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!minPrice || isNaN(min) || min < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid minimum price.');
      return false;
    }
    if (!maxPrice || isNaN(max) || max < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid maximum price.');
      return false;
    }
    if (max < min) {
      Alert.alert('Invalid Range', 'Maximum price must be greater than or equal to minimum price.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await whiskiesApi.giftRecommendation({
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        description: description.trim(),
      });
      if (res.data?.error) {
        setError(res.data.error);
        playError();
      } else {
        setResult(res.data);
        playSuccess();
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Could not get recommendation. Please try again.';
      setError(msg);
      playError();
    } finally {
      setLoading(false);
    }
  };

  const imageUri = result ? getWhiskeyImageUrl(result.imageUrl) : null;

  return (
    <SafeScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{'\u{1F381}'} Gift for a Friend</Text>
      <Text style={styles.subtitle}>Find the perfect whisky bottle as a gift</Text>

      <Text style={styles.sectionTitle}>Budget (NIS)</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Input label="Min Price" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="150" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Max Price" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholder="350" />
        </View>
      </View>

      <Input
        label="Describe who the gift is for"
        value={description}
        onChangeText={setDescription}
        placeholder="E.g. My friend loves smoky whiskies and Johnnie Walker. It's for his 40th birthday."
        multiline
        numberOfLines={4}
      />

      <Button
        title={loading ? 'Finding Gift...' : 'Find Gift'}
        onPress={handleSubmit}
        disabled={loading}
        style={{ marginTop: spacing.md }}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Our sommelier is picking the perfect bottle...</Text>
        </View>
      )}

      {error && !loading && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {result && !loading && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>{'\u{1F381}'} Our Recommendation</Text>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.resultImage} />}
          <Text style={styles.resultName}>{result.name}</Text>
          <Text style={styles.resultBrand}>{result.brand}</Text>
          <Text style={styles.resultPrice}>
            {'\u20AA'}{result.price?.toFixed(0)}
            {result.isOutsideBudget && (
              <Text style={styles.outsideBudget}> (slightly outside budget)</Text>
            )}
          </Text>
          <Text style={styles.resultExplanation}>{result.explanation}</Text>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('BottleDetail', { id: result.whiskeyId })}
            activeOpacity={0.7}
          >
            <Text style={styles.viewBtnText}>View Bottle</Text>
          </TouchableOpacity>
        </Card>
      )}

      {!result && !loading && !error && (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyIcon}>{'\u{1F943}'}</Text>
          <Text style={styles.emptyText}>Fill in the details above and we'll find the perfect gift!</Text>
        </View>
      )}
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  row: { flexDirection: 'row', direction: 'ltr' },
  loadingContainer: { alignItems: 'center', marginTop: spacing.xl },
  loadingText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 14, textAlign: 'center' },
  errorCard: { marginTop: spacing.lg, padding: spacing.lg },
  errorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
  resultCard: { marginTop: spacing.lg, padding: spacing.lg, alignItems: 'center' },
  resultTitle: { ...typography.h3, color: colors.accent, marginBottom: spacing.md },
  resultImage: { width: 120, height: 160, borderRadius: borderRadius.md, backgroundColor: colors.surface, marginBottom: spacing.md },
  resultName: { ...typography.h3, textAlign: 'center', marginBottom: 4 },
  resultBrand: { color: colors.accent, fontSize: 15, fontWeight: '500', marginBottom: spacing.sm },
  resultPrice: { color: colors.gold, fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  outsideBudget: { color: colors.warning, fontSize: 12, fontWeight: '400' },
  resultExplanation: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: spacing.lg },
  viewBtn: { backgroundColor: colors.accent, borderRadius: borderRadius.md, paddingVertical: 12, paddingHorizontal: 32 },
  viewBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  emptyHint: { alignItems: 'center', marginTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
