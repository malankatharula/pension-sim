import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { useSimulationStore } from '../../src/store/simulationStore';
import { erosionScenarios } from '../../src/engine';
import { CorpusGrowthChart } from '../../src/components/charts/CorpusGrowthChart';
import { MonteCarloFan } from '../../src/components/charts/MonteCarloFan';
import { InflationErosionChart } from '../../src/components/charts/InflationErosionChart';


const IMPACT_COLOR: Record<string, string> = {
  'Very High':   '#DC2626',
  'High':        '#F59E0B',
  'Medium-High': '#3B82F6',
  'Medium':      '#8B5CF6',
  'Low':         '#10B981',
};

const fmtNum = (n: number) => Math.round(n).toLocaleString();
const fmtM = (n: number) => (n / 1e6).toFixed(2);

export default function SimulationResultsScreen() {
  const params = useLocalSearchParams();
  const { current, planName, loadById } = useSimulationStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      loadById(params.id);
    }
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await useSimulationStore.getState().saveCurrent();
    setSaving(false);
    if (error) {
      Alert.alert('Save failed', error);
    } else {
      Alert.alert('Saved!', 'Your simulation has been saved to your account.');
    }
  };

  if (!current) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Ionicons name="calculator-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No simulation to show</Text>
          <Text style={styles.emptyText}>Run a simulation first to see your results here.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/simulation/new')}
          >
            <Text style={styles.emptyBtnText}>New Simulation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { input } = current;
  const years = input.payments.length * 5;

  const conservativeCorpus = `LKR ${fmtM(current.conservative.finalNominal)}M`;
  const optimisticCorpus   = `LKR ${fmtM(current.optimistic.finalNominal)}M`;
  const dualVehicleCorpus  = `LKR ${fmtM(current.dualVehicle.finalNominal)}M`;
  const realValue          = `LKR ${fmtM(current.conservative.realFinal)}M`;

  const ageRange = `${input.startingAge}–${input.retirementAge}`;
  const totalPeriods = input.payments.length;
  const totalContributed = `LKR ${fmtNum(current.conservative.totalContributed)}`;

  const chainedTable = current.conservative.periods.map((p) => ({
    period: `P${p.period}`,
    age: `${p.ageStart}–${p.ageEnd}`,
    monthly: fmtNum(p.monthlyPayment),
    contributed: fmtNum(p.totalContributed),
    interest: fmtNum(p.interestEarned),
    closing: fmtNum(p.closingBalance),
  }));

  const dualVehicleTable = current.dualVehicle.periods.map((p) => ({
    period: `P${p.period}`,
    age: `${p.ageStart}–${p.ageEnd}`,
    fdGrowth: fmtNum(p.fdCorpusGrowth),
    liquid: fmtNum(p.liquidAccumulation),
    combined: fmtNum(p.combinedBalance),
  }));

  const mc = current.monteCarlo;
  const mcMax = Math.max(1, mc.p95);

  const sensitivity = current.sensitivity.map((r) => ({
    variable: r.variable,
    base: r.baseValue,
    range: r.range,
    low: r.lowOutcome,
    high: r.highOutcome,
    impact: r.impact,
  }));
// Inflation rate measures real (inflation-adjusted) value, a different scale
// from the other rows which measure nominal corpus — so it gets its own max.
const nominalRows = sensitivity.filter((r) => r.variable !== 'Inflation rate');
const tornadoMax = Math.max(
  1,
  ...nominalRows.flatMap((r) => [Math.abs(r.low), Math.abs(r.high)])
);

