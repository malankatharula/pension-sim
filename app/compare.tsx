import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';
import { supabase } from '../src/lib/supabase';
import type { FullSimulationResult } from '../src/types/simulation';

interface CompareSim {
  id: string;
  name: string;
  ageRange: string;
  rate: string;
  createdAt: string;
  payments: string;
  periods: number;
  conservative: number;
  optimistic: number;
  dualVehicle: number;
  realValue: number;
  contributed: number;
  mcP50: number;
}

function toCompareSim(row: {
  id: string;
  name: string;
   created_at: string;
  starting_age: number;
  retirement_age: number;
  annual_rate_conservative: number;
  annual_rate_optimistic: number;
  payments: number[];
  results: FullSimulationResult;
}): CompareSim {
  const r = row.results;
   return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    ageRange: `${row.starting_age}–${row.retirement_age}`,
    rate: `${(row.annual_rate_conservative * 100).toFixed(0)}% / ${(row.annual_rate_optimistic * 100).toFixed(0)}%`,
    payments: `LKR ${(row.payments[0] / 1000).toFixed(0)}K→${(row.payments[row.payments.length - 1] / 1000).toFixed(0)}K`,
    periods: row.payments.length,
    conservative: r.conservative.finalNominal / 1e6,
    optimistic: r.optimistic.finalNominal / 1e6,
    dualVehicle: r.dualVehicle.finalNominal / 1e6,
    realValue: r.conservative.realFinal / 1e6,
    contributed: r.conservative.totalContributed / 1e6,
    mcP50: r.monteCarlo.p50,
  };
}

const METRICS: { label: string; key: keyof CompareSim; format: (v: any) => string }[] = [
  { label: 'Conservative corpus', key: 'conservative', format: v => `LKR ${v.toFixed(1)}M` },
  { label: 'Optimistic corpus',   key: 'optimistic',   format: v => `LKR ${v.toFixed(1)}M` },
  { label: 'Dual-vehicle corpus', key: 'dualVehicle',  format: v => `LKR ${v.toFixed(1)}M` },
  { label: 'Real value',          key: 'realValue',    format: v => `LKR ${v.toFixed(1)}M` },
  { label: 'Total contributed',   key: 'contributed',  format: v => `LKR ${v.toFixed(1)}M` },
  { label: 'MC median (P50)',     key: 'mcP50',        format: v => `LKR ${v.toFixed(1)}M` },
];

const INPUT_ROWS: { label: string; key: keyof CompareSim }[] = [
  { label: 'Age range',    key: 'ageRange'  },
  { label: 'Rate (C/O)',   key: 'rate'      },
  { label: 'Payments',     key: 'payments'  },
  { label: 'Periods',      key: 'periods'   },
];

