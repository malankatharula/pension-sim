import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';

export default function TermsOfUseScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.updated}>Last updated: July 2026</Text>

          <Text style={styles.paragraph}>
            PensionSim was built as a student project for an academic Operations
            Research module. By using this app, you agree to the following terms.
          </Text>

          <Text style={styles.sectionTitle}>Not financial advice</Text>
          <Text style={styles.paragraph}>
            This app is a simulation and planning tool only. It does not provide
            financial, investment, tax, or legal advice, and nothing shown in the app
            should be treated as a recommendation to make any financial decision.
          </Text>

          <Text style={styles.sectionTitle}>Illustrative projections</Text>
          <Text style={styles.paragraph}>
            Retirement corpus projections, inflation erosion figures, and fixed-deposit
            comparisons are illustrative estimates based entirely on the inputs you
            provide and on assumptions drawn from historical Sri Lankan financial data
            (such as average FD rates and inflation figures). Actual future outcomes may
            differ significantly from these projections.
          </Text>

          <Text style={styles.sectionTitle}>Academic purpose</Text>
          <Text style={styles.paragraph}>
            This app exists to demonstrate Operations Research concepts — such as
            compound growth modelling, Monte Carlo simulation, and sensitivity analysis —
            in a practical, interactive form. It is not a commercial product and is not
            maintained to production financial-software standards.
          </Text>

          <Text style={styles.sectionTitle}>No warranty</Text>
          <Text style={styles.paragraph}>
            The app is provided "as is" for educational purposes, without any warranty
            of accuracy, completeness, or fitness for a particular purpose. Use of any
            figures produced by this app for real-world financial planning is at your
            own risk.
          </Text>

          <Text style={styles.sectionTitle}>Changes</Text>
          <Text style={styles.paragraph}>
            These terms may be updated as the project evolves through the course of the
            academic module.
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
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  updated: { fontSize: FONT.sm, color: COLORS.textMuted, marginBottom: 16 },
  sectionTitle: {
    fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary,
    marginTop: 16, marginBottom: 6,
  },
  paragraph: { fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 21 },
});
