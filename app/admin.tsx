import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../src/lib/theme';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';

interface ConfigRow {
  key: string;
  value: string;
  description: string | null;
}

interface FdRateRow {
  id: string;
  bank_name: string;
  term_months: number;
  rate: number;
  min_amount: number | null;
  is_active: boolean;
}

export default function AdminPanelScreen() {
  const { isAdmin, initialized } = useAuthStore();
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [originalConfig, setOriginalConfig] = useState<ConfigRow[]>([]);
  const [fdRates, setFdRates] = useState<FdRateRow[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'fd'>('config');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) loadData();
    }, [isAdmin])
  );

  async function loadData() {
    setLoading(true);
    const [configRes, fdRes] = await Promise.all([
      supabase.from('app_config').select('key, value, description').order('key'),
      supabase.from('fd_rates').select('*').order('bank_name'),
    ]);
    if (configRes.data) {
      setConfig(configRes.data);
      setOriginalConfig(configRes.data);
    }
    if (fdRes.data) setFdRates(fdRes.data);
    setLoading(false);
  }

  const updateConfig = (key: string, value: string) => {
    setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    const updates = config.filter((c, i) => c.value !== originalConfig[i]?.value);

    for (const row of updates) {
      const { error } = await supabase
        .from('app_config')
        .update({ value: row.value })
        .eq('key', row.key);
      if (error) {
        setSaving(false);
        Alert.alert('Save failed', `Error saving ${row.key}: ${error.message}`);
        return;
      }
    }
    setOriginalConfig(config);
    setSaving(false);
    Alert.alert('Saved', 'All config changes saved successfully.');
  };

  const handleToggleActive = async (row: FdRateRow) => {
    const { error } = await supabase
      .from('fd_rates')
      .update({ is_active: !row.is_active })
      .eq('id', row.id);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setFdRates((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  if (!initialized) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
          <Ionicons name="lock-closed-outline" size={48} color={COLORS.textMuted} />
          <Text style={{ fontSize: FONT.lg, fontWeight: '700', color: COLORS.textPrimary }}>
            Admin access required
          </Text>
          <Text style={{ fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center' }}>
            You don't have permission to view this page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 36 }} />
      </View>

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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>Loading…</Text>
        ) : activeTab === 'config' ? (
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
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveConfig}
              disabled={saving}
            >
              <Ionicons name="save-outline" size={18} color={COLORS.white} />
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save All Changes'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionNote}>
              Manage FD rates displayed in the FD Rate Explorer. Toggle active/inactive to show or hide from users.
            </Text>

            {fdRates.map((row) => (
              <View key={row.id} style={styles.fdRow}>
                <View style={styles.fdRowLeft}>
                  <View style={styles.bankIcon}>
                    <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.fdBankName}>{row.bank_name}</Text>
                    <Text style={styles.fdMeta}>
                      {row.term_months} months · {(row.rate * 100).toFixed(2)}%
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleToggleActive(row)}>
                  <View style={[
                    styles.activeBadge,
                    { backgroundColor: row.is_active ? '#D1FAE5' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.activeBadgeText,
                      { color: row.is_active ? COLORS.success : COLORS.textMuted }
                    ]}>
                      {row.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </>
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
    color: COLORS.primary, minWidth: 90, textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
  fdRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: 14,
    marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
  },
  fdRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  bankIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  fdBankName: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary, flexShrink: 1 },
  fdMeta: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  activeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  activeBadgeText: { fontSize: FONT.sm, fontWeight: '700' },
});