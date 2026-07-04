import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

const DUMMY_SIMS = [
  { id: '1', name: 'Retirement at 50',      date: 'Jun 2026', ageRange: '25–50', conservative: 'LKR 45.6M', dualVehicle: 'LKR 60.0M' },
  { id: '2', name: 'Early FD Plus',         date: 'May 2026', ageRange: '22–50', conservative: 'LKR 38.1M', dualVehicle: 'LKR 51.2M' },
  { id: '3', name: 'Conservative Baseline', date: 'Apr 2026', ageRange: '25–50', conservative: 'LKR 27.2M', dualVehicle: 'LKR 36.4M' },
  { id: '4', name: 'High Contribution Test',date: 'Mar 2026', ageRange: '25–55', conservative: 'LKR 58.9M', dualVehicle: 'LKR 78.3M' },
  { id: '5', name: 'Delayed Start Scenario',date: 'Feb 2026', ageRange: '30–55', conservative: 'LKR 33.5M', dualVehicle: 'LKR 44.1M' },
];

type SortKey = 'Newest' | 'Oldest' | 'Highest Corpus';

export default function SimulationsScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('Newest');

  const filtered = DUMMY_SIMS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Simulations</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/simulation/new')}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plans..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {/* Sort pills */}
        <View style={styles.sortRow}>
          {(['Newest', 'Oldest', 'Highest Corpus'] as SortKey[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortPill, sort === s && styles.sortPillActive]}
              onPress={() => setSort(s)}
            >
              <Text style={[styles.sortPillText, sort === s && styles.sortPillTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No plans found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          filtered.map((sim) => (
            <TouchableOpacity
              key={sim.id}
              style={styles.simCard}
              onPress={() => router.push('/simulation/results')}
            >
              <View style={styles.simCardTop}>
                <View style={styles.simIconBox}>
                  <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.simInfo}>
                  <Text style={styles.simName}>{sim.name}</Text>
                  <Text style={styles.simMeta}>Age {sim.ageRange} · {sim.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
              <View style={styles.simCardBottom}>
                <View style={styles.corpusBadge}>
                  <Text style={styles.corpusBadgeLabel}>Conservative</Text>
                  <Text style={styles.corpusBadgeValue}>{sim.conservative}</Text>
                </View>
                <View style={[styles.corpusBadge, { borderColor: '#8B5CF6' }]}>
                  <Text style={styles.corpusBadgeLabel}>Dual-Vehicle</Text>
                  <Text style={[styles.corpusBadgeValue, { color: '#8B5CF6' }]}>
                    {sim.dualVehicle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.textPrimary },
  newBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  controls: { padding: 16, gap: 10 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: FONT.md, color: COLORS.textPrimary },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sortPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortPillText: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: '600' },
  sortPillTextActive: { color: COLORS.white },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textSecondary },
  emptySubtitle: { fontSize: FONT.md, color: COLORS.textMuted },
  simCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  simCardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  simIconBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  simInfo: { flex: 1 },
  simName: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary },
  simMeta: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  simCardBottom: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 14, paddingBottom: 14,
  },
  corpusBadge: {
    flex: 1, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.primary,
    padding: 10, alignItems: 'center',
  },
  corpusBadgeLabel: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 2 },
  corpusBadgeValue: { fontSize: FONT.md, fontWeight: '800', color: COLORS.primary },
});