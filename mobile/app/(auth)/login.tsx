/**
 * Login Screen
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Input, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize } from '../../constants/layout';
import { api } from '../../services/api';
import { secureStorage, storage } from '../../services/storage';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        await secureStorage.setToken(data.data.token);
        await storage.set('user', data.data.user);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            <Ionicons name="flash" size={48} color={colors.neon} />
            <ThemedText variant="hero" style={styles.brand}>
              Productivity{'\n'}Tracker
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.tagline}>
              Track your habits. Build your future.
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <ThemedText variant="caption" color="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              icon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoComplete="password"
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
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
