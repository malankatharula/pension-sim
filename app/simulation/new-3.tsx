import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { runFullSimulation } from '../../src/engine';
import { useSimulationStore } from '../../src/store/simulationStore';
import type { SimulationInput } from '../../src/types/simulation';

export default function NewSimulationStep3() {
  const params = useLocalSearchParams();

  const [conservativeRate, setConservativeRate] = useState('6.00');
  const [optimisticRate, setOptimisticRate] = useState('10.00');
  const [fdLockRate, setFdLockRate] = useState('12.00');
  const [liquidRate, setLiquidRate] = useState('9.00');
  const [inflationRate, setInflationRate] = useState('8.90');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [whtRate, setWhtRate] = useState('5.00');
  const [mcIterations, setMcIterations] = useState('5000');
  const [mcMu, setMcMu] = useState('10.00');
  const [mcSigma, setMcSigma] = useState('2.50');

  const handleRunSimulation = () => {
    const startingAge = Number(params.startingAge ?? 25);
    const retirementAge = Number(params.retirementAge ?? 50);
    const planName = String(params.planName ?? 'My Plan');

    let payments: number[] = [];
    try {
      payments = JSON.parse(String(params.payments ?? '[]'));
    } catch {
      payments = [25000, 35000, 45000, 55000, 65000];
    }

    const input: SimulationInput = {
      startingAge,
      retirementAge,
      payments,
      annualRateConservative: (Number(conservativeRate) || 0) / 100,
      annualRateOptimistic: (Number(optimisticRate) || 0) / 100,
      annualRateFdLock: (Number(fdLockRate) || 0) / 100,
      annualRateLiquid: (Number(liquidRate) || 0) / 100,
      inflationRate: (Number(inflationRate) || 0) / 100,
      whtRate: (Number(whtRate) || 0) / 100,
      mcIterations: Number(mcIterations) || 5000,
      mcMu: (Number(mcMu) || 0) / 100,
      mcSigma: (Number(mcSigma) || 0) / 100,
    };

    const result = runFullSimulation(input);
    useSimulationStore.getState().setCurrent(result, planName);

    router.push('/simulation/results');
  };

  return (
    <SafeAreaView style={styles.safe}>
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
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>
      <Text style={styles.stepLabel}>STEP 3 OF 3 · RATE PARAMETERS</Text>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Standard rates */}
        <RateField
          label="Conservative annual rate"
          hint="Lower-bound single-rate model"
          value={conservativeRate}
          onChange={setConservativeRate}
        />
        <RateField
          label="Optimistic annual rate"
          hint="Upper-bound single-rate model"
          value={optimisticRate}
          onChange={setOptimisticRate}
        />
        <RateField
          label="FD lock rate"
          hint="Dual-vehicle FD corpus rate"
          value={fdLockRate}
          onChange={setFdLockRate}
        />
        <RateField
          label="Liquid savings rate"
          hint="Dual-vehicle accumulation track"
          value={liquidRate}
          onChange={setLiquidRate}
        />
        <RateField
          label="Inflation rate"
          hint="Used for real value calculation (Sri Lanka 10yr avg: 8.9%)"
          value={inflationRate}
          onChange={setInflationRate}
        />

        {/* Advanced toggle */}
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? '▲' : '▼'} Advanced — Monte Carlo Parameters
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedBox}>
            <RateField
              label="WHT rate"
              hint="Withholding tax on interest income"
              value={whtRate}
              onChange={setWhtRate}
            />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>MC iterations</Text>
              <Text style={styles.fieldHint}>Number of Monte Carlo simulations (100–10000)</Text>
              <TextInput
                style={styles.input}
                value={mcIterations}
                onChangeText={setMcIterations}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <RateField
              label="MC mean rate μ"
              hint="Vasicek long-run mean rate"
              value={mcMu}
              onChange={setMcMu}
            />
            <RateField
              label="MC volatility σ"
              hint="Rate volatility (standard deviation)"
              value={mcSigma}
              onChange={setMcSigma}
            />
          </View>
        )}

        {/* Total contribution summary */}
        <View style={styles.summaryBox}>
          <Ionicons name="calculator-outline" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>
            Ready to run — {params.planName ?? 'My Plan'} ·{' '}
            Age {params.startingAge}–{params.retirementAge}
          </Text>
        </View>

        <TouchableOpacity style={styles.runBtn} onPress={handleRunSimulation}>
          <Ionicons name="play-circle-outline" size={20} color={COLORS.white} />
          <Text style={styles.runBtnText}>Run Simulation</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reusable rate input field ──
function RateField({
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.fieldHint}>{hint}</Text>
      <View style={styles.rateInputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>%</Text>
        </View>
      </View>
    </View>
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
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  fieldHint: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FONT.base, color: COLORS.textPrimary,
  },
  rateInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  percentBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  percentText: { fontSize: FONT.base, fontWeight: '700', color: COLORS.primary },
  advancedToggle: {
    paddingVertical: 14, marginBottom: 8,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  advancedToggleText: {
    fontSize: FONT.md, color: COLORS.primary, fontWeight: '600',
  },
  advancedBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryBox: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm, padding: 14,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  summaryText: { flex: 1, fontSize: FONT.md, color: COLORS.primaryDark, fontWeight: '600' },
  runBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8,
  },
  runBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
});