const inflationRow = sensitivity.find((r) => r.variable === 'Inflation rate');
const inflationMax = inflationRow
  ? Math.max(1, Math.abs(inflationRow.low), Math.abs(inflationRow.high))
  : 1;

  const erosion = erosionScenarios(1_000_000, years, [0.04, input.inflationRate, 0.15, 0.20]);
  const inflationTable = erosion.map((s, i) => ({
    rate: i === 1
      ? `${(s.rate * 100).toFixed(1)}% (baseline)`
      : i === 3
      ? `${(s.rate * 100).toFixed(0)}% (crisis)`
      : `${(s.rate * 100).toFixed(0)}%`,
    realValue: fmtNum(s.result.realValue),
    retained: `${s.result.percentRetained}%`,
  }));

  const interestMultiplier = (
    current.optimistic.totalInterest / current.optimistic.totalContributed
  ).toFixed(1);
  const interestPercent = Math.round(
    (current.optimistic.totalInterest / current.optimistic.finalNominal) * 100
  );
  const dualVehicleDiff = fmtM(current.dualVehicle.finalNominal - current.conservative.finalNominal);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{planName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Section 1: Metric Cards ── */}
        <View style={styles.metricsGrid}>
          <MetricCard label={`Conservative (${(input.annualRateConservative * 100).toFixed(0)}%)`} value={conservativeCorpus} color={COLORS.primary} />
          <MetricCard label={`Optimistic (${(input.annualRateOptimistic * 100).toFixed(0)}%)`} value={optimisticCorpus} color={COLORS.success} />
          <MetricCard label="FD Dual-Vehicle" value={dualVehicleCorpus} color="#8B5CF6" />
          <MetricCard label="Real Value (adj.)" value={realValue} color={COLORS.warning} />
        </View>

        <Text style={styles.subHeader}>
          {ageRange} · {totalPeriods} periods · {totalContributed} contributed
        </Text>

