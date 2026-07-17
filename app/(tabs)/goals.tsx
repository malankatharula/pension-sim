import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { allocateGoals } from '../../src/engine';

const PRIORITIES = ['1', '2', '3', '4'];

export default function GoalPlannerScreen() {
  const [income, setIncome] = useState('150000');
  const [retirementTarget, setRetirementTarget] = useState('20000');
  const [emergencyTarget, setEmergencyTarget] = useState('7500');
  const [housingTarget, setHousingTarget] = useState('7500');
  const [educationTarget, setEducationTarget] = useState('2500');
  const [allocated, setAllocated] = useState(false);

  const allocationResult = allocateGoals({
    monthlyIncome: Number(income) || 0,
    goalRetirementMonthly: Number(retirementTarget) || 0,
    goalEmergencyTarget: Number(emergencyTarget) || 0,
    goalHousingTarget: Number(housingTarget) || 0,
    goalEducationTarget: Number(educationTarget) || 0,
    priorityRetirement: 4,
    priorityEmergency: 1,
    priorityHousing: 2,
    priorityEducation: 3,
  });

  const surplus = allocationResult.surplus;
  const feasible = allocationResult.feasible;

  // Total targets used only for "Months to Goal" — separate from monthly allocation
  const GOAL_TOTAL_TARGETS: Record<string, number> = {
    'Emergency Fund': 900000,
    'Housing': 4500000,
    'Education': 3000000,
    'Retirement': 0,
  };

  const goals = [
    { label: 'Emergency Fund', monthly: allocationResult.emergency,  priority: 1, target: GOAL_TOTAL_TARGETS['Emergency Fund'], color: COLORS.error   },
    { label: 'Housing',        monthly: allocationResult.housing,    priority: 2, target: GOAL_TOTAL_TARGETS['Housing'],       color: COLORS.warning  },
    { label: 'Education',      monthly: allocationResult.education,  priority: 3, target: GOAL_TOTAL_TARGETS['Education'],     color: '#8B5CF6'       },
    { label: 'Retirement',     monthly: allocationResult.retirement, priority: 4, target: GOAL_TOTAL_TARGETS['Retirement'],    color: COLORS.primary  },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goal Planner</Text>
        <Text style={styles.headerSubtitle}>Allocate your monthly income across goals</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Income */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Income</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>LKR</Text>
            <TextInput
              style={styles.input}
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Goal inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Allocations</Text>
          {[
            { label: 'Retirement monthly target', val: retirementTarget, set: setRetirementTarget, icon: 'trending-up-outline' },
            { label: 'Emergency fund monthly',    val: emergencyTarget,  set: setEmergencyTarget,  icon: 'shield-outline'      },
            { label: 'Housing monthly',           val: housingTarget,    set: setHousingTarget,    icon: 'home-outline'        },
            { label: 'Education monthly',         val: educationTarget,  set: setEducationTarget,  icon: 'school-outline'      },
          ].map(({ label, val, set, icon }) => (
            <View key={label} style={styles.goalInputRow}>
              <View style={styles.goalInputLeft}>
                <Ionicons name={icon as any} size={18} color={COLORS.primary} />
                <Text style={styles.goalInputLabel}>{label}</Text>
              </View>
              <View style={styles.goalInputRight}>
                <Text style={styles.prefix}>LKR</Text>
                <TextInput
                  style={styles.goalInput}
                  value={val}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.allocateBtn}
          onPress={() => setAllocated(true)}
        >
          <Text style={styles.allocateBtnText}>Allocate</Text>
        </TouchableOpacity>

        {/* Results */}
        {allocated && (
          <>
            {/* Stacked bar */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Allocation Breakdown</Text>
              <View style={styles.stackedBar}>
                {goals.map((g) => (
                  <View
                    key={g.label}
                    style={[
                      styles.stackedSegment,
                      {
                        flex: g.monthly / Number(income),
                        backgroundColor: g.color,
                      },
                    ]}
                  />
                ))}
                {surplus > 0 && (
                  <View style={[styles.stackedSegment, { flex: surplus / Number(income), backgroundColor: COLORS.border }]} />
                )}
              </View>
              <View style={styles.legendRow}>
                {goals.map(g => (
                  <View key={g.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: g.color }]} />
                    <Text style={styles.legendLabel}>{g.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Table */}
            <View style={styles.card}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {['Goal', 'Priority', 'Monthly', '% Income', 'Months to Goal'].map(h => (
                  <Text key={h} style={styles.thCell}>{h}</Text>
                ))}
              </View>
              {goals.map((g, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={styles.tdCell}>{g.label}</Text>
                  <Text style={styles.tdCell}>{g.priority}</Text>
                  <Text style={[styles.tdCell, { color: g.color, fontWeight: '700' }]}>
                    LKR {g.monthly.toLocaleString()}
                  </Text>
                  <Text style={styles.tdCell}>
                    {((g.monthly / Number(income)) * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.tdCell}>
                    {g.target > 0 ? Math.ceil(g.target / g.monthly) + ' mo' : '—'}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.tdCell}>Surplus</Text>
                <Text style={styles.tdCell}>—</Text>
                <Text style={[styles.tdCell, { color: COLORS.success, fontWeight: '700' }]}>
                  LKR {surplus.toLocaleString()}
                </Text>
                <Text style={styles.tdCell}>
                  {((surplus / Number(income)) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.tdCell}>—</Text>
              </View>
            </View>

            {/* Feasibility */}
            <View style={[
              styles.feasibilityBox,
              { backgroundColor: feasible ? '#D1FAE5' : '#FEE2E2' }
            ]}>
              <Ionicons
                name={feasible ? 'checkmark-circle-outline' : 'warning-outline'}
                size={20}
                color={feasible ? COLORS.success : COLORS.error}
              />
              <Text style={[
                styles.feasibilityText,
                { color: feasible ? '#065F46' : '#991B1B' }
              ]}>
                {feasible
                  ? '✓ Feasible — income covers all goals'
                  : `⚠ Shortfall of LKR ${allocationResult.shortfall.toLocaleString()}/month — reduce targets or increase income`
                }
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefix: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textSecondary },
  input: {
    flex: 1, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary,
  },
  goalInputRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  goalInputLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  goalInputLabel: { fontSize: FONT.sm, color: COLORS.textPrimary, fontWeight: '600' },
  goalInputRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: FONT.md, fontWeight: '700',
    color: COLORS.textPrimary, minWidth: 90, textAlign: 'right',
  },
  allocateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', marginBottom: 16,
  },
  allocateBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
  stackedBar: {
    flexDirection: 'row', height: 20,
    borderRadius: 10, overflow: 'hidden',
    marginBottom: 12,
  },
  stackedSegment: { height: 20 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: FONT.sm, color: COLORS.textSecondary },
  tableRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 4 },
  tableHeader: { backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, marginBottom: 4 },
  tableRowAlt: { backgroundColor: '#F8FFFE' },
  thCell: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  tdCell: { flex: 1, fontSize: 11, color: COLORS.textPrimary, textAlign: 'center' },
  feasibilityBox: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    borderRadius: RADIUS.md, padding: 14, marginBottom: 10,
  },
  feasibilityText: { flex: 1, fontSize: FONT.md, fontWeight: '600', lineHeight: 22 },
});