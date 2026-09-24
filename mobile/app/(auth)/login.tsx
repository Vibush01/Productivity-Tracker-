/**
 * Login Screen
 *
 * Uses the auth store for login — on success, the root layout's
 * auth gate automatically navigates to (tabs).
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Input, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Spacing, FontSize } from '../../constants/layout';

export default function LoginScreen() {
  const { colors } = useTheme();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Auth gate in root layout handles navigation
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Branding */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.neon}15` }]}>
              <Ionicons name="flash" size={40} color={colors.neon} />
            </View>
            <ThemedText variant="hero" style={styles.brand}>
              Productivity{'\n'}Tracker
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.tagline}>
              Track habits. Build discipline. Level up.
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: `${colors.danger}12` }]}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <ThemedText variant="caption" color="danger" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              icon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleLogin}
              style={styles.loginBtn}
            >
              Log In
            </Button>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <ThemedText variant="body" color="secondary">
              Don't have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/register">
              <ThemedText variant="body" color="neon" bold>
                Sign Up
              </ThemedText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: FontSize['4xl'],
  },
  tagline: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
});