{/* ── Section 2: Corpus Growth ── */}
        <SectionHeader title="Corpus Growth" icon="trending-up-outline" />
        <View style={styles.chartPlaceholder}>
          <CorpusGrowthChart
            conservativePeriods={current.conservative.periods}
            optimisticPeriods={current.optimistic.periods}
            dualVehicleBalances={current.dualVehicle.periods.map(p => p.combinedBalance)}
            startingAge={input.startingAge}
          />
          <View style={styles.chartLegend}>
            {[
              { color: COLORS.primary, label: 'Conservative' },
              { color: COLORS.success, label: 'Optimistic' },
              { color: '#8B5CF6',      label: 'Dual-Vehicle' },
            ].map(({ color, label }) => (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Section 3: Chained Annuity Table ── */}
        <SectionHeader title={`Chained Annuity (Conservative ${(input.annualRateConservative * 100).toFixed(0)}%)`} icon="calculator-outline" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {['Period','Age','Monthly','Contributed','Interest','Balance'].map(h => (
                <Text key={h} style={styles.thCell}>{h}</Text>
              ))}
            </View>
            {chainedTable.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={styles.tdCell}>{row.period}</Text>
                <Text style={styles.tdCell}>{row.age}</Text>
                <Text style={styles.tdCell}>LKR {row.monthly}</Text>
                <Text style={styles.tdCell}>{row.contributed}</Text>
                <Text style={[styles.tdCell, styles.interestCell]}>{row.interest}</Text>
                <Text style={[styles.tdCell, styles.boldCell]}>{row.closing}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, styles.tableTotalRow]}>
              <Text style={styles.totalCell}>TOTAL</Text>
              <Text style={styles.totalCell}>{ageRange}</Text>
              <Text style={styles.totalCell}>—</Text>
              <Text style={styles.totalCell}>{fmtNum(current.conservative.totalContributed)}</Text>
              <Text style={styles.totalCell}>{fmtNum(current.conservative.totalInterest)}</Text>
              <Text style={styles.totalCell}>{fmtNum(current.conservative.finalNominal)}</Text>
            </View>
          </View>
        </ScrollView>

        <InsightBox text={`At ${(input.annualRateOptimistic * 100).toFixed(0)}%, interest earned (LKR ${fmtM(current.optimistic.totalInterest)}M) is ${interestMultiplier}× what you deposited. Compound interest does ${interestPercent}% of the work.`} />

        {/* ── Section 4: Dual-Vehicle Table ── */}
        <SectionHeader title="Dual-Vehicle FD Breakdown" icon="git-branch-outline" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {['Period','Age','FD Corpus (A)','Liquid (B)','Combined'].map(h => (
                <Text key={h} style={styles.thCell}>{h}</Text>
              ))}
            </View>
            {dualVehicleTable.map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={styles.tdCell}>{row.period}</Text>
                <Text style={styles.tdCell}>{row.age}</Text>
                <Text style={[styles.tdCell, { color: '#8B5CF6', fontWeight: '700' }]}>{row.fdGrowth}</Text>
                <Text style={[styles.tdCell, styles.interestCell]}>{row.liquid}</Text>
                <Text style={[styles.tdCell, styles.boldCell]}>{row.combined}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <InsightBox text={`The dual-vehicle model adds LKR ${dualVehicleDiff}M vs the conservative single-rate model. Locking the corpus at ${(input.annualRateFdLock * 100).toFixed(0)}% FD rate is the key driver.`} />

            {/* ── Section 5: Monte Carlo ── */}
        <SectionHeader title={`Monte Carlo Distribution (${input.mcIterations.toLocaleString()} runs)`} icon="shuffle-outline" />
        <View style={styles.mcBox}>
          <MonteCarloFan p5={mc.p5} p25={mc.p25} p50={mc.p50} p75={mc.p75} p95={mc.p95} />
          <View style={{ gap: 8, marginTop: 8 }}>
            {[
              { label: 'Pessimistic (P5)',  value: mc.p5,  color: COLORS.error   },
              { label: 'Lower (P25)',       value: mc.p25, color: COLORS.warning  },
              { label: 'Median (P50)',      value: mc.p50, color: COLORS.primary  },
              { label: 'Upper (P75)',       value: mc.p75, color: COLORS.success  },
              { label: 'Optimistic (P95)',  value: mc.p95, color: '#8B5CF6'       },
            ].map(({ label, value, color }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: FONT.sm, color: COLORS.textSecondary }}>{label}</Text>
                <Text style={{ fontSize: FONT.sm, fontWeight: '700', color }}>LKR {value.toFixed(1)}M</Text>
              </View>
            ))}
          </View>
        </View>
        <InsightBox text={`In 9 out of 10 simulated futures, your corpus lands between LKR ${mc.p5.toFixed(1)}M and LKR ${mc.p95.toFixed(1)}M. The median outcome is LKR ${mc.p50.toFixed(1)}M.`} />

        {/* ── Section 6: Sensitivity Tornado ── */}
        <SectionHeader title="Sensitivity Analysis" icon="bar-chart-outline" />
        <View style={styles.tornadoBox}>
 {sensitivity.map((row, i) => {
  const isInflation = row.variable === 'Inflation rate';
  const rowMax = isInflation ? inflationMax : tornadoMax;
  return (
    <View key={i} style={styles.tornadoRow}>
      <Text style={styles.tornadoVar} numberOfLines={1}>
        {row.variable}{isInflation ? ' (real value, own scale)' : ''}
      </Text>
      <View style={styles.tornadoBarWrap}>
        <View style={[
          styles.tornadoBar,
          {
            width: `${(Math.abs(row.high) / rowMax) * 100}%`,
            backgroundColor: IMPACT_COLOR[row.impact] ?? COLORS.primary,
            opacity: 0.85,
          }
        ]} />
        <View style={[
          styles.tornadoBarLow,
          { width: `${(Math.abs(row.low) / rowMax) * 100}%` }
        ]} />
      </View>
      <Text style={[
        styles.tornadoImpact,
        { color: IMPACT_COLOR[row.impact] ?? COLORS.primary }
      ]}>
        {row.impact}
      </Text>
    </View>
  );
})}
        </View>

        {/* ── Section 7: Inflation Erosion ── */}
        <SectionHeader title={`Inflation Erosion (LKR 1M over ${years} years)`} icon="flame-outline" />
        <View style={styles.card}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {['Inflation', 'Real Value of LKR 1M', '% Retained'].map(h => (
              <Text key={h} style={[styles.thCell, { flex: 1 }]}>{h}</Text>
            ))}
          </View>
          {inflationTable.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tdCell, { flex: 1 }]}>{row.rate}</Text>
              <Text style={[styles.tdCell, { flex: 1, color: COLORS.error, fontWeight: '700' }]}>
                LKR {row.realValue}
              </Text>
              <Text style={[styles.tdCell, { flex: 1 }]}>{row.retained}</Text>
            </View>
          ))}
        </View>
                <SectionHeader title={`Inflation Erosion (LKR 1M over ${years} years)`} icon="flame-outline" />
        <View style={styles.card}>
          {/* ...existing table code stays exactly the same... */}
        </View>
        <View style={{ marginHorizontal: 20, marginTop: 12 }}>
          <InflationErosionChart
            scenarios={inflationTable.map((row) => ({
              label: row.rate.replace(' (baseline)', '').replace(' (crisis)', ''),
              percentRetained: parseFloat(row.retained),
            }))}
          />
        </View>
        <InsightBox text={`At the ${(input.inflationRate * 100).toFixed(1)}% baseline, your ${conservativeCorpus} nominal corpus has a real purchasing power of only ${realValue}. Your plan must beat inflation meaningfully.`} />

        {/* ── Action Bar ── */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSave} disabled={saving}>
            <Ionicons name="save-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/compare')}
          >
            <Ionicons name="git-compare-outline" size={18} color={COLORS.white} />
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Compare</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.metricCard, { borderTopColor: color }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InsightBox({ text }: { text: string }) {
  return (
    <View style={styles.insightBox}>
      <Ionicons name="bulb-outline" size={16} color={COLORS.primary} />
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.primary,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.white },

  scroll: { flex: 1 },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 10,
  },
  emptyTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center' },
  emptyBtn: {
    marginTop: 12, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT.base },

  // Metrics
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 12, gap: 10,
  },
  metricCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    borderTopWidth: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  metricValue: { fontSize: FONT.lg, fontWeight: '800', marginBottom: 4 },
  metricLabel: { fontSize: FONT.sm, color: COLORS.textSecondary },

  subHeader: {
    fontSize: FONT.sm, color: COLORS.textSecondary,
    paddingHorizontal: 20, paddingBottom: 16, textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary },

  chartPlaceholder: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chartBars: {
    flex: 1, flexDirection: 'row',
    alignItems: 'flex-end', gap: 10,
    paddingBottom: 24,
  },
  chartBarCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  chartBar: {
    width: '100%', backgroundColor: COLORS.primary,
    borderRadius: 4, opacity: 0.85,
  },
  chartBarLabel: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 4 },
  chartLegend: {
    flexDirection: 'row', gap: 16, justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: FONT.sm, color: COLORS.textSecondary },

  // Tables
  card: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8,
  },
  tableHeader: { backgroundColor: COLORS.primary },
  tableRowAlt: { backgroundColor: '#F8FFFE' },
  tableTotalRow: { backgroundColor: COLORS.primaryLight },
  thCell: {
    width: 110, fontSize: FONT.sm, fontWeight: '700',
    color: COLORS.white, textAlign: 'center',
  },
  tdCell: {
    width: 110, fontSize: FONT.sm,
    color: COLORS.textPrimary, textAlign: 'center',
  },
  interestCell: { color: COLORS.primary, fontWeight: '600' },
  boldCell: { fontWeight: '800', color: COLORS.textPrimary },
  totalCell: {
    width: 110, fontSize: FONT.sm, fontWeight: '800',
    color: COLORS.primaryDark, textAlign: 'center',
  },

  // Monte Carlo
  mcBox: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 12,
  },
  mcRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mcLabel: { width: 110, fontSize: FONT.sm, color: COLORS.textSecondary },
  mcBarWrap: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  mcBar: { height: 10, borderRadius: 5 },
  mcValue: { width: 80, fontSize: FONT.sm, fontWeight: '700', textAlign: 'right' },

  // Tornado
  tornadoBox: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 14,
  },
  tornadoRow: { gap: 6 },
  tornadoVar: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textPrimary },
  tornadoBarWrap: {
    height: 12, backgroundColor: COLORS.border,
    borderRadius: 6, overflow: 'hidden',
    flexDirection: 'row',
  },
  tornadoBar: { height: 12, borderRadius: 6 },
  tornadoBarLow: { height: 12, backgroundColor: COLORS.border },
  tornadoImpact: { fontSize: FONT.sm, fontWeight: '700' },

  // Insight
  insightBox: {
    flexDirection: 'row', gap: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm, padding: 14,
    margin: 20, marginTop: 10,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  insightText: { flex: 1, fontSize: FONT.sm, color: COLORS.primaryDark, lineHeight: 20 },

  // Action bar
  actionBar: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 20, marginTop: 10,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  actionBtnText: {
    fontSize: FONT.md, fontWeight: '700', color: COLORS.primary,
  },
});