import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

export default function NewSimulationStep1() {
  const [planName, setPlanName] = useState('My Plan');
  const [startingAge, setStartingAge] = useState(25);
  const [retirementAge, setRetirementAge] = useState(50);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!planName.trim()) { setError('Plan name is required'); return; }
    if (retirementAge <= startingAge + 10) {
      setError('Retirement age must be at least 10 years after starting age');
      return;
    }
    setError('');
    // Pass params to step 2 via router
    router.push({
      pathname: '/simulation/new-2',
      params: { planName, startingAge, retirementAge },
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

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '33%' }]} />
      </View>
      <Text style={styles.stepLabel}>STEP 1 OF 3 · PERSONAL DETAILS</Text>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Plan Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Plan name</Text>
          <TextInput
            style={styles.input}
            value={planName}
            onChangeText={setPlanName}
            placeholder="e.g. Retirement at 50"
            placeholderTextColor={COLORS.textMuted}
            maxLength={50}
          />
        </View>

        {/* Starting Age */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Starting age</Text>
          <Text style={styles.fieldHint}>Age when you begin saving (18–45)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setStartingAge(Math.max(18, startingAge - 1))}
            >
              <Ionicons name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{startingAge}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setStartingAge(Math.min(45, startingAge + 1))}
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Retirement Age */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Retirement age</Text>
          <Text style={styles.fieldHint}>Age you plan to withdraw (40–70)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setRetirementAge(Math.max(40, retirementAge - 1))}
            >
              <Ionicons name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{retirementAge}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setRetirementAge(Math.min(70, retirementAge + 1))}
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {Math.floor((retirementAge - startingAge) / 5)} periods of 5 years each ·{' '}
            {retirementAge - startingAge} year plan ·{' '}
            {(retirementAge - startingAge) * 12} monthly contributions
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
  progressBar: {
    height: 4, backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 4, backgroundColor: COLORS.primary,
  },
  stepLabel: {
    fontSize: FONT.sm, color: COLORS.textSecondary,
    fontWeight: '600', letterSpacing: 0.5,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: RADIUS.sm,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: COLORS.error, fontSize: FONT.md },
  fieldGroup: { marginBottom: 24 },
  label: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  fieldHint: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: FONT.base, color: COLORS.textPrimary,
  },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 20, paddingVertical: 13,
    backgroundColor: COLORS.surface,
  },
  stepperValue: {
    fontSize: FONT.xl, fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    minWidth: 80, textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row', gap: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm, padding: 14,
    marginBottom: 28,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  infoText: { flex: 1, fontSize: FONT.md, color: COLORS.primaryDark, lineHeight: 22 },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
});