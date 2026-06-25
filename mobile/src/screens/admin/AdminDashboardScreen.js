import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';
import { useAdminDashboard } from '../../hooks/useApi';

function F1DetailModal({ visible, onClose, metrics }) {
  const insets = useSafeAreaInsets();
  if (!metrics) return null;

  const hasEnough = metrics.evaluatedSamples >= metrics.minimumSamplesRequired;
  const fmtPct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : 'N/A';

  const rows = [
    { label: 'F1 Score', value: fmtPct(metrics.f1Score) },
    { label: 'Precision', value: fmtPct(metrics.precision) },
    { label: 'Recall', value: fmtPct(metrics.recall) },
    null,
    { label: 'Evaluated Samples', value: `${metrics.evaluatedSamples}` },
    { label: 'Minimum Required', value: `${metrics.minimumSamplesRequired}` },
    null,
    { label: 'True Positives (TP)', value: `${metrics.truePositives}` },
    { label: 'False Positives (FP)', value: `${metrics.falsePositives}` },
    { label: 'False Negatives (FN)', value: `${metrics.falseNegatives}` },
    { label: 'True Negatives (TN)', value: `${metrics.trueNegatives}` },
    null,
    { label: 'Prediction Threshold', value: `${metrics.positivePredictionThreshold}%` },
    { label: 'Feedback Threshold', value: `${metrics.positiveFeedbackThreshold}%` },
  ];

  if (metrics.lastUpdated) {
    rows.push(null);
    rows.push({ label: 'Last Updated', value: new Date(metrics.lastUpdated).toLocaleString() });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{'\u{1F3AF}'} Recommendation F1 Score</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={modalStyles.close}>{'\u2715'}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={modalStyles.summaryCard}>
              <Text style={modalStyles.bigScore}>{fmtPct(metrics.f1Score)}</Text>
              <Text style={modalStyles.summaryLabel}>F1 Score</Text>
              <Text style={modalStyles.sampleText}>
                {metrics.evaluatedSamples} / {metrics.minimumSamplesRequired} samples
              </Text>
            </Card>

            <Text style={modalStyles.explanation}>
              F1 Score measures how well the recommendation algorithm predicts bottles that users will actually like. It combines precision and recall into one score.
            </Text>

            {!hasEnough && (
              <View style={modalStyles.warningBox}>
                <Text style={modalStyles.warningText}>
                  {'\u26A0\uFE0F'} Not enough data yet. The score will become reliable after at least {metrics.minimumSamplesRequired} evaluated samples.
                </Text>
              </View>
            )}

            {rows.map((row, i) =>
              row === null ? (
                <View key={`sep-${i}`} style={modalStyles.separator} />
              ) : (
                <View key={i} style={modalStyles.metricRow}>
                  <Text style={modalStyles.metricLabel}>{row.label}</Text>
                  <Text style={modalStyles.metricValue}>{row.value}</Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  close: { color: colors.textMuted, fontSize: 20, padding: 4 },
  summaryCard: { alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  bigScore: { fontSize: 40, fontWeight: '700', color: colors.accent },
  summaryLabel: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  sampleText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  explanation: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  warningBox: { backgroundColor: 'rgba(255,152,0,0.12)', borderRadius: borderRadius.sm, padding: spacing.md, marginBottom: spacing.md },
  warningText: { color: colors.warning, fontSize: 13, lineHeight: 19 },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  metricLabel: { color: colors.textSecondary, fontSize: 14 },
  metricValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
});

export default function AdminDashboardScreen() {
  const { data, isLoading } = useAdminDashboard();
  const [showF1, setShowF1] = useState(false);
  const insets = useSafeAreaInsets();

  if (isLoading) return <LoadingScreen />;

  const f1 = data?.f1Metrics;
  const hasEnoughF1 = f1 && f1.evaluatedSamples >= f1.minimumSamplesRequired;

  const f1Value = hasEnoughF1
    ? `${(f1.f1Score * 100).toFixed(0)}%`
    : 'N/A';
  const f1Sub = f1
    ? (hasEnoughF1 ? `${f1.evaluatedSamples} samples` : `${f1.evaluatedSamples} / ${f1.minimumSamplesRequired} samples`)
    : '';

  const stats = [
    { label: 'Total Users', value: data?.totalUsers, icon: '\u{1F465}' },
    { label: 'Active Users', value: data?.activeUsers, icon: '\u{2705}' },
    { label: 'Whiskies', value: data?.totalWhiskies, icon: '\u{1F943}' },
    { label: 'Tastings', value: data?.totalTastings, icon: '\u{1F4DD}' },
    { label: 'Collection Items', value: data?.totalCollectionItems, icon: '\u{1F4E6}' },
    { label: 'Pending Requests', value: data?.pendingRequests, icon: '\u{23F3}' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
      <Text style={styles.title}>{'\u{1F4CA}'} Dashboard</Text>
      <View style={styles.grid}>
        {stats.map((s, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{s.value ?? '-'}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}

        <TouchableOpacity style={{ width: '47%' }} onPress={() => setShowF1(true)} activeOpacity={0.7}>
          <Card style={styles.statCardInner}>
            <Text style={styles.statIcon}>{'\u{1F3AF}'}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{f1Value}</Text>
            <Text style={styles.statLabel}>F1 Score</Text>
            {f1Sub ? <Text style={styles.statSub} numberOfLines={1}>{f1Sub}</Text> : null}
          </Card>
        </TouchableOpacity>
      </View>

      <F1DetailModal visible={showF1} onClose={() => setShowF1(false)} metrics={f1} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', alignItems: 'center', padding: spacing.lg, minHeight: 110 },
  statCardInner: { alignItems: 'center', padding: spacing.lg, minHeight: 110, width: '100%' },
  statIcon: { fontSize: 28, marginBottom: spacing.sm },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.accent },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  statSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});
