import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

// ── Dummy results (Phase 2: replace with real engine output) ──
const DUMMY = {
  planName: 'Retirement at 50',
  ageRange: '25–50',
  totalPeriods: 5,
  totalContributed: 'LKR 13,500,000',

  conservativeCorpus: 'LKR 27.19M',
  optimisticCorpus:   'LKR 47.73M',
  dualVehicleCorpus:  'LKR 60.01M',
  realValue:          'LKR 3.23M',

  chainedTable: [
    { period: 'P1', age: '25–30', monthly: '25,000', contributed: '1,500,000', interest: '244,251',   closing: '1,744,251'  },
    { period: 'P2', age: '30–35', monthly: '35,000', contributed: '2,100,000', interest: '950,433',   closing: '4,794,684'  },
    { period: 'P3', age: '35–40', monthly: '45,000', contributed: '2,700,000', interest: '2,112,278', closing: '9,606,962'  },
    { period: 'P4', age: '40–45', monthly: '55,000', contributed: '3,300,000', interest: '3,888,742', closing: '16,795,703' },
    { period: 'P5', age: '45–50', monthly: '65,000', contributed: '3,900,000', interest: '6,494,236', closing: '27,189,939' },
  ],

  dualVehicleTable: [
    { period: 'P1', age: '25–30', fdGrowth: '0',          liquid: '1,893,543',  combined: '1,893,543'  },
    { period: 'P2', age: '30–35', fdGrowth: '3,434,788',  liquid: '2,644,307',  combined: '6,079,095'  },
    { period: 'P3', age: '35–40', fdGrowth: '11,022,198', liquid: '3,395,072',  combined: '14,417,270' },
    { period: 'P4', age: '40–45', fdGrowth: '26,136,084', liquid: '4,145,836',  combined: '30,281,920' },
    { period: 'P5', age: '45–50', fdGrowth: '54,924,491', liquid: '4,896,601',  combined: '60,821,092' },
  ],

  monteCarlo: {
    p5:  27.2, p25: 37.0, p50: 47.8, p75: 62.6, p95: 93.0,
  },

  sensitivity: [
    { variable: 'Annual interest rate',      base: '6%',          range: '4%–12%',    low: 21.1, high: 65.0, impact: 'Very High'   },
    { variable: 'Starting monthly savings',  base: 'LKR 25,000',  range: '±LKR 10K',  low: 20.3, high: 37.6, impact: 'High'        },
    { variable: 'Savings step-up per period',base: 'LKR 10K step',range: '5K–20K',    low: 22.3, high: 37.1, impact: 'Medium-High' },
    { variable: 'FD lock rate',              base: '12%',         range: '8%–15%',    low: 34.8, high: 95.5, impact: 'High'        },
    { variable: 'Inflation rate',            base: '8.9%',        range: '4%–15%',    low:  5.7, high:  3.2, impact: 'High'        },
  ],

  inflationTable: [
    { rate: '4%',        realValue: '375,117',  retained: '37.5%' },
    { rate: '8.9% (baseline)', realValue: '118,660', retained: '11.9%' },
    { rate: '15%',       realValue: '30,378',   retained: '3.0%'  },
    { rate: '20% (crisis)',    realValue: '10,483',  retained: '1.0%'  },
  ],
};

const IMPACT_COLOR: Record<string, string> = {
  'Very High':   '#DC2626',
  'High':        '#F59E0B',
  'Medium-High': '#3B82F6',
  'Medium':      '#8B5CF6',
};

