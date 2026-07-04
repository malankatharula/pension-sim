import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';

const DUMMY_SIMS = [
  {
    id: '1', name: 'Retirement at 50',
    conservative: 45.6, optimistic: 63.2, dualVehicle: 60.0,
    realValue: 6.2, contributed: 13.5, mcP50: 47.8,
    ageRange: '25–50', rate: '6% / 10%',
    payments: 'LKR 25K→65K', periods: 5,
  },
  {
    id: '2', name: 'Early FD Plus',
    conservative: 38.1, optimistic: 54.7, dualVehicle: 51.2,
    realValue: 5.1, contributed: 11.2, mcP50: 40.3,
    ageRange: '22–50', rate: '6% / 10%',
    payments: 'LKR 20K→60K', periods: 6,
  },
  {
    id: '3', name: 'Conservative Baseline',
    conservative: 27.2, optimistic: 41.5, dualVehicle: 36.4,
    realValue: 3.2, contributed: 13.5, mcP50: 33.1,
    ageRange: '25–50', rate: '6% / 10%',
    payments: 'LKR 25K (flat)', periods: 5,
  },
  {
    id: '4', name: 'High Contribution Test',
    conservative: 58.9, optimistic: 84.3, dualVehicle: 78.3,
    realValue: 8.9, contributed: 18.0, mcP50: 62.4,
    ageRange: '25–55', rate: '6% / 10%',
    payments: 'LKR 40K→80K', periods: 6,
  },
];

type Sim = typeof DUMMY_SIMS[0];

const METRICS: { label: string; key: keyof Sim; format: (v: any) => string }[] = [
  { label: 'Conservative corpus', key: 'conservative', format: v => `LKR ${v}M` },
  { label: 'Optimistic corpus',   key: 'optimistic',   format: v => `LKR ${v}M` },
  { label: 'Dual-vehicle corpus', key: 'dualVehicle',  format: v => `LKR ${v}M` },
  { label: 'Real value',          key: 'realValue',    format: v => `LKR ${v}M` },
  { label: 'Total contributed',   key: 'contributed',  format: v => `LKR ${v}M` },
  { label: 'MC median (P50)',     key: 'mcP50',        format: v => `LKR ${v}M` },
];

const INPUT_ROWS: { label: string; key: keyof Sim }[] = [
  { label: 'Age range',    key: 'ageRange'  },
  { label: 'Rate (C/O)',   key: 'rate'      },
  { label: 'Payments',     key: 'payments'  },
  { label: 'Periods',      key: 'periods'   },
];

