import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useMemo } from 'react';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { useSimulationStore } from '../../src/store/simulationStore';

type SortKey = 'Newest' | 'Oldest' | 'Highest Corpus';

const fmtM = (n: number) => (n / 1e6).toFixed(1);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function SimulationsScreen() {
  const { savedList, loadingList, loadSavedList, deleteById } = useSimulationStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('Newest');

  useFocusEffect(
    useCallback(() => {
      loadSavedList();
    }, [])
  );

  const filtered = useMemo(() => {
    let list = savedList.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'Newest') {
      list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sort === 'Oldest') {
      list = [...list].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    } else {
      list = [...list].sort((a, b) => b.conservativeFinal - a.conservativeFinal);
    }
    return list;
  }, [savedList, search, sort]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete plan?', `Delete "${name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteById(id);
          if (error) Alert.alert('Delete failed', error);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
        <View style={styles.sortRow}>
          {(['Newest', 'Oldest', 'Highest Corpus'] as SortKey[]).map((s) => (
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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loadingList ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptySubtitle}>Loading…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>
              {savedList.length === 0 ? 'No saved plans yet' : 'No plans found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {savedList.length === 0 ? 'Tap + to create your first' : 'Try a different search term'}
            </Text>
          </View>
        ) : (
          filtered.map((sim) => (
            <TouchableOpacity
              key={sim.id}
              style={styles.simCard}
              onPress={() => router.push({ pathname: '/simulation/results', params: { id: sim.id } })}
              onLongPress={() => handleDelete(sim.id, sim.name)}
            >
              <View style={styles.simCardTop}>
                <View style={styles.simIconBox}>
                  <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.simInfo}>
                  <Text style={styles.simName}>{sim.name}</Text>
                  <Text style={styles.simMeta}>
                    Age {sim.startingAge}–{sim.retirementAge} · {fmtDate(sim.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(sim.id, sim.name)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.simCardBottom}>
                <View style={styles.corpusBadge}>
                  <Text style={styles.corpusBadgeLabel}>Conservative</Text>
                  <Text style={styles.corpusBadgeValue}>LKR {fmtM(sim.conservativeFinal)}M</Text>
                </View>
                <View style={[styles.corpusBadge, { borderColor: '#8B5CF6' }]}>
                  <Text style={styles.corpusBadgeLabel}>Dual-Vehicle</Text>
                  <Text style={[styles.corpusBadgeValue, { color: '#8B5CF6' }]}>
                    LKR {fmtM(sim.dualVehicleFinal)}M
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
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