export default function CompareScreen() {
  const [sims, setSims] = useState<CompareSim[]>([]);
  const [loading, setLoading] = useState(true);
  const [planA, setPlanA] = useState<CompareSim | null>(null);
  const [planB, setPlanB] = useState<CompareSim | null>(null);
  const [pickerFor, setPickerFor] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    loadSims();
  }, []);

  async function loadSims() {
    setLoading(true);
    const { data, error } = await supabase
      .from('simulations')
      .select('id, name, starting_age, retirement_age, annual_rate_conservative, annual_rate_optimistic, payments, results')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const parsed = data.map((row: any) => toCompareSim(row));
      setSims(parsed);
      if (parsed.length >= 1) setPlanA(parsed[0]);
      if (parsed.length >= 2) setPlanB(parsed[1]);
    }
    setLoading(false);
  }

  const diff = (a: number, b: number) => {
    const d = a - b;
    return { val: `${d >= 0 ? '+' : ''}${d.toFixed(1)}M`, pos: d >= 0 };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (sims.length < 2) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare Plans</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
          <Ionicons name="git-compare-outline" size={48} color={COLORS.textMuted} />
          <Text style={{ fontSize: FONT.lg, fontWeight: '700', color: COLORS.textPrimary }}>
            Need at least 2 saved plans
          </Text>
          <Text style={{ fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center' }}>
            You currently have {sims.length} saved simulation{sims.length === 1 ? '' : 's'}. Save another plan to compare.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!planA || !planB) return null;

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

        <View style={styles.pickersRow}>
          <PlanPicker label="Plan A" sim={planA} color={COLORS.primary} onPress={() => setPickerFor('A')} />
          <View style={styles.vsBox}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlanPicker label="Plan B" sim={planB} color="#8B5CF6" onPress={() => setPickerFor('B')} />
        </View>

        {pickerFor && (
          <View style={styles.pickerDropdown}>
            <Text style={styles.pickerDropdownTitle}>Select Plan {pickerFor}</Text>
            {sims.map(sim => (
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
                <Text style={styles.pickerOptionSub}>
                  Age {sim.ageRange} · {new Date(sim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
                <Text style={[styles.tdCell, { color: COLORS.primary, fontWeight: '700' }]}>{format(a)}</Text>
                <Text style={[styles.tdCell, { color: '#8B5CF6', fontWeight: '700' }]}>{format(b)}</Text>
                <Text style={[styles.tdCell, { color: d.pos ? COLORS.success : COLORS.error, fontWeight: '700' }]}>
                  {d.val}
                </Text>
              </View>
            );
          })}
        </View>

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
                <Text style={[styles.tdCell, differs && { fontWeight: '700', color: COLORS.primary }]}>{a}</Text>
                <Text style={[styles.tdCell, differs && { fontWeight: '700', color: '#8B5CF6' }]}>{b}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Corpus Comparison (LKR M)</Text>
          {(['conservative', 'dualVehicle', 'optimistic'] as const).map((key) => {
            const maxVal = Math.max(planA[key] as number, planB[key] as number, 1);
            return (
              <View key={key} style={styles.barGroup}>
                <Text style={styles.barGroupLabel}>
                  {key === 'conservative' ? 'Conservative' : key === 'dualVehicle' ? 'Dual-Vehicle' : 'Optimistic'}
                </Text>
                <View style={styles.barRow}>
                  <Text style={styles.barPlanLabel}>A</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${((planA[key] as number) / maxVal) * 100}%`, backgroundColor: COLORS.primary }]} />
                  </View>
                  <Text style={styles.barValue}>{(planA[key] as number).toFixed(1)}M</Text>
                </View>
                <View style={styles.barRow}>
                  <Text style={styles.barPlanLabel}>B</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${((planB[key] as number) / maxVal) * 100}%`, backgroundColor: '#8B5CF6' }]} />
                  </View>
                  <Text style={styles.barValue}>{(planB[key] as number).toFixed(1)}M</Text>
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
  label: string; sim: CompareSim; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.planPicker, { borderColor: color }]} onPress={onPress}>
      <Text style={[styles.planPickerLabel, { color }]}>{label}</Text>
      <Text style={styles.planPickerName} numberOfLines={1}>{sim.name}</Text>
      <Text style={styles.planPickerAge}>
        Age {sim.ageRange} · {new Date(sim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
      </Text>
      <Text style={[styles.planPickerValue, { color }]}>LKR {sim.conservative.toFixed(1)}M</Text>
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
  pickersRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16 },
  planPicker: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    borderWidth: 2, gap: 4,
  },
  planPickerLabel: { fontSize: FONT.sm, fontWeight: '800', letterSpacing: 0.5 },
  planPickerName: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary },
  planPickerAge: { fontSize: FONT.sm, color: COLORS.textMuted },
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
  pickerDropdownTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  pickerOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
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
  tableHeader: { backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, marginBottom: 4 },
  tableRowAlt: { backgroundColor: '#F8FFFE' },
  thCell: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  tdCell: { flex: 1, fontSize: 11, color: COLORS.textPrimary, textAlign: 'center' },
  barGroup: { marginBottom: 14 },
  barGroupLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  barPlanLabel: { width: 16, fontSize: FONT.sm, fontWeight: '800', color: COLORS.textSecondary },
  barTrack: { flex: 1, height: 14, backgroundColor: COLORS.border, borderRadius: 7, overflow: 'hidden' },
  barFill: { height: 14, borderRadius: 7 },
  barValue: { width: 44, fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
});