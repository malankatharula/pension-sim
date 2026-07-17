import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useSimulationStore } from '../../src/store/simulationStore';

export default function SettingsScreen() {
  const { user, profile, isAdmin, setProfile } = useAuthStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: nameInput.trim() })
      .eq('id', user.id)
      .select()
      .single();
    setSavingName(false);

    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setProfile(data);
    setEditingName(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: 'pensionsim://auth/reset',
    });
    setSendingReset(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Email sent', `A password reset link was sent to ${user.email}.`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset local settings?',
      'This clears locally cached simulation state on this device. Your saved plans in the cloud are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            useSimulationStore.getState().clear();
            Alert.alert('Done', 'Local state cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* Account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          {editingName ? (
            <View style={[styles.menuRow, { flexDirection: 'column', alignItems: 'stretch', gap: 8 }]}>
              <Text style={styles.menuLabel}>Display name</Text>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleSaveName}
                  disabled={savingName}
                >
                  <Text style={{ color: COLORS.white, fontWeight: '700' }}>
                    {savingName ? 'Saving…' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }]}
                  onPress={() => { setEditingName(false); setNameInput(profile?.full_name ?? ''); }}
                >
                  <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingsRow
              icon="person-outline"
              label="Display name"
              value={displayName}
              onPress={() => setEditingName(true)}
            />
          )}
          <SettingsRow icon="mail-outline" label="Email" value={user?.email ?? '—'} tappable={false} />
          <SettingsRow
            icon="lock-closed-outline"
            label={sendingReset ? 'Sending…' : 'Change password'}
            onPress={handleChangePassword}
            last
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <SettingsRow icon="cash-outline" label="Currency" value="LKR" tappable={false} />
          <SettingsRow icon="refresh-outline" label="Reset local state" onPress={handleResetDefaults} last />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.menuCard}>
          <SettingsRow icon="information-circle-outline" label="App version" value="1.0.0" tappable={false} />
          <SettingsRow icon="shield-outline" label="Privacy policy" onPress={() => {}} />
          <SettingsRow icon="document-outline" label="Terms of use" onPress={() => {}} last />
        </View>

        {/* Admin link — only shown to admins */}
        {isAdmin && (
          <>
            <Text style={styles.sectionLabel}>ADMIN</Text>
            <View style={styles.menuCard}>
              <SettingsRow
                icon="settings-outline"
                label="Admin Panel"
                onPress={() => router.push('/admin')}
                last
              />
            </View>
          </>
        )}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
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
    <Row style={[styles.menuRow, last && styles.menuRowLast]} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {value && <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>}
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
  menuRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, marginLeft: 8 },
  menuValue: { fontSize: FONT.md, color: COLORS.textSecondary, flexShrink: 1 },
  nameInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: FONT.md, color: COLORS.textPrimary,
  },
  smallBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm,
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FECACA',
    marginBottom: 10,
  },
  signOutText: { fontSize: FONT.base, fontWeight: '700', color: COLORS.error },
});