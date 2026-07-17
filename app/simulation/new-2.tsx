import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

const DEFAULT_PAYMENTS = [25000, 35000, 45000, 55000, 65000];

export default function NewSimulationStep2() {
  const params = useLocalSearchParams();
  const startingAge = Number(params.startingAge ?? 25);
  const retirementAge = Number(params.retirementAge ?? 50);
  const planName = String(params.planName ?? 'My Plan');

  const numPeriods = Math.floor((retirementAge - startingAge) / 5);

  const [payments, setPayments] = useState<string[]>(
    Array.from({ length: numPeriods }, (_, i) =>
      String(DEFAULT_PAYMENTS[i] ?? (65000 + i * 10000))
    )
  );

  const totalContributed = payments.reduce(
    (sum, p) => sum + (Number(p.replace(/,/g, '')) || 0) * 60, 0
  );

  const updatePayment = (index: number, value: string) => {
    const next = [...payments];
    next[index] = value.replace(/[^0-9]/g, '');
    setPayments(next);
  };

  const handleNext = () => {
    router.push({
      pathname: '/simulation/new-3',
      params: {
        planName,
        startingAge,
        retirementAge,
        payments: JSON.stringify(payments.map(p => Number(p) || 0)),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Simulation</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>
      <Text style={styles.stepLabel}>STEP 2 OF 3 · SAVINGS SCHEDULE</Text>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionNote}>
          Each period = 5 years = 60 monthly contributions. Set your monthly savings for each period.
        </Text>

        {/* Period rows */}
        {Array.from({ length: numPeriods }, (_, i) => {
          const ageStart = startingAge + i * 5;
          const ageEnd = ageStart + 5;
          return (
            <View key={i} style={styles.periodRow}>
              <View style={styles.periodLabel}>
                <Text style={styles.periodTitle}>Period {i + 1}</Text>
                <Text style={styles.periodAge}>Age {ageStart}–{ageEnd}</Text>
              </View>
              <View style={styles.periodInput}>
                <Text style={styles.currencyPrefix}>LKR</Text>
                <TextInput
                  style={styles.input}
                  value={payments[i]}
                  onChangeText={(v) => updatePayment(i, v)}
                  keyboardType="numeric"
                  placeholder="25000"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.perMonth}>/mo</Text>
              </View>
            </View>
          );
        })}

        {/* Total */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total you will contribute</Text>
          <Text style={styles.totalValue}>
            LKR {totalContributed.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textPrimary },
  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  stepLabel: {
    fontSize: FONT.sm, color: COLORS.textSecondary,
    fontWeight: '600', letterSpacing: 0.5,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionNote: {
    fontSize: FONT.md, color: COLORS.textSecondary,
    lineHeight: 22, marginBottom: 20,
  },
  periodRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodLabel: {},
  periodTitle: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary },
  periodAge: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  periodInput: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  currencyPrefix: {
    fontSize: FONT.sm, fontWeight: '600',
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: FONT.base, fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 100, textAlign: 'right',
  },
  perMonth: { fontSize: FONT.sm, color: COLORS.textSecondary },
  totalBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md, padding: 16,
    marginTop: 8, marginBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#99F6E4',
  },
  totalLabel: { fontSize: FONT.md, color: COLORS.primaryDark, fontWeight: '600' },
  totalValue: { fontSize: FONT.lg, fontWeight: '800', color: COLORS.primary },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 15, alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
});