export default function SimulationResultsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{DUMMY.planName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Section 1: Metric Cards ── */}
        <View style={styles.metricsGrid}>
          <MetricCard label="Conservative (6%)"  value={DUMMY.conservativeCorpus} color={COLORS.primary} />
          <MetricCard label="Optimistic (10%)"   value={DUMMY.optimisticCorpus}   color={COLORS.success} />
          <MetricCard label="FD Dual-Vehicle"    value={DUMMY.dualVehicleCorpus}  color="#8B5CF6" />
          <MetricCard label="Real Value (adj.)"  value={DUMMY.realValue}          color={COLORS.warning} />
        </View>

        <Text style={styles.subHeader}>
          {DUMMY.ageRange} · {DUMMY.totalPeriods} periods · {DUMMY.totalContributed} contributed
        </Text>

        {/* ── Section 2: Corpus Growth (placeholder chart) ── */}
        <SectionHeader title="Corpus Growth" icon="trending-up-outline" />
        <View style={styles.chartPlaceholder}>
          <View style={styles.chartBars}>
            {[17, 33, 54, 78, 100].map((pct, i) => (
              <View key={i} style={styles.chartBarCol}>
                <View style={[styles.chartBar, { height: `${pct}%` }]} />
                <Text style={styles.chartBarLabel}>
                  {['30', '35', '40', '45', '50'][i]}
                </Text>
              </View>
            ))}
          </View>
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
        <SectionHeader title="Chained Annuity (Conservative 6%)" icon="calculator-outline" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {['Period','Age','Monthly','Contributed','Interest','Balance'].map(h => (
                <Text key={h} style={styles.thCell}>{h}</Text>
              ))}
            </View>
            {DUMMY.chainedTable.map((row, i) => (
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
              <Text style={styles.totalCell}>25–50</Text>
              <Text style={styles.totalCell}>—</Text>
              <Text style={styles.totalCell}>13,500,000</Text>
              <Text style={styles.totalCell}>13,689,939</Text>
              <Text style={styles.totalCell}>27,189,939</Text>
            </View>
          </View>
        </ScrollView>

        <InsightBox text="At 10% p.a., interest earned (LKR 34.23M) is 2.5× what you deposited. Compound interest does 71.7% of the work." />

        {/* ── Section 4: Dual-Vehicle Table ── */}
        <SectionHeader title="Dual-Vehicle FD Breakdown" icon="git-branch-outline" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {['Period','Age','FD Corpus (A)','Liquid (B)','Combined'].map(h => (
                <Text key={h} style={styles.thCell}>{h}</Text>
              ))}
            </View>
            {DUMMY.dualVehicleTable.map((row, i) => (
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

        <InsightBox text="The dual-vehicle model adds LKR 32.82M vs the conservative single-rate model. Locking the corpus at 12% FD rate is the key driver." />

        {/* ── Section 5: Monte Carlo ── */}
        <SectionHeader title="Monte Carlo Distribution (5,000 runs)" icon="shuffle-outline" />
        <View style={styles.mcBox}>
          {[
            { label: 'Pessimistic (P5)',  value: DUMMY.monteCarlo.p5,  color: COLORS.error   },
            { label: 'Lower (P25)',       value: DUMMY.monteCarlo.p25, color: COLORS.warning  },
            { label: 'Median (P50)',      value: DUMMY.monteCarlo.p50, color: COLORS.primary  },
            { label: 'Upper (P75)',       value: DUMMY.monteCarlo.p75, color: COLORS.success  },
            { label: 'Optimistic (P95)',  value: DUMMY.monteCarlo.p95, color: '#8B5CF6'       },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.mcRow}>
              <Text style={styles.mcLabel}>{label}</Text>
              <View style={styles.mcBarWrap}>
                <View style={[
                  styles.mcBar,
                  { width: `${(value / 93) * 100}%`, backgroundColor: color }
                ]} />
              </View>
              <Text style={[styles.mcValue, { color }]}>LKR {value}M</Text>
            </View>
          ))}
        </View>
        <InsightBox text="In 9 out of 10 simulated futures, your corpus lands between LKR 27.2M and LKR 93.0M. The median outcome is LKR 47.8M." />

        {/* ── Section 6: Sensitivity Tornado ── */}
        <SectionHeader title="Sensitivity Analysis" icon="bar-chart-outline" />
        <View style={styles.tornadoBox}>
          {DUMMY.sensitivity.map((row, i) => {
            const totalRange = row.high - Math.min(row.low, 0);
            const maxRange = 95;
            return (
              <View key={i} style={styles.tornadoRow}>
                <Text style={styles.tornadoVar} numberOfLines={1}>{row.variable}</Text>
                <View style={styles.tornadoBarWrap}>
                  <View style={[
                    styles.tornadoBar,
                    {
                      width: `${(row.high / maxRange) * 100}%`,
                      backgroundColor: IMPACT_COLOR[row.impact] ?? COLORS.primary,
                      opacity: 0.85,
                    }
                  ]} />
                  <View style={[
                    styles.tornadoBarLow,
                    { width: `${(row.low / maxRange) * 100}%` }
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
        <SectionHeader title="Inflation Erosion (LKR 1M over 25 years)" icon="flame-outline" />
        <View style={styles.card}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {['Inflation', 'Real Value of LKR 1M', '% Retained'].map(h => (
              <Text key={h} style={[styles.thCell, { flex: 1 }]}>{h}</Text>
            ))}
          </View>
          {DUMMY.inflationTable.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tdCell, { flex: 1 }]}>{row.rate}</Text>
              <Text style={[styles.tdCell, { flex: 1, color: COLORS.error, fontWeight: '700' }]}>
                LKR {row.realValue}
              </Text>
              <Text style={[styles.tdCell, { flex: 1 }]}>{row.retained}</Text>
            </View>
          ))}
        </View>
        <InsightBox text="At the 8.9% baseline, your LKR 27.2M nominal corpus has a real purchasing power of only LKR 3.23M. Your plan must beat inflation meaningfully." />

        {/* ── Action Bar ── */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="save-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Save</Text>
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

  // Chart placeholder
  chartPlaceholder: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    height: 180,
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