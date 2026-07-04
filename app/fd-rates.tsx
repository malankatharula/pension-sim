import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';

const FD_RATES = [
  { bank: 'Commercial Bank',    term: 12, rate: 11.25, min: 'LKR 10,000',  notes: 'Auto-roll available' },
  { bank: 'HNB',               term: 12, rate: 10.75, min: 'LKR 25,000',  notes: 'Senior citizen +0.5%' },
  { bank: 'Sampath Bank',      term: 12, rate: 12.75, min: 'LKR 50,000',  notes: 'Online FD rate' },
  { bank: 'DFCC Bank',         term: 12, rate: 12.50, min: 'LKR 10,000',  notes: 'eFixed Deposit' },
  { bank: "People's Bank",     term: 12, rate: 10.50, min: 'LKR 5,000',   notes: 'State bank guarantee' },
  { bank: 'Bank of Ceylon',    term: 12, rate: 11.00, min: 'LKR 10,000',  notes: 'State bank guarantee' },
  { bank: 'Commercial Bank',   term: 60, rate: 10.50, min: 'LKR 10,000',  notes: '5-year term' },
  { bank: 'NSB',               term: 60, rate: 11.50, min: 'LKR 500',     notes: 'Govt guarantee; no max SLDIS cap' },
  { bank: 'Sampath Bank',      term: 60, rate: 11.75, min: 'LKR 50,000',  notes: '5-year lock' },
  { bank: 'HNB',               term: 60, rate: 10.25, min: 'LKR 25,000',  notes: '5-year term' },
  { bank: 'Commercial Bank',   term: 24, rate: 11.00, min: 'LKR 10,000',  notes: '2-year term' },
  { bank: 'DFCC Bank',         term: 24, rate: 12.00, min: 'LKR 10,000',  notes: 'Online rate' },
  { bank: 'NSB',               term: 24, rate: 11.25, min: 'LKR 500',     notes: 'Govt guarantee' },
  { bank: 'Sampath Bank',      term: 36, rate: 12.00, min: 'LKR 50,000',  notes: '3-year term' },
  { bank: 'HNB',               term: 36, rate: 10.50, min: 'LKR 25,000',  notes: '3-year term' },
];

const TERMS = [
  { label: '1 Year', months: 12 },
  { label: '2 Year', months: 24 },
  { label: '3 Year', months: 36 },
  { label: '5 Year', months: 60 },
];

export default function FDRateExplorerScreen() {
  const [selectedTerm, setSelectedTerm] = useState(12);

  const filtered = FD_RATES
    .filter(r => r.term === selectedTerm)
    .sort((a, b) => b.rate - a.rate);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>FD Rate Explorer</Text>
          <Text style={styles.headerSub}>Last updated: July 2026</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Term filter pills */}
      <View style={styles.termRow}>
        {TERMS.map(({ label, months }) => (
          <TouchableOpacity
            key={months}
            style={[styles.termPill, selectedTerm === months && styles.termPillActive]}
            onPress={() => setSelectedTerm(months)}
          >
            <Text style={[styles.termPillText, selectedTerm === months && styles.termPillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((row, i) => (
          <View key={i} style={[styles.rateCard, i === 0 && styles.rateCardBest]}>
            {i === 0 && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>Best Rate</Text>
              </View>
            )}
            <View style={styles.rateCardTop}>
              <View style={styles.bankInfo}>
                <View style={styles.bankIcon}>
                  <Ionicons name="business-outline" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.bankName}>{row.bank}</Text>
                  <Text style={styles.bankMin}>Min: {row.min}</Text>
                </View>
              </View>
              <Text style={[styles.rateValue, i === 0 && { color: COLORS.primary }]}>
                {row.rate.toFixed(2)}%
              </Text>
            </View>
            {row.notes ? (
              <Text style={styles.rateNotes}>{row.notes}</Text>
            ) : null}
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.disclaimerText}>
            Rates are indicative. Confirm directly with the bank before placing funds. Rates change frequently.
          </Text>
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
  headerSub: { fontSize: FONT.sm, color: COLORS.textSecondary },
  termRow: {
    flexDirection: 'row', gap: 8, padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  termPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
  },
  termPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termPillText: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSecondary },
  termPillTextActive: { color: COLORS.white },
  scroll: { flex: 1, padding: 16 },
  rateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rateCardBest: {
    borderColor: COLORS.primary, borderWidth: 2,
    backgroundColor: '#F0FDFA',
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: 10,
  },
  bestBadgeText: { color: COLORS.white, fontSize: FONT.sm, fontWeight: '700' },
  rateCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  bankName: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary },
  bankMin: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  rateValue: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.textPrimary },
  rateNotes: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 8 },
  disclaimer: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: 14, marginTop: 4,
  },
  disclaimerText: { flex: 1, fontSize: FONT.sm, color: COLORS.textMuted, lineHeight: 20 },
});