export default function CompareScreen() {
  const [planA, setPlanA] = useState<Sim>(DUMMY_SIMS[0]);
  const [planB, setPlanB] = useState<Sim>(DUMMY_SIMS[1]);
  const [pickerFor, setPickerFor] = useState<'A' | 'B' | null>(null);

  const diff = (a: number, b: number) => {
    const d = a - b;
    return { val: `${d >= 0 ? '+' : ''}${d.toFixed(1)}M`, pos: d >= 0 };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Plans</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Plan pickers */}
        <View style={styles.pickersRow}>
          <PlanPicker
            label="Plan A"
            sim={planA}
            color={COLORS.primary}
            onPress={() => setPickerFor('A')}
          />
          <View style={styles.vsBox}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlanPicker
            label="Plan B"
            sim={planB}
            color="#8B5CF6"
            onPress={() => setPickerFor('B')}
          />
        </View>

        {/* Picker dropdown */}
        {pickerFor && (
          <View style={styles.pickerDropdown}>
            <Text style={styles.pickerDropdownTitle}>
              Select Plan {pickerFor}
            </Text>
            {DUMMY_SIMS.map(sim => (
              <TouchableOpacity
                key={sim.id}
                style={styles.pickerOption}
                onPress={() => {
                  if (pickerFor === 'A') setPlanA(sim);
                  else setPlanB(sim);
                  setPickerFor(null);
                }}
              >
                <Text style={styles.pickerOptionText}>{sim.name}</Text>
                <Text style={styles.pickerOptionSub}>Age {sim.ageRange}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Metrics comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Metrics</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.thCell, { flex: 2 }]}>Metric</Text>
            <Text style={styles.thCell}>Plan A</Text>
            <Text style={styles.thCell}>Plan B</Text>
            <Text style={styles.thCell}>Diff</Text>
          </View>
          {METRICS.map(({ label, key, format }, i) => {
            const a = planA[key] as number;
            const b = planB[key] as number;
            const d = diff(a, b);
            return (
              <View key={label} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tdCell, { flex: 2, textAlign: 'left' }]}>{label}</Text>
                <Text style={[styles.tdCell, { color: COLORS.primary, fontWeight: '700' }]}>
                  {format(a)}
                </Text>
                <Text style={[styles.tdCell, { color: '#8B5CF6', fontWeight: '700' }]}>
                  {format(b)}
                </Text>
                <Text style={[styles.tdCell, { color: d.pos ? COLORS.success : COLORS.error, fontWeight: '700' }]}>
                  {d.val}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Input comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Input Parameters</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.thCell, { flex: 2 }]}>Parameter</Text>
            <Text style={styles.thCell}>Plan A</Text>
            <Text style={styles.thCell}>Plan B</Text>
          </View>
          {INPUT_ROWS.map(({ label, key }, i) => {
            const a = String(planA[key]);
            const b = String(planB[key]);
            const differs = a !== b;
            return (
              <View key={label} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tdCell, { flex: 2, textAlign: 'left' }]}>{label}</Text>
                <Text style={[styles.tdCell, differs && { fontWeight: '700', color: COLORS.primary }]}>
                  {a}
                </Text>
                <Text style={[styles.tdCell, differs && { fontWeight: '700', color: '#8B5CF6' }]}>
                  {b}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Visual bar comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Corpus Comparison (LKR M)</Text>
          {(['conservative', 'dualVehicle', 'optimistic'] as const).map((key) => {
            const maxVal = Math.max(planA[key] as number, planB[key] as number, 1);
            return (
              <View key={key} style={styles.barGroup}>
                <Text style={styles.barGroupLabel}>
                  {key === 'conservative' ? 'Conservative'
                    : key === 'dualVehicle' ? 'Dual-Vehicle'
                    : 'Optimistic'}
                </Text>
                <View style={styles.barRow}>
                  <Text style={styles.barPlanLabel}>A</Text>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { width: `${((planA[key] as number) / maxVal) * 100}%`, backgroundColor: COLORS.primary }
                    ]} />
                  </View>
                  <Text style={styles.barValue}>{planA[key]}M</Text>
                </View>
                <View style={styles.barRow}>
                  <Text style={styles.barPlanLabel}>B</Text>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { width: `${((planB[key] as number) / maxVal) * 100}%`, backgroundColor: '#8B5CF6' }
                    ]} />
                  </View>
                  <Text style={styles.barValue}>{planB[key]}M</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanPicker({
  label, sim, color, onPress,
}: {
  label: string; sim: Sim; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.planPicker, { borderColor: color }]}
      onPress={onPress}
    >
      <Text style={[styles.planPickerLabel, { color }]}>{label}</Text>
      <Text style={styles.planPickerName} numberOfLines={1}>{sim.name}</Text>
      <Text style={[styles.planPickerValue, { color }]}>LKR {sim.conservative}M</Text>
      <Text style={styles.planPickerTap}>Tap to change ▼</Text>
    </TouchableOpacity>
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
  pickersRow: {
    flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16,
  },
  planPicker: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    borderWidth: 2, gap: 4,
  },
  planPickerLabel: { fontSize: FONT.sm, fontWeight: '800', letterSpacing: 0.5 },
  planPickerName: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary },
  planPickerValue: { fontSize: FONT.lg, fontWeight: '900' },
  planPickerTap: { fontSize: FONT.sm, color: COLORS.textMuted },
  vsBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  vsText: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.textSecondary },
  pickerDropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pickerDropdownTitle: {
    fontSize: FONT.base, fontWeight: '700',
    color: COLORS.textPrimary, marginBottom: 12,
  },
  pickerOption: {
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pickerOptionText: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textPrimary },
  pickerOptionSub: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 4 },
  tableHeader: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, marginBottom: 4,
  },
  tableRowAlt: { backgroundColor: '#F8FFFE' },
  thCell: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  tdCell: { flex: 1, fontSize: 11, color: COLORS.textPrimary, textAlign: 'center' },
  barGroup: { marginBottom: 14 },
  barGroupLabel: {
    fontSize: FONT.sm, fontWeight: '700',
    color: COLORS.textSecondary, marginBottom: 6,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  barPlanLabel: { width: 16, fontSize: FONT.sm, fontWeight: '800', color: COLORS.textSecondary },
  barTrack: {
    flex: 1, height: 14, backgroundColor: COLORS.border,
    borderRadius: 7, overflow: 'hidden',
  },
  barFill: { height: 14, borderRadius: 7 },
  barValue: { width: 44, fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
});