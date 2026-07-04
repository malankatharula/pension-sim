import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NP</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Nadeesha Perera</Text>
            <Text style={styles.profileEmail}>nadeesha@example.com</Text>
          </View>
        </View>

        {/* Account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <SettingsRow icon="person-outline"    label="Display name"     value="Nadeesha Perera" />
          <SettingsRow icon="mail-outline"      label="Email"            value="nadeesha@example.com" tappable={false} />
          <SettingsRow icon="lock-closed-outline" label="Change password" onPress={() => {}} />
          <SettingsRow icon="calendar-outline"  label="Date of birth"    value="Jan 1, 1999" last />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <SettingsRow icon="cash-outline"      label="Currency"         value="LKR" />
          <SettingsRow icon="refresh-outline"   label="Reset to defaults" onPress={() => {}} last />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.menuCard}>
          <SettingsRow icon="information-circle-outline" label="App version" value="1.0.0" tappable={false} />
          <SettingsRow icon="shield-outline"    label="Privacy policy"   onPress={() => {}} />
          <SettingsRow icon="document-outline" label="Terms of use"     onPress={() => {}} />
          <SettingsRow icon="star-outline"     label="Rate this app"    onPress={() => {}} last />
        </View>

        {/* Admin link */}
        <Text style={styles.sectionLabel}>ADMIN</Text>
        <View style={styles.menuCard}>
          <SettingsRow
            icon="settings-outline"
            label="Admin Panel"
            onPress={() => router.push('/admin')}
            last
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon, label, value, onPress, last = false, tappable = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  tappable?: boolean;
}) {
  const Row = tappable && onPress ? TouchableOpacity : View;
  return (
    <Row
      style={[styles.menuRow, last && styles.menuRowLast]}
      onPress={onPress}
    >
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        {tappable && onPress && (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        )}
      </View>
    </Row>
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
  scroll: { flex: 1, padding: 16 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: FONT.lg, fontWeight: '800' },
  profileName: { fontSize: FONT.base, fontWeight: '700', color: COLORS.textPrimary },
  profileEmail: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: {
    fontSize: FONT.sm, fontWeight: '700',
    color: COLORS.textMuted, letterSpacing: 0.8,
    marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textPrimary },
  menuRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuValue: { fontSize: FONT.md, color: COLORS.textSecondary },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FECACA',
    marginBottom: 10,
  },
  signOutText: { fontSize: FONT.base, fontWeight: '700', color: COLORS.error },
});