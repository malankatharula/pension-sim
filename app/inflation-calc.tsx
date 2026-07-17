import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';
import { inflationErosion } from '../src/engine';

const SCENARIOS = [
  { rate: 0.04,  label: '4%',         color: COLORS.success },
  { rate: 0.089, label: '8.9% (avg)', color: COLORS.warning },
  { rate: 0.15,  label: '15%',        color: '#F97316'      },
  { rate: 0.20,  label: '20% (crisis)',color: COLORS.error   },
];

export default function InflationCalculatorScreen() {
  const [amount, setAmount] = useState('1000000');
  const [years, setYears] = useState('25');
  const [rate, setRate] = useState('8.90');

  const amt = Number(amount.replace(/,/g, '')) || 0;
  const yrs = Number(years) || 0;
  const r   = Number(rate) / 100;

  const erosion = amt > 0 ? inflationErosion(amt, r, yrs) : { realValue: 0, percentRetained: 0 };
  const realValue = erosion.realValue;
  const retained  = erosion.percentRetained;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inflation Calculator</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parameters</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount today (LKR)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Years: {years}</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={styles.sliderBtn}
                onPress={() => setYears(String(Math.max(1, Number(years) - 1)))}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(Number(years) / 40) * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.sliderBtn}
                onPress={() => setYears(String(Math.min(40, Number(years) + 1)))}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Annual inflation rate</Text>
            <View style={styles.rateRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={rate}
                onChangeText={setRate}
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Result */}
        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.resultLabel}>Real value in {years} years</Text>
          <Text style={styles.resultValue}>
            LKR {Math.round(realValue).toLocaleString()}
          </Text>
          <View style={styles.retainedRow}>
            <Text style={styles.retainedLabel}>Purchasing power retained:</Text>
            <Text style={styles.retainedValue}>{retained.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Scenario comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Scenario Comparison — LKR {Number(amount.replace(/,/g, '')).toLocaleString()} over {years} years
          </Text>
            {SCENARIOS.map(({ rate: scenarioRate, label, color }) => {
            const scenarioResult = amt > 0 ? inflationErosion(amt, scenarioRate, yrs) : { realValue: 0, percentRetained: 0 };
            const pct = scenarioResult.percentRetained;
            return (
              <View key={label} style={styles.scenarioRow}>
                <Text style={styles.scenarioLabel}>{label}</Text>
                <View style={styles.scenarioBarWrap}>
                  <View style={[
                    styles.scenarioBar,
                    { width: `${pct}%`, backgroundColor: color }
                  ]} />
                </View>
                <Text style={[styles.scenarioValue, { color }]}>
                  {pct.toFixed(1)}%
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FONT.base, color: COLORS.textPrimary,
  },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sliderBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  sliderTrack: {
    flex: 1, height: 8, backgroundColor: COLORS.border,
    borderRadius: 4, overflow: 'hidden',
  },
  sliderFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  rateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  percentBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  percentText: { fontSize: FONT.base, fontWeight: '700', color: COLORS.primary },
  resultLabel: { fontSize: FONT.md, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  resultValue: { fontSize: FONT.xxxl, fontWeight: '900', color: COLORS.white, marginBottom: 10 },
  retainedRow: { flexDirection: 'row', justifyContent: 'space-between' },
  retainedLabel: { fontSize: FONT.md, color: 'rgba(255,255,255,0.8)' },
  retainedValue: { fontSize: FONT.md, fontWeight: '800', color: COLORS.white },
  scenarioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  scenarioLabel: { width: 90, fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: '600' },
  scenarioBarWrap: {
    flex: 1, height: 12, backgroundColor: COLORS.border,
    borderRadius: 6, overflow: 'hidden',
  },
  scenarioBar: { height: 12, borderRadius: 6 },
  scenarioValue: { width: 46, fontSize: FONT.sm, fontWeight: '700', textAlign: 'right' },
});