import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { COLORS, FONT, RADIUS } from '../../src/lib/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    // Phase 2: supabase.auth.resetPasswordForEmail(email)
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset link
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Reset email sent! Check your inbox and follow the link.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSend}>
              <Text style={styles.primaryBtnText}>Send Reset Email</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 32 },
  backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: '600' },
  title: { fontSize: FONT.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: FONT.md, color: COLORS.textSecondary, marginBottom: 32, lineHeight: 22 },
  fieldGroup: { gap: 6, marginBottom: 16 },
  label: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textPrimary },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FONT.base, color: COLORS.textPrimary,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontSize: FONT.base, fontWeight: '700' },
  successBox: {
    backgroundColor: '#D1FAE5', borderRadius: RADIUS.sm,
    padding: 16, borderWidth: 1, borderColor: '#6EE7B7',
  },
  successText: { color: '#065F46', fontSize: FONT.md, lineHeight: 22 },
});