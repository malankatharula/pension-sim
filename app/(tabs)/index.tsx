import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { useAuthStore } from '../../src/store/authStore';



const DUMMY_LATEST = {
  name: 'Retirement at 50',
  createdAt: 'June 2026',
  conservativeCorpus: 'LKR 45.6M',
  realCorpus: 'LKR 6.2M',
};

const DUMMY_SIMULATIONS = [
  { id: '1', name: 'Retirement at 50', date: 'Jun 2026', corpus: 'LKR 45.6M' },
  { id: '2', name: 'Early FD Plus', date: 'May 2026', corpus: 'LKR 38.1M' },
  { id: '3', name: 'Conservative Baseline', date: 'Apr 2026', corpus: 'LKR 27.2M' },
];

const INSIGHTS = [
  'At 10% p.a., interest earned is 2.5× what you deposit. Start early.',
  'Delaying savings by 1 year permanently costs LKR 1.5–2.5M at retirement.',
  'Sri Lanka\'s 10-year avg inflation is 8.9%. Your FD rate must beat this.',
  'The dual-vehicle FD model adds LKR 32M vs a single-rate 6% plan.',
  'Automating your savings is more powerful than optimising your rate.',
];

const todayInsight = INSIGHTS[new Date().getDay() % INSIGHTS.length];

export default function HomeScreen() {
  const { profile, user } = useAuthStore();
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.greetingSub}>Your retirement plan is on track</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Latest Plan Card ── */}
        <View style={styles.latestCard}>
          <View style={styles.latestCardHeader}>
            <Text style={styles.latestCardLabel}>YOUR LATEST PLAN</Text>
            <TouchableOpacity onPress={() => router.push('/simulation/results')}>
              <Text style={styles.viewLink}>View →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.latestCardName}>{DUMMY_LATEST.name}</Text>
          <Text style={styles.latestCardDate}>Created {DUMMY_LATEST.createdAt}</Text>
          <View style={styles.corpusRow}>
            <View style={styles.corpusItem}>
              <Text style={styles.corpusValue}>{DUMMY_LATEST.conservativeCorpus}</Text>
              <Text style={styles.corpusLabel}>Nominal Corpus</Text>
            </View>
            <View style={styles.corpusDivider} />
            <View style={styles.corpusItem}>
              <Text style={[styles.corpusValue, { color: COLORS.warning }]}>
                {DUMMY_LATEST.realCorpus}
              </Text>
              <Text style={styles.corpusLabel}>Real Value</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction
            icon="add-circle-outline"
            label="New Simulation"
            onPress={() => router.push('/simulation/new')}
          />
          <QuickAction
            icon="flag-outline"
            label="My Goals"
            onPress={() => router.push('/(tabs)/goals')}
          />
          <QuickAction
            icon="trending-up-outline"
            label="Inflation Calc"
            onPress={() => router.push('/inflation-calc')}
          />
          <QuickAction
            icon="business-outline"
            label="FD Rates"
            onPress={() => router.push('/fd-rates')}
          />
        </View>

        {/* ── Recent Simulations ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Simulations</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/simulations')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_SIMULATIONS.map((sim) => (
          <TouchableOpacity
            key={sim.id}
            style={styles.simRow}
            onPress={() => router.push('/simulation/results')}
          >
            <View style={styles.simRowLeft}>
              <View style={styles.simIcon}>
                <Ionicons name="bar-chart-outline" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.simName}>{sim.name}</Text>
                <Text style={styles.simDate}>{sim.date}</Text>
              </View>
            </View>
            <View style={styles.simRowRight}>
              <Text style={styles.simCorpus}>{sim.corpus}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {/* ── Insight of the Day ── */}
        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
            <Text style={styles.insightTitle}>Insight of the Day</Text>
          </View>
          <Text style={styles.insightText}>{todayInsight}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-component ──
function QuickAction({
  icon, label, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.qaCard} onPress={onPress}>
      <View style={styles.qaIconBox}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 20, paddingBottom: 20,
  },
  greeting: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.textPrimary },
  greetingSub: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  // Latest card
  latestCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 20, marginBottom: 24,
  },
  latestCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
  },
  latestCardLabel: {
    fontSize: FONT.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '600', letterSpacing: 0.5,
  },
  viewLink: { fontSize: FONT.sm, color: COLORS.white, fontWeight: '700' },
  latestCardName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  latestCardDate: { fontSize: FONT.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  corpusRow: { flexDirection: 'row', alignItems: 'center' },
  corpusItem: { flex: 1 },
  corpusValue: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.white },
  corpusLabel: { fontSize: FONT.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  corpusDivider: {
    width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16,
  },

  // Section titles
  sectionTitle: {
    fontSize: FONT.base, fontWeight: '700',
    color: COLORS.textPrimary, marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  seeAll: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },

  // Quick actions
  quickActions: {
    flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap',
  },
  qaCard: {
    flex: 1, minWidth: '22%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 12,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  qaIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  qaLabel: {
    fontSize: FONT.sm, color: COLORS.textPrimary,
    fontWeight: '600', textAlign: 'center',
  },

  // Sim rows
  simRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  simRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  simIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  simName: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textPrimary },
  simDate: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  simRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  simCorpus: { fontSize: FONT.md, fontWeight: '700', color: COLORS.primary },

  // Insight
  insightBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md, padding: 16,
    marginTop: 8,
    borderWidth: 1, borderColor: '#99F6E4',
  },
  insightHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  insightTitle: { fontSize: FONT.md, fontWeight: '700', color: COLORS.primaryDark },
  insightText: { fontSize: FONT.md, color: COLORS.primaryDark, lineHeight: 22 },
});