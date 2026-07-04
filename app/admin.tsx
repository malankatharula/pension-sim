import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';

const DEFAULT_CONFIG = [
  { key: 'default_starting_age',      value: '25',     description: 'Default age shown in wizard step 1' },
  { key: 'default_retirement_age',    value: '50',     description: 'Default retirement age' },
  { key: 'default_rate_conservative', value: '0.0600', description: 'Conservative annual FD rate' },
  { key: 'default_rate_optimistic',   value: '0.1000', description: 'Optimistic annual FD rate' },
  { key: 'default_rate_fd_lock',      value: '0.1200', description: 'FD corpus lock rate — dual vehicle' },
  { key: 'default_rate_liquid',       value: '0.0900', description: 'Liquid savings track rate' },
  { key: 'default_inflation_rate',    value: '0.0890', description: 'Long-run inflation baseline' },
  { key: 'default_wht_rate',          value: '0.0500', description: 'Withholding tax on interest income' },
  { key: 'default_mc_iterations',     value: '5000',   description: 'Monte Carlo iteration count' },
  { key: 'default_mc_mu',             value: '0.1000', description: 'Vasicek mean rate for MC' },
  { key: 'default_mc_sigma',          value: '0.0250', description: 'Vasicek sigma (rate volatility)' },
];

const DUMMY_FD_BANKS = [
  { id: '1', bank: 'Commercial Bank', term: 12, rate: '11.25', active: true },
  { id: '2', bank: 'HNB',            term: 12, rate: '10.75', active: true },
  { id: '3', bank: 'Sampath Bank',   term: 12, rate: '12.75', active: true },
  { id: '4', bank: 'NSB',            term: 60, rate: '11.50', active: true },
];

export default function AdminPanelScreen() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'fd'>('config');

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'config' && styles.tabActive]}
          onPress={() => setActiveTab('config')}
        >
          <Text style={[styles.tabText, activeTab === 'config' && styles.tabTextActive]}>
            App Config
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fd' && styles.tabActive]}
          onPress={() => setActiveTab('fd')}
        >
          <Text style={[styles.tabText, activeTab === 'fd' && styles.tabTextActive]}>
            FD Rate Manager
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'config' && (
          <>
            <Text style={styles.sectionNote}>
              Edit global defaults. Changes apply to all new simulations. No code deploy needed.
            </Text>

            {config.map(({ key, value, description }) => (
              <View key={key} style={styles.configRow}>
                <View style={styles.configLeft}>
                  <Text style={styles.configKey}>{key}</Text>
                  <Text style={styles.configDesc}>{description}</Text>
                </View>
                <TextInput
                  style={styles.configInput}
                  value={value}
                  onChangeText={(v) => updateConfig(key, v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}

            {saved && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                <Text style={styles.successText}>All changes saved successfully</Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="save-outline" size={18} color={COLORS.white} />
              <Text style={styles.saveBtnText}>Save All Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { setConfig(DEFAULT_CONFIG); setSaved(false); }}
            >
              <Text style={styles.resetBtnText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'fd' && (
          <>
            <Text style={styles.sectionNote}>
              Manage FD rates displayed in the FD Rate Explorer. Toggle active/inactive to show or hide from users.
            </Text>

            {DUMMY_FD_BANKS.map((row) => (
              <View key={row.id} style={styles.fdRow}>
                <View style={styles.fdRowLeft}>
                  <View style={styles.bankIcon}>
                    <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.fdBankName}>{row.bank}</Text>
                    <Text style={styles.fdMeta}>{row.term} months · {row.rate}%</Text>
                  </View>
                </View>
                <View style={styles.fdRowRight}>
                  <View style={[
                    styles.activeBadge,
                    { backgroundColor: row.active ? '#D1FAE5' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.activeBadgeText,
                      { color: row.active ? COLORS.success : COLORS.textMuted }
                    ]}>
                      {row.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.addBtnText}>+ Add new rate</Text>
            </TouchableOpacity>
          </>
        )}

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
    backgroundColor: COLORS.primary,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.white },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  scroll: { flex: 1, padding: 16 },
  sectionNote: {
    fontSize: FONT.md, color: COLORS.textSecondary,
    lineHeight: 22, marginBottom: 16,
  },
  configRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  configLeft: { flex: 1 },
  configKey: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  configDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  configInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: FONT.md, fontWeight: '700',
    color: COLORS.primary, minWidth: 80, textAlign: 'right',
  },
  successBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: '#D1FAE5', borderRadius: RADIUS.sm,
    padding: 12, marginBottom: 10,
  },
  successText: { fontSize: FONT.md, color: '#065F46', fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, marginBottom: 10,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
  resetBtn: {
    borderRadius: RADIUS.sm, paddingVertical: 13,
    alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  resetBtnText: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textSecondary },
  fdRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
  },
  fdRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  fdBankName: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary },
  fdMeta: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  fdRowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  activeBadgeText: { fontSize: FONT.sm, fontWeight: '700' },
  editBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
    borderRadius: RADIUS.md, marginTop: 4,
    borderWidth: 2, borderColor: COLORS.primary,
    borderStyle: 'dashed', backgroundColor: COLORS.surface,
  },
  addBtnText: { fontSize: FONT.md, fontWeight: '700', color: COLORS.primary },
});