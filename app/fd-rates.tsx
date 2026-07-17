import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';
import { supabase } from '../src/lib/supabase';

const TERMS = [
  { label: '1 Year', months: 12 },
  { label: '2 Year', months: 24 },
  { label: '3 Year', months: 36 },
  { label: '5 Year', months: 60 },
];

interface FdRateRow {
  id: string;
  bank_name: string;
  term_months: number;
  rate: number;
  min_amount: number | null;
  notes: string | null;
  as_of_date: string;
}

export default function FDRateExplorerScreen() {
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [rates, setRates] = useState<FdRateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRates();
    }, [])
  );

  async function fetchRates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('fd_rates')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setRates(data);
    }
    setLoading(false);
  }

  const filtered = useMemo(
    () =>
      rates
        .filter((r) => r.term_months === selectedTerm)
        .sort((a, b) => b.rate - a.rate),
    [rates, selectedTerm]
  );

  const lastUpdated = useMemo(() => {
    if (rates.length === 0) return '—';
    const latest = rates.reduce((max, r) => (r.as_of_date > max ? r.as_of_date : max), rates[0].as_of_date);
    return new Date(latest).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [rates]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>FD Rate Explorer</Text>
          <Text style={styles.headerSub}>Last updated: {lastUpdated}</Text>
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
        {loading ? (
          <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 40 }}>
            Loading rates…
          </Text>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
            <Ionicons name="business-outline" size={40} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>
              No rates available for this term yet
            </Text>
          </View>
        ) : (
          filtered.map((row, i) => (
            <View key={row.id} style={[styles.rateCard, i === 0 && styles.rateCardBest]}>
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
                    <Text style={styles.bankName}>{row.bank_name}</Text>
                    <Text style={styles.bankMin}>
                      Min: {row.min_amount ? `LKR ${row.min_amount.toLocaleString()}` : '—'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.rateValue, i === 0 && { color: COLORS.primary }]}>
                  {(row.rate * 100).toFixed(2)}%
                </Text>
              </View>
              {row.notes ? (
                <Text style={styles.rateNotes}>{row.notes}</Text>
              ) : null}
            </View>
          ))
        )}

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
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  bankIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  bankName: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary, flexShrink: 1 },
  bankMin: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  rateValue: { fontSize: FONT.xxl, fontWeight: '900', color: COLORS.textPrimary },
  rateNotes: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 8 },
  disclaimer: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: 14, marginTop: 4,
  },
  disclaimerText: { flex: 1, fontSize: FONT.sm, color: COLORS.textMuted, lineHeight: 20 },
});